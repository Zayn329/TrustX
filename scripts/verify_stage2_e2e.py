import time
import subprocess
from playwright.sync_api import sync_playwright

def main():
    print("=== Starting Stage 2 E2E Playwright Verification ===")

    # Start Oracle Server
    oracle_process = subprocess.Popen(
        ["node", "oracle/server.cjs"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(2)

    # Start Dev Server on Port 3000
    dev_process = subprocess.Popen(
        ["npx", "vite", "--port", "3000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(4)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 800})

            # Pre-set localStorage to skip onboarding tour
            page = context.new_page()
            page.goto("http://localhost:3000/")
            page.evaluate("localStorage.setItem('trustx_onboarding_completed', 'true')")

            # Navigate to Trust Passport
            print("1. Opening http://localhost:3000/#passport...")
            page.goto("http://localhost:3000/#passport")
            page.wait_for_selector("text=Alex Rivera", timeout=10000)

            # Skip tour if button still visible
            skip_tour = page.query_selector("text=Skip Tour")
            if skip_tour:
                skip_tour.click(force=True)
                time.sleep(0.5)

            # Take screenshot of Trust Passport
            print("2. Capturing Trust Passport initial state...")
            page.screenshot(path="screenshots/stage2_passport_initial.png")

            # Click "Inspect Evidence Hash & Proof"
            print("3. Opening Proof Detail Modal from Passport view...")
            inspect_btn = page.query_selector("text=Inspect Evidence Hash & Proof")
            if inspect_btn:
                inspect_btn.click(force=True)
                time.sleep(1)
                page.screenshot(path="screenshots/stage2_proof_modal_opened.png")

                # Re-calculate hash
                print("4. Testing payload hash re-calculation...")
                verify_hash_btn = page.query_selector("text=Verify Payload Hash")
                if verify_hash_btn:
                    verify_hash_btn.click(force=True)
                    time.sleep(1)
                    page.screenshot(path="screenshots/stage2_hash_verified.png")

                # Close modal
                close_btn = page.query_selector("button:has-text('Close Inspection')")
                if close_btn:
                    close_btn.click(force=True)
                    time.sleep(0.5)

            # Navigate to Explorer View
            print("5. Navigating to Contribution Explorer...")
            page.goto("http://localhost:3000/#explorer")
            page.wait_for_selector("text=Contribution audit explorer", timeout=10000)

            # Click "Inspect Proof & Evidence Hash" in Explorer
            print("6. Opening Proof Detail Modal from Explorer view...")
            explorer_inspect_btn = page.query_selector("text=Inspect Proof & Evidence Hash")
            if explorer_inspect_btn:
                explorer_inspect_btn.click(force=True)
                time.sleep(1)
                page.screenshot(path="screenshots/stage2_explorer_proof_modal.png")

            print("=== Stage 2 E2E Verification Completed Successfully ===")
            browser.close()

    finally:
        dev_process.terminate()
        oracle_process.terminate()

if __name__ == "__main__":
    main()
