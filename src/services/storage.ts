/**
 * Secure storage service for multiple account tokens
 * Uses Expo SecureStore for encrypted storage
 */
import * as SecureStore from 'expo-secure-store';

const ACCOUNTS_KEY = 'starling_accounts';

/**
 * SecureStore options that require device authentication (biometrics/PIN)
 * before the value can be read. This is used for all reads/writes so that
 * the OS prompts the user once on app launch.
 */
const AUTH_OPTIONS: SecureStore.SecureStoreOptions = {
  requireAuthentication: true,
};

export interface StoredAccount {
  accountUid: string;
  accountName: string;
  accountType: string;
  defaultCategory: string;
  token: string;
  addedAt: number;
}

/**
 * Get all stored accounts
 */
export async function getAccounts(): Promise<StoredAccount[]> {
  console.log('[Storage] Getting all accounts...');
  const json = await SecureStore.getItemAsync(ACCOUNTS_KEY, AUTH_OPTIONS);
  if (!json) {
    console.log('[Storage] No accounts found in storage');
    return [];
  }
  const accounts = JSON.parse(json);
  console.log('[Storage] Found', accounts.length, 'account(s)');
  return accounts;
}

/**
 * Add a new account with its token
 */
export async function addAccount(account: StoredAccount): Promise<void> {
  console.log('[Storage] ========== ADDING ACCOUNT ==========');
  console.log('[Storage] Account to add:', account.accountName, '(' + account.accountUid + ')');
  
  const accounts = await getAccounts();
  console.log('[Storage] Current accounts in storage:', accounts.length);
  
  // Check if account already exists
  const existingIndex = accounts.findIndex(a => a.accountUid === account.accountUid);
  if (existingIndex >= 0) {
    console.log('[Storage] Account already exists at index', existingIndex, '- UPDATING');
    // Update existing account
    accounts[existingIndex] = account;
  } else {
    console.log('[Storage] Account is new - ADDING to array');
    // Add new account
    accounts.push(account);
  }
  
  console.log('[Storage] Total accounts after operation:', accounts.length);
  console.log('[Storage] Account names:', accounts.map(a => a.accountName).join(', '));
  console.log('[Storage] Saving to SecureStore...');
  
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(accounts), AUTH_OPTIONS);
  
  console.log('[Storage] Saved successfully!');
  console.log('[Storage] ========== ADD ACCOUNT COMPLETE ==========');
}

/**
 * Remove an account
 */
export async function removeAccount(accountUid: string): Promise<void> {
  const accounts = await getAccounts();
  const filtered = accounts.filter(a => a.accountUid !== accountUid);
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(filtered), AUTH_OPTIONS);
}

/**
 * Delete all accounts (DEBUG ONLY)
 */
export async function deleteAllAccounts(): Promise<void> {
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify([]), AUTH_OPTIONS);
}
