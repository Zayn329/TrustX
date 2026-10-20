import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { resolveWorkspaceRole, type AccountRole } from './roleAccess';

export interface UserProfile {
  uid: string;
  displayName: string;
  companyName?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: AccountRole | null;
  loading: boolean;
  configurationError: string | null;
  signIn: (email: string, password: string, expectedRole: AccountRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(user: User): Promise<UserProfile> {
  if (!db) return { uid: user.uid, displayName: user.displayName || user.email || 'TrustX member' };
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  const data = snapshot.data();
  return {
    uid: user.uid,
    displayName: typeof data?.displayName === 'string' ? data.displayName : user.displayName || user.email || 'TrustX member',
    companyName: typeof data?.companyName === 'string' ? data.companyName : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AccountRole | null>(null);
  const [loading, setLoading] = useState(true);
  const configurationError = auth ? null : 'Authentication is unavailable because Firebase is not configured.';

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const firebaseAuth = auth;
    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setLoading(true);
      try {
        if (!nextUser) {
          setUser(null);
          setProfile(null);
          setRole(null);
          return;
        }
        const token = await nextUser.getIdTokenResult();
        const tokenRole = token.claims.role;
        if (tokenRole !== 'company' && tokenRole !== 'researcher') {
          await firebaseSignOut(firebaseAuth);
          throw new Error('Your account has not been assigned a TrustX workspace role.');
        }
        setUser(nextUser);
        setRole(tokenRole);
        setProfile(await loadProfile(nextUser));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, profile, role, loading, configurationError,
    async signIn(email, password, expectedRole) {
      if (!auth) throw new Error(configurationError || 'Authentication is unavailable.');
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdTokenResult(true);
      const resolution = resolveWorkspaceRole(expectedRole, token.claims.role);
      if ('error' in resolution) {
        await firebaseSignOut(auth);
        throw new Error(resolution.error);
      }
    },
    async resetPassword(email) {
      if (!auth) throw new Error(configurationError || 'Authentication is unavailable.');
      await sendPasswordResetEmail(auth, email.trim());
    },
    async logout() {
      if (auth) await firebaseSignOut(auth);
    },
  }), [configurationError, loading, profile, role, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
