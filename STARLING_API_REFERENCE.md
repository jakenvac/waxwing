# Starling Bank API Reference

## Base Information

- **API Base URL**: Not explicitly stated in OpenAPI spec, but typically `https://api.starlingbank.com` (production) or `https://api-sandbox.starlingbank.com` (sandbox)
- **Authentication**: Bearer token (Personal Access Token)
- **Header Format**: `Authorization: Bearer {your-personal-access-token}`

## API Endpoints Used in Waxwing

### 1. Get Accounts
**Endpoint**: `GET /api/v2/accounts`

**Description**: Get all accounts associated with the account holder. Each access token is associated with a single account holder who may have multiple accounts (GBP, EUR, etc.).

**Authentication Required**: Yes - `account:read` or `account-list:read` scope

**Response Structure**:
```json
{
  "accounts": [
    {
      "accountUid": "bbccbbcc-bbcc-bbcc-bbcc-bbccbbccbbcc",
      "accountType": "PRIMARY",
      "defaultCategory": "ccddccdd-ccdd-ccdd-ccdd-ccddccddccdd",
      "currency": "GBP",
      "createdAt": "2023-01-01T12:00:00.000Z",
      "name": "Personal"
    }
  ]
}
```

**Key Fields**:
- `accountUid`: Unique identifier for the account (UUID format)
- `accountType`: Type of account (PRIMARY, ADDITIONAL, LOAN, FIXED_TERM_DEPOSIT, SAVINGS)
- `defaultCategory`: The default category UID (needed for balance queries)
- `currency`: ISO-4217 3 character currency code (GBP, EUR, etc.)
- `name`: Display name of the account

---

### 2. Get Account Balance
**Endpoint**: `GET /api/v2/accounts/{accountUid}/balance`

**Description**: Get the balance for a specific account. Returns both cleared and effective balances.

**Authentication Required**: Yes - `balance:read` scope

**Path Parameters**:
- `accountUid` (required): UUID of the account

**Response Structure**:
```json
{
  "clearedBalance": {
    "currency": "GBP",
    "minorUnits": 123456
  },
  "effectiveBalance": {
    "currency": "GBP",
    "minorUnits": 120000
  },
  "pendingTransactions": {
    "currency": "GBP",
    "minorUnits": 3456
  },
  "acceptedOverdraft": {
    "currency": "GBP",
    "minorUnits": 0
  },
  "totalClearedBalance": {
    "currency": "GBP",
    "minorUnits": 123456
  },
  "totalEffectiveBalance": {
    "currency": "GBP",
    "minorUnits": 120000
  }
}
```

**Key Fields**:
- `clearedBalance`: Balance of settled transactions only (excludes pending)
- `effectiveBalance`: Balance including pending outgoing transactions (most commonly shown to users)
- `pendingTransactions`: Amount of pending transactions
- `totalClearedBalance`: Cleared balance across main account + spaces + savings goals
- `totalEffectiveBalance`: Effective balance across main account + spaces + savings goals
- `minorUnits`: Amount in minor currency units (pence for GBP, cents for EUR)

**Balance Types Explained**:
- **Cleared Balance**: Settled transactions only. Does not include pending. Used for interest calculations.
- **Effective Balance**: Includes settled and pending outgoing transactions. This is what users typically see in their app.

**Converting minorUnits to Display**:
```typescript
// For GBP/EUR: minorUnits / 100 = major units
// Example: 123456 minorUnits = £1,234.56
const displayAmount = minorUnits / 100;
```

---

### 3. Get Account Holder Information (Optional - Future Use)
**Endpoint**: `GET /api/v2/account-holder`

**Description**: Get basic information about the account holder type.

**Authentication Required**: Yes - `customer:read` or `account-holder-type:read` scope

**Response Structure**:
```json
{
  "accountHolderUid": "aabbaabb-aabb-aabb-aabb-aabbaabbaabb",
  "accountHolderType": "INDIVIDUAL"
}
```

**Account Holder Types**:
- `INDIVIDUAL`: Personal account
- `BUSINESS`: Business account
- `SOLE_TRADER`: Sole trader account
- `JOINT`: Joint account
- `BANKING_AS_A_SERVICE`: BaaS account

---

### 4. Get Account Holder Name (Optional - Future Use)
**Endpoint**: `GET /api/v2/account-holder/name`

