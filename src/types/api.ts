/**
 * TypeScript types for Starling Bank API responses
 * Based on STARLING_API_REFERENCE.md
 */

/**
 * Account details from GET /api/v2/accounts
 */
export interface Account {
  accountUid: string;
  accountType: 'PRIMARY' | 'ADDITIONAL' | 'LOAN';
  defaultCategory: string;
  currency: string; // ISO 4217 currency code (e.g., "GBP", "EUR")
  createdAt: string; // ISO 8601 timestamp
  name: string;
}

export interface AccountsResponse {
  accounts: Account[];
}

/**
 * Currency amount with minor units
 */
export interface CurrencyAndAmount {
  currency: string; // ISO 4217 currency code
  minorUnits: number; // Amount in minor units (e.g., pence for GBP)
}

/**
 * Account balance from GET /api/v2/accounts/{accountUid}/balance
 */
export interface Balance {
  clearedBalance: CurrencyAndAmount;
  effectiveBalance: CurrencyAndAmount;
  pendingTransactions: CurrencyAndAmount;
  acceptedOverdraft: CurrencyAndAmount;
  currency: string;
  amount: CurrencyAndAmount;
  totalClearedBalance: CurrencyAndAmount;
  totalEffectiveBalance: CurrencyAndAmount;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  error_description?: string;
}

/**
 * Generic API response wrapper
 */
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
