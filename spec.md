# Waxwing App Specification

## Overview
Waxwing is a lightweight React Native (Expo) mobile app for viewing Starling Bank accounts on small, low-power Android devices. Designed for minimalist "dumbphones" with screens as small as 2 inches (480x640 resolution). Each Starling account is linked via a Personal Access Token (PAT) — one PAT per account.

## Design Principles

### 1. Small Screen Optimisation
- **Minimum screen size:** 2 inches (480x640)
- **Vertical-first layout:** All content flows vertically, no horizontal scrolling
- **Large touch targets:** Minimum 44x44dp for all interactive elements
- **Generous spacing:** Adequate padding between touchable areas to prevent mis-taps

### 2. D-pad/Keypad Navigation
- **Full keypad support:** App must be fully navigable with dumbphone keypads (D-pad/arrow keys)
- **Predictable focus movement:** Focus order should be logical and predictable top-to-bottom
- **Vertical-first navigation:** Prioritise up/down navigation; left/right only where explicitly needed (e.g. header buttons)
- **Visual focus indicators:** Android's native white highlight is used — no custom teal border
- **OK button interaction:** Centre/OK button activates focused element
- **Dual input support:** Both touch and D-pad work simultaneously
- **Explicit focus wiring:** Use `nextFocusUp`/`nextFocusDown`/`nextFocusLeft`/`nextFocusRight` with `findNodeHandle` refs where Android's automatic focus order would be wrong (e.g. header buttons above a ScrollView)

### 3. Performance Constraints
- **Low-power optimisation:** Minimal animations, efficient rendering
- **Parallel data loading:** Balance and transactions load in parallel; each updates state independently as it resolves
- **Fast startup:** Quick launch time on low-power hardware
- **Efficient API calls:** Avoid redundant requests; store `defaultCategory` at account-add time

### 4. Visual Design
- **Dark theme:** Dark purple background with teal accents
  - Primary: `#7C3AED` (deep purple)
  - Accent: `#14B8A6` (teal) — used for add/action buttons
  - Background: `#1A0B2E` (very dark purple)
  - Surface: `#2D1B4E` (dark purple cards)
  - Text primary: `#FFFFFF`
  - Text secondary: `#C4B5FD` (light purple)
  - Text disabled: `#6B5B95` (muted purple)
  - Debit amounts: `#FF6B6B` (vibrant coral red)
  - Credit amounts: `#10B981` (green)
- **High contrast:** Ensure readability on small, potentially lower-quality screens
- **Minimal UI chrome:** Focus on content, not decoration

## Starling API

- **Base URL:** `https://api.starlingbank.com`
- **Auth:** `Authorization: Bearer <PAT>` header on all requests
- **One PAT = one account** — PATs are scoped to a single account in the Starling Developer portal
- **Key endpoints used:**
  - `GET /api/v2/accounts` — fetch account details (name, type, defaultCategory)
  - `GET /api/v2/accounts/{accountUid}/balance` — fetch balance
  - `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}?changesSince={iso8601}` — fetch transaction feed
    - `changesSince` is **required** — defaults to 7 days ago
    - No pagination support — all matching transactions returned in one response
- **Error handling:** Parse error body as JSON, fall back to HTTP status text

## Data Storage

Expo SecureStore, key `starling_accounts`, stores a JSON array:

```typescript
interface StoredAccount {
  accountUid: string;
  accountName: string;
  accountType: string;
  defaultCategory: string;  // stored at add-time to avoid extra API call
  token: string;            // PAT — encrypted by SecureStore
  addedAt: number;          // Unix timestamp (ms)
}
```

## Navigation Structure

```
Home
├── AddAccount
├── AccountDetail
│   ├── Settings          (per-account)
│   ├── SavingsGoals      (per-account, placeholder)
│   ├── Payees            (per-account, placeholder)
│   ├── SendMoney         (per-account, placeholder)
│   └── ReceiveMoney      (per-account, placeholder)
```