**Description**: Get the display name of the account holder.

**Authentication Required**: Yes - `account-holder-name:read` scope

**Response Structure**:
```json
{
  "accountHolderName": "Dave Bowman"
}
```

---

## Error Handling

**Error Response Structure**:
```json
{
  "errors": [
    {
      "message": "Something about the error"
    }
  ],
  "success": false
}
```

**Common HTTP Status Codes**:
- `200`: Successful operation
- `400`: Bad Request (client error)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (token doesn't have required scope)
- `404`: Not Found
- `500`: Server Error

**Common Error Scenarios**:
1. **Invalid Token**: 401 Unauthorized
2. **Expired Token**: 401 Unauthorized
3. **Insufficient Permissions**: 403 Forbidden (token missing required scope)
4. **Network Errors**: Handle timeout and connection failures
5. **Rate Limiting**: May return 429 Too Many Requests

---

## Personal Access Token

**How to Obtain**:
1. Log into Starling Bank personal/business account
2. Go to Settings → API & Developer
3. Create a Personal Access Token
4. Select required scopes (permissions)
5. Copy the token (shown only once)

**Required Scopes for Waxwing**:
- `account:read` or `account-list:read` - To list accounts
- `balance:read` - To get account balance

**Token Format**:
- Long alphanumeric string
- Must be kept secure
- Should be stored encrypted on device
- Include in Authorization header: `Authorization: Bearer {token}`

**Security Notes**:
- Never log the token
- Never commit token to version control
- Store encrypted in secure storage
- Token gives read access to account data

---

## Data Types

### CurrencyAndAmount
```typescript
{
  currency: string;      // ISO-4217 3 character code (e.g., "GBP", "EUR")
  minorUnits: number;    // Amount in minor currency units (pence/cents)
}
```

### SignedCurrencyAndAmount
Same as CurrencyAndAmount but minorUnits can be negative.

### UUID Format
Pattern: `[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}`

Example: `aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`

---

## Example Request Flow for Waxwing

### 1. User Enters Personal Access Token
Store token securely (encrypted) on device.

### 2. Validate Token & Fetch Accounts
```
GET /api/v2/accounts
Headers: Authorization: Bearer {token}
```

**Success**: Returns list of accounts
**Failure**: Invalid token or network error

### 3. Display Account Balance
```
GET /api/v2/accounts/{accountUid}/balance
Headers: Authorization: Bearer {token}
```

**Success**: Returns balance data
**Failure**: Invalid account or token doesn't have balance:read scope

### 4. Format and Display
- Convert minorUnits to display format
- Show effectiveBalance as primary balance
- Show account name and currency

---

## Rate Limiting

Rate limits are not explicitly documented in the OpenAPI spec. Best practices:
- Implement exponential backoff for retries
- Don't poll balance too frequently
- Cache responses when appropriate
- Handle 429 status codes gracefully

---

## Sandbox vs Production

**Sandbox** (for testing):
- Base URL: `https://api-sandbox.starlingbank.com`
- Test data, no real money
- Requires sandbox account

**Production** (real banking):
- Base URL: `https://api.starlingbank.com`
- Real account data
- Requires real Starling Bank account

---

## Future API Endpoints (Phase 2+)

These endpoints are available in the API but not yet used in Waxwing:

### Transaction Feed
- `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}` - Get transactions
- `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}/transactions-between` - Get transactions in date range

### Payees
- `GET /api/v2/payees` - List saved payees
- `PUT /api/v2/payees` - Create new payee

### Payments (requires additional scopes and security)
- `PUT /api/v2/payments/local/account/{accountUid}/category/{categoryUid}` - Make payment
- Note: Requires `BearerAndSignature` security scheme

### Spaces & Savings Goals
- `GET /api/v2/account/{accountUid}/spaces` - Get spending spaces and savings goals
- `GET /api/v2/account/{accountUid}/savings-goals` - Get savings goals

---

## Implementation Notes

1. **Always use HTTPS** - API requires secure connections
2. **Store token securely** - Use encrypted storage (e.g., expo-secure-store)
3. **Handle errors gracefully** - Network issues, invalid tokens, etc.
4. **Format currency properly** - Remember minorUnits conversion
5. **Respect user privacy** - Don't log sensitive data
6. **Test in sandbox first** - Before using production tokens

---

Last Updated: 2026-03-11
