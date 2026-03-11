# Waxwing - Starling Bank Interface

## Project Overview
A minimal Starling Bank interface designed specifically for Android devices with small screens (2.8", 480x640). The app provides essential banking functionality optimized for compact displays and keyboard navigation.

## Technical Stack
- **Platform**: React Native with Expo (Android only)
- **Language**: TypeScript
- **Build**: Local builds (no EAS)
- **Target Screen Size**: 2.8 inches (480x640)
- **API**: Starling Bank Developer API

## Design System

### Theme
- **Primary Color Scheme**: Dark purple theme
- **Style**: Sleek, modern, minimal
- **Color Palette** (to be refined):
  - Primary: Deep purple (#2D1B4E, #3E2463)
  - Secondary: Medium purple (#6B46C1, #7C3AED)
  - Accent: Light purple/lavender (#A78BFA, #C4B5FD)
  - Background: Very dark purple/black (#1A0F2E, #0F0A1E)
  - Text Primary: White (#FFFFFF)
  - Text Secondary: Light gray/purple tint (#E2D9F3)
  - Success: Green (#10B981)
  - Warning: Amber (#F59E0B)
  - Error: Red (#EF4444)

### Small Screen Guidelines
1. **No Horizontal Clutter**
   - Single column layouts only
   - Full-width components
   - Generous spacing between elements
   - No side-by-side buttons or text

2. **Touch-Friendly Surfaces**
   - Minimum touch target: 48x48 density-independent pixels
   - Large, clear buttons with adequate padding
   - Prominent tap areas for all interactive elements
   - Clear visual feedback on touch

3. **Keyboard Navigation**
   - Full support for arrow key navigation
   - Clear directional flow (primarily vertical)
   - No ambiguous navigation paths
   - Visual focus indicators for keyboard users
   - Logical tab order from top to bottom
   - Enter key activates focused elements

4. **Typography**
   - Large, readable font sizes (minimum 16sp for body text)
   - Clear hierarchy (headings significantly larger)
   - High contrast text

## Authentication

### Login Flow
- **Method**: Personal Access Token
- **No OAuth**: Users manually enter their personal access token
- **Token Storage**: Secure storage (encrypted, persistent)
- **Flow**:
  1. User opens app
  2. If not logged in, show login screen
  3. User enters personal access token
  4. Validate token with Starling API
  5. Store token securely
  6. Navigate to main app

## Core Features

### Phase 1: Initial Implementation
- [ ] Login with personal access token
- [ ] Display account balance
- [ ] Secure token storage
- [ ] Basic error handling

### Phase 2: Future Features (Planned)
- [ ] Transaction history
- [ ] Transaction search/filter
- [ ] Multiple account support
- [ ] Spending insights
- [ ] Account details
- [ ] Logout functionality

## Screen Structure

### 1. Login Screen
- **Purpose**: Authenticate user with personal access token
- **Components**:
  - App logo/title
  - Token input field (secure text entry)
  - Login button
  - Error message display
  - Loading state
- **Navigation**: Single action (submit) moves to Dashboard
- **Keyboard Support**: Enter submits form

### 2. Dashboard Screen (Initial)
- **Purpose**: Display primary account information
- **Components**:
  - Account name/title
  - Current balance (prominent display)
  - Available balance (if different)
  - Last updated timestamp
  - Refresh button
- **Navigation**: Linear vertical flow
- **Keyboard Support**: Arrow down to navigate elements, Enter to activate

## API Integration

### Endpoints (to be detailed when docs provided)
- Authentication validation
- Account list/details
- Account balance
- (Future: Transactions, etc.)

### Error Handling
- Network errors
- Invalid token
- API rate limiting
- Timeout handling
- User-friendly error messages

## Navigation Architecture
- **Pattern**: Stack navigation
- **Screens**:
  1. Login (root, if not authenticated)
  2. Dashboard (root, if authenticated)
- **Keyboard Navigation**:
  - Linear, predictable flow
  - No circular navigation ambiguity
  - Clear focus indicators

## Data Management
- **State Management**: TBD (useState/Context API initially, may upgrade if needed)
- **Persistence**: AsyncStorage for token (encrypted)
- **API Calls**: Fetch API or axios

## Security Considerations
- Encrypted storage for access token
- HTTPS only for API calls
- No token logging
- Secure input masking
- Clear error messages without exposing sensitive details

## Development Guidelines
- TypeScript strict mode
- Clear component structure
- Reusable UI components
- Consistent styling patterns
- Keyboard navigation testing for every screen
- Test on target resolution (480x640)

## Success Metrics
- App launches and displays login
- Token authentication works correctly
- Balance displays accurately
- Full keyboard navigability
- Touch targets meet minimum size requirements
- No horizontal scrolling required
- Smooth performance on low-end hardware

## Out of Scope
- iOS support
- OAuth flows
- Payment/transfer functionality (initially)
- Biometric authentication (initially)
- Multi-language support (initially)
- Accessibility features beyond keyboard navigation (initially)

---

**Last Updated**: 2026-03-11
**Status**: Phase 1 - Initial Development