All account-scoped screens receive `AccountRouteParams`:
```typescript
interface AccountRouteParams {
  accountUid: string;
  accountName: string;
  token: string;
}
```

## User Flows

### First Launch
```
App Launch → no accounts in storage → AddAccount screen
  → user enters PAT
  → verify: GET /api/v2/accounts
  → save StoredAccount (including defaultCategory)
  → show success message (1s)
  → navigate to Home
```

### Subsequent Launches
```
App Launch → accounts found → Home screen
  → fetch balances for all accounts in parallel
  → display updated balances
```

### Adding Another Account
```
Home → tap bank-plus icon → AddAccount screen
  (form is cleared on every focus via useFocusEffect)
  → enter new PAT → verify → save → Home
```

### Viewing Account Detail
```
Home → tap account card → AccountDetail screen
  → balance and transactions load in parallel
  → balance card renders immediately
  → transaction list shows inline spinner until ready
```

## Screen Specifications

### Home Screen
**Purpose:** Display all linked accounts with balances

```
┌─────────────────────────┐
│ Waxwing        [DEL][+] │ ← Fixed header
│ Accounts                │   DEL = debug-only delete all
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Personal   Available│ │ ← Account card
│ │ PRIMARY    £1,234.56│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Joint      Available│ │
│ │ JOINT        £456.78│ │
│ └─────────────────────┘ │
│ [Scrollable...]      ║  │ ← Custom scrollbar
└─────────────────────────┘
```

**Header:** "Waxwing" / "Accounts" title left; DEBUG delete button (coral red) + bank-plus icon (teal) right  
**Account cards:** full-width, account name + type left, available balance right  
**Custom scrollbar:** 4dp wide, purple, 60% opacity, always visible when scrollable  
**Pull-to-refresh:** reloads all balances  
**Empty state:** "No accounts added yet" + subtext

**D-pad:** No custom focus wiring needed — Android default handles vertical card navigation naturally.

### AddAccount Screen
**Purpose:** Add a new account via PAT

```
┌─────────────────────────┐
│ Add Account             │
│                         │
│ Personal Access Token   │
│ ┌─────────────────────┐ │
│ │ •••••••••••         │ │ ← secure text input
│ └─────────────────────┘ │
│                         │
│ [error message]         │ ← red, if any
│ [success message]       │ ← green, if saved
│                         │
│ ┌─────────────────────┐ │
│ │     Add Account     │ │ ← primary button
│ └─────────────────────┘ │
│                         │
│ [help text]             │
└─────────────────────────┘
```

- Form is **cleared on every screen focus** (`useFocusEffect`) to prevent stale token from previous add
- Shows green success message for 1 second before navigating back
- Loading spinner replaces button text while verifying

### Account Detail Screen
**Purpose:** Show balance, quick actions, and recent transactions for one account

```
┌─────────────────────────┐
│ ← Account Name    [cog] │ ← Fixed header
├─────────────────────────┤
│ Available Balance  2m ago│ ← balance card
│ £1,234.56  Cleared £1,200│
│            Pending    £34│
├─────────────────────────┤  ↑ loads immediately
│ Savings Goals         > │
│ Payees                > │ ← quick actions card
│ Send Money            > │
│ Receive Money         > │
├─────────────────────────┤
│ Recent Transactions     │
│ Tesco    12 Mar  -£12.50│ ← debit: coral red
│ Salary   11 Mar +£2400  │ ← credit: green
│ [inline spinner if      │
│  still loading]      ║  │
└─────────────────────────┘
```

**Balance card:**
- Header row: "Available Balance" label (left) + last updated relative time (right, subtler)
- Main row: large balance amount (left) + cleared/pending stack (right)
- Loads immediately; transactions load separately in parallel

**Quick actions card:**
- Vertical list with icon, label, chevron
- Dividers between rows, no border on last row
- Navigates to per-account sub-screens passing `AccountRouteParams`

