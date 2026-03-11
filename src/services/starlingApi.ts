/**
 * Starling Bank API service
 * Handles authentication and API requests
 */
import type { AccountsResponse, Balance, ApiResponse } from '../types';

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
    console.log(`[API] Making request to: ${API_BASE_URL}${endpoint}`);
    console.log(`[API] Token length: ${accessToken.length} chars`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[API] Error response:', errorData);
      return {
        success: false,
        error: errorData.error_description || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('[API] Success! Received data');
    return { success: true, data };
  } catch (error) {
    console.log('[API] Request failed with error:', error);
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
