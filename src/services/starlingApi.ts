/**
 * Starling Bank API service
 * Handles authentication and API requests
 */
import type { AccountsResponse, Balance, ApiResponse, FeedResponse, SavingsGoalsResponse } from '../types';

// Use production API for live tokens
const API_BASE_URL = 'https://api.starlingbank.com';
// For sandbox: const API_BASE_URL = 'https://api-sandbox.starlingbank.com';

/**
 * Make an authenticated API request to Starling Bank
 */
async function makeRequest<T>(
  endpoint: string,
  accessToken: string
): Promise<ApiResponse<T>> {
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Making request to: ${fullUrl}`);
    console.log(`[API] Token (first 10 chars): ${accessToken.substring(0, 10)}...`);
    console.log(`[API] Token length: ${accessToken.length} chars`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);
    console.log(`[API] Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[API] Error response body:', errorText);
      
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.log('[API] Could not parse error response as JSON');
      }
      
      return {
        success: false,
        error: errorData.error_description || errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const responseText = await response.text();
    console.log('[API] Response body length:', responseText.length, 'chars');
    
    const data = JSON.parse(responseText);
    console.log('[API] Success! Parsed response data');
    
    return { success: true, data };
  } catch (error) {
    console.log('[API] Request failed with error:', error);
    console.log('[API] Error type:', error?.constructor?.name);
    console.log('[API] Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.log('[API] Error stack:', error.stack);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network request failed',
    };
  }
}

/**
 * Verify that an access token is valid by fetching accounts
 * Returns success if the token works
 */
export async function verifyToken(accessToken: string): Promise<ApiResponse<void>> {
  const result = await getAccounts(accessToken);
  if (result.success) {
    return { success: true, data: undefined };
  }
  return result;
}

/**
 * Get all accounts for the authenticated user
 * GET /api/v2/accounts
 */
export async function getAccounts(accessToken: string): Promise<ApiResponse<AccountsResponse>> {
  return makeRequest<AccountsResponse>('/api/v2/accounts', accessToken);
}

/**
 * Get account balance for a specific account
 * GET /api/v2/accounts/{accountUid}/balance
 */
export async function getAccountBalance(
  accessToken: string,
  accountUid: string
): Promise<ApiResponse<Balance>> {
  return makeRequest<Balance>(`/api/v2/accounts/${accountUid}/balance`, accessToken);
}

/**
 * Get transaction feed for a specific account category
 * GET /api/v2/feed/account/{accountUid}/category/{categoryUid}?changesSince={date}
 * @param accessToken PAT for authentication
 * @param accountUid Account UID
 * @param categoryUid Category UID (use account's defaultCategory)
 * @param changesSince ISO 8601 date-time string (defaults to 7 days ago if not provided)
 */
export async function getTransactionFeed(
  accessToken: string,
  accountUid: string,
  categoryUid: string,
  changesSince?: string
): Promise<ApiResponse<FeedResponse>> {
  // Default to 7 days ago if not provided
  const since = changesSince || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  console.log('[API] Fetching transaction feed...');
  console.log('[API]   accountUid:', accountUid);
  console.log('[API]   categoryUid:', categoryUid);
  console.log('[API]   changesSince:', since);
  
  return makeRequest<FeedResponse>(
    `/api/v2/feed/account/${accountUid}/category/${categoryUid}?changesSince=${encodeURIComponent(since)}`,
    accessToken
  );
}

/**
 * Get savings goals for a specific account
 * GET /api/v2/account/{accountUid}/savings-goals
 */
export async function getSavingsGoals(
  accessToken: string,
  accountUid: string
): Promise<ApiResponse<SavingsGoalsResponse>> {
  return makeRequest<SavingsGoalsResponse>(
    `/api/v2/account/${accountUid}/savings-goals`,
    accessToken
  );
}

/**
 * Format currency amount from minor units to major units
 * @param minorUnits Amount in minor units (e.g., pence)
 * @param currency Currency code (e.g., "GBP")
 * @returns Formatted string (e.g., "£12.34")
 */
export function formatCurrency(minorUnits: number, currency: string): string {
  const majorUnits = minorUnits / 100;
  
  // Currency symbols
  const symbols: Record<string, string> = {
    'GBP': '£',
    'EUR': '€',
    'USD': '$',
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${majorUnits.toFixed(2)}`;
}
