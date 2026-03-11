# Waxwing App Specification

## Overview
Waxwing is a lightweight React Native mobile app for viewing Starling Bank accounts on small, low-power Android devices. Designed for minimalist "dumbphones" with screens as small as 2 inches (480x640 resolution).

## Design Principles

### 1. Small Screen Optimization
- **Minimum screen size:** 2 inches (480x640)
- **Vertical-first layout:** All content flows vertically, no horizontal scrolling
- **No horizontal noise:** Minimal use of side-by-side elements
- **Large touch targets:** Minimum 44x44dp for all interactive elements
- **Generous spacing:** Adequate padding between touchable areas to prevent mis-taps

### 2. D-pad/Keypad Navigation
- **Full keypad support:** App must be fully navigable with dumbphone keypads (D-pad/arrow keys)
- **Predictable focus movement:** Focus order should be logical and predictable
- **Vertical-first navigation:** Prioritize up/down navigation (left/right only when necessary)
- **Visual focus indicators:** Clear highlight showing which element is focused
- **OK button interaction:** Center/OK button activates focused element
- **Focus persistence:** Remember focus position when returning to screens
- **Dual input support:** Both touch and D-pad should work simultaneously

### 3. Performance Constraints
- **Low-power optimization:** Minimal animations, efficient rendering
- **Small bundle size:** Essential features only, no bloat
- **Fast startup:** Quick launch time on low-power hardware
- **Efficient API calls:** Batch requests, cache when possible

### 4. Visual Design
- **Dark theme:** Dark purple background with teal accents
  - Primary: Purple (`#8B5CF6`)
  - Accent: Teal (`#14B8A6`)
  - Background: Dark purple/black
- **High contrast:** Ensure readability on small, potentially lower-quality screens
- **Large, legible text:** Prioritize readability over density
- **Minimal UI chrome:** Focus on content, not decoration

## User Flows

### 1. First Launch
```
App Launch
  ↓
No accounts found
  ↓
Show AddAccount screen directly
  ↓
User enters PAT
  ↓
Verify PAT with Starling API
  ↓
Success: Navigate to Home screen
Failure: Show error, allow retry
```

### 2. Subsequent Launches
```
App Launch
  ↓
Load accounts from secure storage
  ↓
Home screen with account list
  ↓
Fetch balances for all accounts
  ↓
Display updated balances
```

### 3. Adding Another Account
```
Home screen
  ↓
Tap bank-plus icon (top right)
  ↓
AddAccount screen
  ↓
Enter PAT
  ↓
Verify and save
  ↓
Navigate back to Home
  ↓
New account appears in list
```

### 4. Viewing Account Details (Future)
```
Home screen
  ↓
Tap on account card
  ↓
Account Detail screen
  ↓
Show:
  - Cleared balance
  - Pending balance
  - Recent transactions (scrollable list)
  - Last updated timestamp
```

### 5. Removing Account (Future)
```
Account Detail screen
  ↓
Tap "Remove Account" button (bottom)
  ↓
Confirmation dialog
  ↓
Confirm: Remove account, navigate to Home
Cancel: Stay on Account Detail
```

## Screen Specifications

### Home Screen
**Purpose:** Display all linked bank accounts with their balances

**Layout:**
```
┌─────────────────────┐
│ Waxwing        [+]  │ ← Fixed header (44dp min height)
│ Accounts            │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ Personal        │ │ ← Account card (60dp min height)
│ │ PRIMARY         │ │   Left: Account name/type
│ │         £123.45 │ │   Right: Balance
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Joint Account   │ │
│ │ JOINT           │ │
│ │         £456.78 │ │
│ └─────────────────┘ │
│                     │
│ [Scrollable...]  ║  │ ← Custom scrollbar (right edge)
└─────────────────────┘
```

**Elements:**
- **Header (fixed, non-scrolling):**
  - Title: "Waxwing" (large, bold)
  - Subtitle: "Accounts"
  - Add button: Bank-plus icon (44x44dp minimum, teal color)
  
