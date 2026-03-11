/**
 * Secure storage service for multiple account tokens
 * Uses Expo SecureStore for encrypted storage
 */
import * as SecureStore from 'expo-secure-store';

const ACCOUNTS_KEY = 'starling_accounts';

export interface StoredAccount {
  accountUid: string;
  accountName: string;
  accountType: string;
  token: string;
  addedAt: number;
}

/**
 * Get all stored accounts
 */
export async function getAccounts(): Promise<StoredAccount[]> {
  const json = await SecureStore.getItemAsync(ACCOUNTS_KEY);
  if (!json) {
    return [];
  }
  return JSON.parse(json);
}

/**
 * Add a new account with its token
 */
export async function addAccount(account: StoredAccount): Promise<void> {
  const accounts = await getAccounts();
  
  // Check if account already exists
  const existingIndex = accounts.findIndex(a => a.accountUid === account.accountUid);
  if (existingIndex >= 0) {
    // Update existing account
    accounts[existingIndex] = account;
  } else {
    // Add new account
    accounts.push(account);
  }
  
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(accounts));
}

/**
 * Remove an account
 */
export async function removeAccount(accountUid: string): Promise<void> {
  const accounts = await getAccounts();
  const filtered = accounts.filter(a => a.accountUid !== accountUid);
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(filtered));
}

/**
 * Get token for a specific account
 */
export async function getAccountToken(accountUid: string): Promise<string | null> {
  const accounts = await getAccounts();
  const account = accounts.find(a => a.accountUid === accountUid);
  return account?.token || null;
}
