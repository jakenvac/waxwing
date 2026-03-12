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

/**
 * Transaction feed item from GET /api/v2/feed/account/{accountUid}/category/{categoryUid}
 */
export interface FeedItem {
  feedItemUid: string;
  categoryUid: string;
  amount: CurrencyAndAmount;
  sourceAmount: CurrencyAndAmount;
  direction: 'IN' | 'OUT';
  updatedAt: string; // ISO 8601 timestamp
  transactionTime: string; // ISO 8601 timestamp
  settlementTime?: string; // ISO 8601 timestamp
  source: string; // e.g., "MASTER_CARD", "FASTER_PAYMENTS_IN", "INTERNAL_TRANSFER"
  status: 'PENDING' | 'REVERSED' | 'SETTLED' | 'DECLINED' | 'REFUNDED' | 'RETRYING' | 'ACCOUNT_CHECK';
  counterPartyType: string; // e.g., "CATEGORY", "PAYEE", "MERCHANT", "SENDER"
  counterPartyName?: string; // e.g., "Tesco", merchant or payee name
  counterPartySubEntityName?: string;
  counterPartySubEntityIdentifier?: string;
  reference?: string;
  country?: string;
  spendingCategory?: string;
  hasAttachment: boolean;
  hasReceipt: boolean;
}

export interface FeedResponse {
  feedItems: FeedItem[];
}

/**
 * Savings goal from GET /api/v2/account/{accountUid}/savings-goals
 */
export interface SavingsGoal {
  savingsGoalUid: string;
  name: string;
  target?: CurrencyAndAmount;
  totalSaved: CurrencyAndAmount;
  savedPercentage?: number;
  state: 'CREATING' | 'ACTIVE' | 'ARCHIVING' | 'ARCHIVED' | 'RESTORING' | 'PENDING';
}

export interface SavingsGoalsResponse {
  savingsGoalList: SavingsGoal[];
}

/**
 * Response from PUT /api/v2/account/{accountUid}/savings-goals/{savingsGoalUid}/add-money/{transferUid}
 */
export interface SavingsGoalTransferResponse {
  transferUid: string;
  success: boolean;
}