**Transactions:**
- Last 7 days by default (`changesSince`)
- Date+time format: "Today 10:30am", "Yesterday 3:45pm", "12 Mar 2:15pm"
- Debit: coral red (`#FF6B6B`), credit: green (`#10B981`)
- Inline spinner while loading

**D-pad focus chain:**
```
[← back]  →  [cog]
    ↓
[Savings Goals]
    ↓
[Payees]
    ↓
[Send Money]
    ↓
[Receive Money]
    ↓
[first transaction card]
    ↓ ...
```
Wired with `findNodeHandle` refs. Pressing up from Savings Goals returns to back button.

### Settings Screen (per-account)
**Purpose:** Per-account settings (content TBD)

Header: "Settings" / account name subtitle, back button left  
Body: placeholder for now

### Placeholder Screens (SavingsGoals, Payees, SendMoney, ReceiveMoney)
All share a common `PlaceholderScreen` component.  
Header: screen title / account name subtitle, back button  
Body: relevant icon + "Coming soon"

## Technical Notes

### Transaction Date Formatting
- Same day → "Today 10:30am"
- Previous day → "Yesterday 3:45pm"  
- Older → "12 Mar 2:15pm"

### Scrollbar Implementation
Custom `Animated.Value`-based scrollbar (not React Native's built-in):
- Tracks `contentHeight` and `scrollHeight` via refs to avoid re-renders
- Updates position with `Animated.Value.setValue()` directly (no setState)
- Visible only when content exceeds scroll view height

### Logging
Extensive `console.log` throughout for debugging on-device:
- `[API]` prefix for all network requests/responses
- `[Storage]` prefix for SecureStore operations
- `[AccountDetail]`, `[AddAccount]`, `[Home]` prefixes for screen-level events

## Future Features

### Near-term (next branch)
- Savings Goals implementation
- Payees list
- Send Money flow
- Receive Money / payment details screen
- Remove account (from Settings screen)
- "Load More" transactions (extend `changesSince` window)

### Later
- Transaction filtering and search
- Export to CSV
- Spending categories
- Multiple currency sub-accounts
- Home screen widget (balance at a glance)
- Biometric authentication
- Account nicknames

## Out of Scope
- No iOS support (Android-only initially)
- No cloud backup or multi-device sync
- No account creation (users must have existing Starling accounts)
- No PAT generation (done in Starling Developer portal)

## Testing Checklist

### Small Screen
- [ ] All screens render correctly at 480x640
- [ ] No horizontal scrolling anywhere
- [ ] All text readable, no truncation issues
- [ ] All touch targets ≥ 44x44dp

### Functionality
- [ ] First launch goes straight to AddAccount
- [ ] Add first account — PAT verified, stored with defaultCategory
- [ ] Add second account — form cleared, independent of first account's PAT
- [ ] Home screen shows all accounts with balances
- [ ] Pull-to-refresh updates balances
- [ ] Account detail loads balance and transactions in parallel
- [ ] Transactions show correct date/time format
- [ ] Debit/credit amounts show correct colours
- [ ] Quick action rows navigate to correct placeholder screens
- [ ] Cog navigates to Settings with correct account context
- [ ] App remembers accounts after restart
- [ ] DEBUG delete button clears all accounts

### D-pad Navigation
- [ ] Account Detail: up from first transaction → back button
- [ ] Account Detail: right from back button → cog
- [ ] Account Detail: left from cog → back button
- [ ] Account Detail: down from back button → Savings Goals
- [ ] Account Detail: full chain down through quick actions to first transaction
- [ ] All screens navigable without touch

### Edge Cases
- [ ] No accounts (empty state on Home)
- [ ] Account with no transactions in last 7 days
- [ ] Invalid PAT (clear error message)
- [ ] Network offline (graceful error)
- [ ] Balance load fails (transactions still show)
- [ ] Transaction load fails (balance still shows)
