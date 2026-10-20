#!/usr/bin/env python3
"""Small deliberately vulnerable login target for the TrustX oracle demo."""

import json
import argparse
import os
import sqlite3
import tempfile
import threading
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlencode, unquote_plus
from urllib.request import Request, urlopen


VULNERABLE_SOURCE = open(__file__, "r", encoding="utf-8").read()


class LoginHandler(BaseHTTPRequestHandler):
    db_path = ""
    vulnerable = True

    def log_message(self, _format, *_args):
        return

    def _send(self, status, body, headers=None):
        payload = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(payload)

    def _send_page(self, status, title, message, tone="neutral", headers=None):
        colors = {
            "neutral": ("#dbeafe", "#172554"),
            "success": ("#bbf7d0", "#14532d"),
            "danger": ("#fecaca", "#7f1d1d"),
        }
        foreground, background = colors.get(tone, colors["neutral"])
        body = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title} · TrustX Login Fixture</title>
    <style>
      :root {{ color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }}
      body {{ margin: 0; min-height: 100vh; display: grid; place-items: center; background: #08111f; color: #e2e8f0; }}
      main {{ width: min(92vw, 520px); padding: 32px; border: 1px solid #1e3a5f; border-radius: 20px; background: #0f1d31; box-shadow: 0 24px 80px #0008; }}
      .eyebrow {{ color: #67e8f9; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }}
      h1 {{ margin: 10px 0 8px; font-size: 28px; }}
      p {{ color: #94a3b8; line-height: 1.6; }}
      label {{ display: block; margin-top: 18px; color: #cbd5e1; font-size: 14px; }}
      input {{ box-sizing: border-box; width: 100%; margin-top: 8px; padding: 12px 14px; border: 1px solid #334155; border-radius: 10px; background: #08111f; color: white; }}
      button {{ margin-top: 22px; width: 100%; padding: 12px; border: 0; border-radius: 10px; background: #2563eb; color: white; font-weight: 700; cursor: pointer; }}
      .result {{ margin-top: 22px; padding: 14px; border-radius: 10px; color: {foreground}; background: {background}; white-space: pre-wrap; }}
      code {{ color: #bae6fd; }}
      a {{ color: #67e8f9; }}
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">TrustX isolated demo target</div>
      <h1>{title}</h1>
      <p>This is the pinned login fixture used by the TrustX oracle. It is intentionally vulnerable for demonstration and runs only on localhost.</p>
      <form method="post" action="/login">
        <label>Username<input name="username" autocomplete="username" autofocus></label>
        <label>Password<input name="password" type="password" autocomplete="current-password"></label>
        <button type="submit">Log in</button>
      </form>
      <div class="result">{message}</div>
      <p><a href="/admin">Open protected /admin resource</a></p>
    </main>
  </body>
</html>"""
        self._send(status, body, {"Content-Type": "text/html; charset=utf-8", **(headers or {})})

    def do_GET(self):
        if self.path == "/":
            self._send_page(
                HTTPStatus.OK,
                "TrustX Login Fixture",
                "Normal login behavior: admin / admin-password should succeed; an incorrect password should fail.",
            )
            return
        if self.path != "/admin":
            self._send(HTTPStatus.NOT_FOUND, "Not found")
            return
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        username = cookie.get("session")
        if not username:
            self._send_page(HTTPStatus.UNAUTHORIZED, "Admin access denied", "401 Unauthorized\nLogin required.", "danger")
            return
        with sqlite3.connect(self.db_path) as connection:
            row = connection.execute("SELECT role FROM users WHERE username = ?", (username.value,)).fetchone()
        if not row or row[0] != "admin":
            self._send_page(HTTPStatus.FORBIDDEN, "Admin access denied", "403 Forbidden\nAdmin access required.", "danger")
            return
        self._send_page(HTTPStatus.OK, "Admin page reached", "200 OK\nADMIN_SECRET=trustx-demo-only\n\nThis is the protected resource the oracle checks.", "success")

    def do_POST(self):
        if self.path != "/login":
            self._send(HTTPStatus.NOT_FOUND, "Not found")
            return
        length = int(self.headers.get("Content-Length", "0"))
        form = parse_qs(self.rfile.read(length).decode("utf-8"), keep_blank_values=True)
        username = form.get("username", [""])[0]
        password = form.get("password", [""])[0]
        with sqlite3.connect(self.db_path) as connection:
            if self.vulnerable:
                query = "SELECT username, role FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
                row = connection.execute(query).fetchone()
            else:
                row = connection.execute(
                    "SELECT username, role FROM users WHERE username = ? AND password = ?",
                    (username, password),
                ).fetchone()
        if not row:
            self._send_page(HTTPStatus.UNAUTHORIZED, "Login failed", "401 Unauthorized\nInvalid credentials.", "danger")
            return
        self._send_page(
            HTTPStatus.OK,
            "Login successful",
            f"200 OK\nAuthenticated as {row[0]}.\n\nOpen /admin to test access to the protected resource.",
            "success",
            {"Set-Cookie": f"session={row[0]}; HttpOnly"},
        )


def start_target(vulnerable=True, port=0):
    database = tempfile.NamedTemporaryFile(prefix="trustx-login-", suffix=".db", delete=False)
    database.close()
    with sqlite3.connect(database.name) as connection:
        connection.execute("CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT, role TEXT NOT NULL)")
        connection.executemany(
            "INSERT INTO users VALUES (?, ?, ?)",
            [("alice", "alice-password", "user"), ("admin", "admin-password", "admin")],
        )
        connection.commit()
    LoginHandler.db_path = database.name
    LoginHandler.vulnerable = vulnerable
    server = ThreadingHTTPServer(("127.0.0.1", port), LoginHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, database.name


def serve_demo(vulnerable=True, port=8788):
    server, database_path = start_target(vulnerable, port)
    print(f"TrustX login fixture running at http://127.0.0.1:{server.server_port}", flush=True)
    print("Vulnerable mode: SQL injection authentication bypass is intentionally enabled.", flush=True)
    print("Press Ctrl+C to stop the demo target.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Stopping TrustX login fixture.", flush=True)
    finally:
        server.shutdown()
        server.server_close()
        try:
            os.unlink(database_path)
        except OSError:
            pass


def request(base_url, method, path, data=None, cookie=None):
    body = urlencode(data or {}).encode("utf-8") if data is not None else None
    headers = {"Content-Type": "application/x-www-form-urlencoded"} if body else {}
    if cookie:
        headers["Cookie"] = cookie
    response = urlopen(Request(f"{base_url}{path}", data=body, headers=headers, method=method), timeout=2)
    return response.status, response.headers.get("Set-Cookie", ""), response.read().decode("utf-8")


def safe_request(base_url, method, path, data=None, cookie=None):
    try:
        return request(base_url, method, path, data, cookie)
    except Exception as error:
        status = getattr(error, "code", 599)
        return status, "", str(error)


def execute(vulnerable=True):
    server, database_path = start_target(vulnerable)
    base_url = f"http://127.0.0.1:{server.server_port}"
    try:
        good_status, good_cookie, _ = safe_request(base_url, "POST", "/login", {"username": "admin", "password": "admin-password"})
        bad_status, _, _ = safe_request(base_url, "POST", "/login", {"username": "admin", "password": "wrong"})
        anonymous_status, _, _ = safe_request(base_url, "GET", "/admin")
        exploit_status, exploit_cookie, _ = safe_request(
            base_url,
            "POST",
            "/login",
            {"username": "admin' --", "password": "anything"},
        )
        protected_status, _, protected_body = safe_request(base_url, "GET", "/admin", cookie=exploit_cookie)
        reproduced = exploit_status == 200 and protected_status == 200 and "ADMIN_SECRET" in protected_body
        return {
            "status": "passed" if reproduced else "failed",
            "runtimeStatus": "passed" if reproduced else "failed",
            "vulnerabilityReproduced": reproduced,
            "coveragePercentage": 100,
            "targetId": "trustx-login-sqli-v1" if vulnerable else "trustx-login-sqli-fixed-v1",
            "targetVersion": "trustx-login-sqli-v1" if vulnerable else "trustx-login-sqli-fixed-v1",
            "securityRule": "Unauthenticated input must not reach the admin-only resource.",
            "protectedResourceReached": reproduced,
            "requestTrace": [
                "POST /login (valid credentials)",
                "POST /login (invalid credentials)",
                "GET /admin (anonymous)",
                "POST /login (SQL injection reproduction)",
                "GET /admin (reproduction session)",
            ],
            "responseStatuses": [good_status, bad_status, anonymous_status, exploit_status, protected_status],
            "logs": [
                f"Correct credentials returned HTTP {good_status}.",
                f"Incorrect credentials returned HTTP {bad_status}.",
                f"Anonymous admin access returned HTTP {anonymous_status}.",
                f"SQL injection reproduction returned HTTP {exploit_status}.",
                f"Protected admin request returned HTTP {protected_status}.",
                "Vulnerability reproduced: authentication bypass." if reproduced else "Vulnerability not reproduced.",
            ],
            "vulnerabilityCategory": "SQL injection authentication bypass" if reproduced else "Authentication bypass not reproduced",
        }
    finally:
        server.shutdown()
        server.server_close()
        try:
            import os
            os.unlink(database_path)
        except OSError:
            pass


def analyze_source(vulnerable=True):
    import ast
    import hashlib

    source = VULNERABLE_SOURCE if vulnerable else VULNERABLE_SOURCE.replace(
        'query = "SELECT username, role FROM users WHERE username = \'" + username + "\' AND password = \'" + password + "\'"',
        'query = "SELECT username, role FROM users WHERE username = ? AND password = ?"',
    )
    tree = ast.parse(source)
    findings = []
    finding_lines = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            names = {child.id for child in ast.walk(node) if isinstance(child, ast.Name)}
            if {"username", "password"} & names and node.lineno not in finding_lines:
                finding_lines.add(node.lineno)
                findings.append({
                    "ruleId": "PY-SQL-UNSAFE-CONCAT",
                    "severity": "high",
                    "file": "login_fixture.py",
                    "line": node.lineno,
                    "explanation": "User input is joined directly into a SQL query.",
                })
    return {
        "sourceHash": "0x" + hashlib.sha256(source.encode()).hexdigest(),
        "astStatus": "passed",
        "astFindings": findings,
    }


def main():
    parser = argparse.ArgumentParser(description="TrustX login fixture worker or visible local demo target")
    parser.add_argument("--serve", action="store_true", help="keep the fixture running as a browser-visible local target")
    parser.add_argument("--fixed", action="store_true", help="serve the patched parameterized-query version")
    parser.add_argument("--port", type=int, default=8788, help="local demo port")
    args = parser.parse_args()
    if args.serve:
        serve_demo(vulnerable=not args.fixed, port=args.port)
        return
    payload = json.load(__import__("sys").stdin)
    if payload.get("targetId") not in {"trustx-login-sqli-v1", "trustx-login-sqli-fixed-v1"}:
        raise ValueError("Unsupported login target")
    steps = [line.strip() for line in str(payload.get("reproductionSteps", "")).splitlines() if line.strip()]
    if len(steps) != 4 or steps[0] != "POST /login" or steps[3] != "GET /admin" or not steps[1].startswith("username=") or not steps[2].startswith("password="):
        print(json.dumps({
            "targetId": payload["targetId"],
            "targetVersion": payload["targetId"],
            "status": "rejected",
            "runtimeStatus": "rejected",
            "vulnerabilityReproduced": False,
            "coveragePercentage": 0,
            "securityRule": "Unauthenticated input must not reach the admin-only resource.",
            "protectedResourceReached": False,
            "requestTrace": [],
            "responseStatuses": [],
            "logs": ["Only the allowlisted POST /login and GET /admin reproduction format is accepted."],
            "vulnerabilityCategory": "Unsupported reproduction format",
        }))
        return
    username = unquote_plus(steps[1][len("username="):])
    password = unquote_plus(steps[2][len("password="):])
    if len(username) > 512 or len(password) > 512:
        print(json.dumps({
            "targetId": payload["targetId"],
            "targetVersion": payload["targetId"],
            "status": "rejected",
            "runtimeStatus": "rejected",
            "vulnerabilityReproduced": False,
            "coveragePercentage": 0,
            "securityRule": "Unauthenticated input must not reach the admin-only resource.",
            "protectedResourceReached": False,
            "requestTrace": [],
            "responseStatuses": [],
            "logs": ["Login field values exceed the allowlisted size limit."],
            "vulnerabilityCategory": "Oversized reproduction input",
        }))
        return
    if "'" not in username or "--" not in username:
        print(json.dumps({
            "targetId": payload["targetId"],
            "targetVersion": payload["targetId"],
            "status": "rejected",
            "runtimeStatus": "rejected",
            "vulnerabilityReproduced": False,
            "coveragePercentage": 0,
            "securityRule": "Unauthenticated input must not reach the admin-only resource.",
            "protectedResourceReached": False,
            "requestTrace": [],
            "responseStatuses": [],
            "logs": ["The login reproduction does not contain the allowlisted authentication-bypass input."],
            "vulnerabilityCategory": "Unsupported reproduction format",
        }))
        return
    ast_result = analyze_source(payload["targetId"] == "trustx-login-sqli-v1")
    result = execute(payload["targetId"] == "trustx-login-sqli-v1")
    result.update(ast_result)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