- **Account Cards (scrollable):**
  - Full-width cards with padding
  - Minimum height: 60dp
  - Flex row layout:
    - Left: Account name (large) + Account type (small)
    - Right: Balance amount (large, right-aligned)
  - Spacing: 12dp between cards
  
- **Scrollbar:**
  - 4dp wide, purple, 60% opacity
  - Always visible when content is scrollable
  - Positioned 2dp from right edge

- **Pull-to-refresh:**
  - Standard pull gesture
  - Purple spinner color
  
- **Empty state:**
  - Centered text: "No accounts added yet"
  - Subtext: "Add your first account to get started"

**D-pad Navigation:**
- **Focus order:** Add button → Account 1 → Account 2 → Account 3... (vertical only)
- **Up/Down keys:** Navigate between focusable elements (with wrap-around)
- **OK/Enter key:** Activate focused element
- **Focus indicator:** Highlight focused card/button with teal border (2dp)
- **Auto-scroll:** Scroll list to keep focused element visible

### AddAccount Screen
**Purpose:** Add a new Starling Bank account via PAT

**Layout:**
```
┌─────────────────────┐
│ [←] Add Account     │ ← Header with back button
├─────────────────────┤
│                     │
│ Enter your Starling │
│ Bank Personal       │
│ Access Token        │
│                     │
│ ┌─────────────────┐ │
│ │ PAT input       │ │ ← Text input (48dp height)
│ │ •••••••••••     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │   Add Account   │ │ ← Button (48dp height)
│ └─────────────────┘ │
│                     │
│ [Instructions/help] │
│                     │
└─────────────────────┘
```

**Elements:**
- **Back button:** 44x44dp touch target (top left)
- **Title:** "Add Account"
- **Instructions:** Clear text explaining what a PAT is
- **Text input:** 
  - 48dp minimum height
  - Secure text entry (masked)
  - Full width with padding
  - Large, readable font
- **Add button:**
  - 48dp minimum height
  - Full width with padding
  - Teal background
  - Shows loading spinner when verifying
- **Error messages:**
  - Red text below input
  - Clear, actionable error descriptions

### Account Detail Screen (Future)
**Purpose:** Show detailed information for a single account

**Layout:**
```
┌─────────────────────┐
│ [←] Personal        │ ← Header with back button
├─────────────────────┤
│ Available Balance   │
│ £123.45             │ ← Large, prominent
│                     │
│ Cleared    £120.00  │ ← Smaller detail rows
│ Pending    £3.45    │
│                     │
│ Last updated: 2m ago│
├─────────────────────┤
│ Recent Transactions │
│ ┌─────────────────┐ │
│ │ Tesco      £-15 │ │ ← Transaction rows
│ │ 10:30am         │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Salary    £2000 │ │
│ │ Yesterday       │ │
│ └─────────────────┘ │
│                     │
│ [Scrollable...]  ║  │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ Remove Account  │ │ ← Danger button (bottom)
│ └─────────────────┘ │
└─────────────────────┘
```

**Elements:**
- **Back button:** Return to Home
- **Balance section (fixed):**
  - Available balance: Very large text
  - Cleared/Pending: Smaller rows
  - Last updated timestamp
  
- **Transactions (scrollable):**
  - Full-width transaction cards
  - Minimum 52dp height
  - Left: Merchant name + time/date
  - Right: Amount (color-coded: red for debits, green for credits)
  - 8dp spacing between cards
  
- **Remove button (fixed, bottom):**
  - 48dp minimum height
  - Red background (danger)
  - Full width with padding
  - Requires confirmation dialog

## Technical Specifications

### API Integration
- **Endpoint:** `https://api.starlingbank.com`
- **Authentication:** Bearer token (PAT) per account
- **Key endpoints:**
  - `GET /api/v2/accounts` - Get account details
  - `GET /api/v2/accounts/{accountUid}/balance` - Get balance
  - `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}` - Get transactions (future)

