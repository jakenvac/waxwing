/**
 * SessionContext — holds decrypted StoredAccount[] in memory for the session.
 *
 * Tokens are stored in SecureStore with requireAuthentication: true, so the OS
 * will prompt the user for biometrics/PIN exactly once per session (on
 * loadSession). The decrypted accounts live in React state and are never
 * persisted beyond the JS heap. clearSession() wipes them when the app
 * backgrounds or is locked.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAccounts } from '../services/storage';
import type { StoredAccount } from '../services/storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionState =
  | 'idle'        // not yet attempted
  | 'loading'     // auth prompt shown / reading storage
  | 'authenticated' // accounts in memory
  | 'failed';     // auth failed or no accounts readable

interface SessionContextValue {
  /** Current state of the session */
  sessionState: SessionState;
  /** Accounts loaded into memory; empty array until authenticated */
  accounts: StoredAccount[];
  /**
   * Trigger device authentication and load accounts into memory.
   * Resolves with true on success, false on failure.
   */
  loadSession: () => Promise<boolean>;
  /** Wipe accounts from memory (called on background / lock) */
  clearSession: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SessionContext = createContext<SessionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SessionProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);

  const loadSession = useCallback(async (): Promise<boolean> => {
    setSessionState('loading');
    try {
      // getAccounts calls SecureStore.getItemAsync with requireAuthentication: true,
      // so the OS biometric/PIN prompt fires here.
      const stored = await getAccounts();
      setAccounts(stored);
      setSessionState('authenticated');
      return true;
    } catch (err) {
      console.warn('[Session] Authentication failed or storage error:', err);
      setAccounts([]);
      setSessionState('failed');
      return false;
    }
  }, []);

  const clearSession = useCallback(() => {
    console.log('[Session] Clearing session');
    setAccounts([]);
    setSessionState('idle');
  }, []);

  return (
    <SessionContext.Provider value={{ sessionState, accounts, loadSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return ctx;
}