### Data Storage
- **Secure storage:** Expo SecureStore
- **Stored data:**
  ```typescript
  interface StoredAccount {
    accountUid: string;
    accountName: string;
    accountType: string;
    token: string;      // PAT - encrypted by SecureStore
    addedAt: string;    // ISO timestamp
  }
  ```
- **Storage key:** `starling_accounts` (JSON array)

### Performance Targets
- **Cold start:** < 3 seconds on low-power device
- **API response:** Show loading state, timeout at 10 seconds
- **Scroll performance:** Maintain 60fps (or device maximum)
- **Bundle size:** < 20MB total app size
- **Memory usage:** < 100MB RAM

### Error Handling
- **Network errors:** Show friendly message, allow retry
- **API errors:** Display specific error from Starling (e.g., "Invalid PAT")
- **Storage errors:** Gracefully degrade, don't crash
- **Timeout handling:** 10-second timeout on API calls

### Accessibility
- **Touch targets:** Minimum 44x44dp (iOS guideline, works for Android)
- **Text size:** Minimum 14sp for body text, 16sp+ preferred
- **Contrast:** Meet WCAG AA standards minimum
- **Spacing:** 8dp minimum between interactive elements
- **D-pad navigation:** All interactive elements must be focusable and navigable with arrow keys
- **Focus indicators:** 2dp teal border around focused elements
- **Keyboard events:** Handle hardware key presses (arrows, OK/Enter, Back)

## Future Features (Not MVP)

### Phase 2
- Transaction history in Account Detail screen
- Transaction filtering (by date, amount, merchant)
- Search transactions
- Export transactions to CSV

### Phase 3
- Multiple currency support (GBP, EUR, USD sub-accounts)
- Spending insights/categories
- Budget tracking
- Notifications for large transactions

### Phase 4
- Widgets for home screen (balance at a glance)
- Biometric authentication option
- Dark/light theme toggle
- Account nicknames (custom names)

## Out of Scope
- **No payments:** Read-only app, no ability to make transfers
- **No account creation:** Users must have existing Starling accounts
- **No PAT generation:** Users must create PATs in Starling Developer portal
- **No multi-device sync:** Each device stores its own account list
- **No cloud backup:** Local storage only

## Testing Checklist

### Small Screen Testing
- [ ] Test on 480x640 resolution
- [ ] Verify all text is readable
- [ ] Confirm all buttons are tappable
- [ ] No horizontal scrolling
- [ ] No content cutoff

### Performance Testing
- [ ] Cold start time < 3 seconds
- [ ] Smooth scrolling (no jank)
- [ ] API calls complete in reasonable time
- [ ] App doesn't crash on low memory

### Functionality Testing
- [ ] Add first account (PAT verification works)
- [ ] Add multiple accounts
- [ ] Pull-to-refresh updates balances
- [ ] Navigate between screens
- [ ] Scrollbar appears when content scrollable
- [ ] App remembers accounts after restart
- [ ] Remove account (when implemented)

### D-pad Navigation Testing
- [ ] All interactive elements are focusable with D-pad
- [ ] Up/Down navigation works correctly
- [ ] Focus indicators are clearly visible
- [ ] OK/Enter activates focused elements
- [ ] Auto-scroll keeps focused element visible
- [ ] Focus wraps around at list boundaries
- [ ] Both touch and D-pad work simultaneously

### Edge Cases
- [ ] No accounts (empty state)
- [ ] Single account (no scroll)
- [ ] Many accounts (scroll performance)
- [ ] Invalid PAT (error handling)
- [ ] Network offline (error handling)
- [ ] API timeout (timeout handling)
- [ ] Malformed API response (error handling)

---

**Notes:**
- This spec assumes Android-only deployment initially
- iOS support could be added later with minimal changes
- All measurements are in dp (density-independent pixels) for Android
- Color codes are placeholders - refer to `src/theme/colors.ts` for exact values
