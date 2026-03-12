# Waxwing Architecture & Coding Guidelines

## Directory Structure

```
src/
  screens/          # One file per screen
  services/         # API and storage logic
  components/       # Shared/reusable UI components
  hooks/            # Custom React hooks
  theme/            # Design tokens (colors, typography, spacing)
  types/            # TypeScript types, navigation param lists
```

---

## Screens

Each screen is a single `.tsx` file in `src/screens/`. Screens are responsible for:
- Fetching their own data
- Managing their own loading/error/refresh state
- Rendering their own header (there is no React Navigation header — `headerShown: false` on all routes)

Screens should **not** contain business logic or API knowledge beyond calling service functions.

---

## Services

### `starlingApi.ts`
All Starling Bank network calls go through this file. Rules:
- All public functions return `Promise<ApiResponse<T>>` — never throw, never return raw data
- The private `makeRequest` function handles all fetch mechanics, error parsing, and logging
- No screen should ever call `fetch` directly

### `storage.ts`
All SecureStore access goes through this file. Rules:
- Screens never import `expo-secure-store` directly
- All accounts are stored as a single JSON array under `starling_accounts`
- Every mutating function reads, transforms, and writes the full array

---

## Components

Shared UI components live in `src/components/`. A component belongs here if it is:
- Used by more than one screen, **or**
- Complex enough to warrant isolation (e.g. has its own state or animation)

### Current shared components

#### `<ScreenHeader>`
Standard screen header used by all screens.

```tsx
<ScreenHeader
  title="Account Name"
  subtitle="PRIMARY"           // optional
  onBack={() => navigation.goBack()}
  right={<SomeButton />}       // optional right-side slot
/>
```

- Back button always uses the `arrow-left` MDI icon, never a text string
- `paddingHorizontal: spacing.md`, `paddingTop: spacing.lg`, `paddingBottom: spacing.md`
- `title` in `typography.fontSize.xl` bold white
- `subtitle` in `typography.fontSize.sm` regular `colors.textSecondary`

#### `<ScrollbarIndicator>`
Renders the custom scroll indicator thumb. Always used alongside the `useScrollbar` hook.

```tsx
<ScrollbarIndicator
  visible={showScrollbar}
  offset={scrollIndicatorOffset}   // Animated.Value
  height={scrollIndicatorHeight}   // Animated.Value
/>
```

---

## Hooks

Custom hooks live in `src/hooks/`.

### `useScrollbar()`
Encapsulates the custom animated scrollbar logic. Returns everything needed to wire up a `ScrollView` and render the indicator.

```tsx
const {
  showScrollbar,
  scrollIndicatorOffset,
  scrollIndicatorHeight,
  handleScroll,
  handleLayout,
  handleContentSizeChange,
} = useScrollbar();
```

Pass `handleScroll`, `handleLayout`, `handleContentSizeChange` to the `ScrollView`. Pass the returned values to `<ScrollbarIndicator>`.

---

## Theme

All design tokens live in `src/theme/`. Import via the barrel:

```tsx
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
```

Never use raw hex values or raw number literals for spacing/sizing in StyleSheets. Always use a theme token.

### Color tokens

| Token | Value | Usage |
|---|---|---|
| `colors.background` | `#1A0B2E` | Screen backgrounds |
| `colors.surface` | `#2D1B4E` | Card/surface backgrounds |
| `colors.primary` | `#7C3AED` | Primary actions, scrollbar |
| `colors.accent` | `#14B8A6` | Add/action buttons (teal) |
| `colors.textPrimary` | `#FFFFFF` | Body text |
| `colors.textSecondary` | `#C4B5FD` | Labels, subtitles |
| `colors.textDisabled` | `#6B5B95` | Timestamps, hints |
| `colors.success` | `#10B981` | Credit amounts, success messages |
| `colors.error` | `#EF4444` | Error messages |
| `colors.debit` | `#FF6B6B` | Debit/outgoing transaction amounts |
| `colors.border` | `#4C3A6D` | Card borders, dividers |

### Typography

Use `typography.fontSize.*` and `typography.fontWeight.*` — never raw strings or numbers.

### Spacing

Use `spacing.xs / sm / md / lg / xl / xxl` — never raw pixel values.

### Touch targets

Apply `touchTarget.minHeight` to any interactive element that is a primary action (buttons, inputs). Minimum is 44dp.

---

## Navigation

Navigation types live in `src/types/navigation.ts`. Rules:
- Every route has a corresponding `ScreenProps` type exported from `src/types/index.ts`
- Screens receive and destructure `navigation` and `route` via their typed `ScreenProps`
- Account-scoped screens (anything below `AccountDetail`) use `AccountRouteParams` as their base param shape: `{ accountUid, accountName, token }`
- Never pass more params than a screen needs

### Route hierarchy

```
Home
├── AddAccount
└── AccountDetail
    ├── Settings
    ├── SavingsGoals
    ├── Payees
    ├── SendMoney
    └── ReceiveMoney
```

---

## State & Data Loading

### Data fetching pattern

All data-fetching screens use `useFocusEffect` (not `useEffect`) so data reloads when navigating back to a screen:

```tsx
useFocusEffect(
  useCallback(() => {
    fetchData();
  }, [])
);
```

### Loading states

- **Full-screen block:** Used only when the primary content (e.g. balance) is not yet available for first render
- **Inline spinner:** Used for secondary content that loads after the primary content is already visible (e.g. transactions loading while balance is already shown)
- **Pull-to-refresh:** All list/detail screens implement `RefreshControl` — `tintColor={colors.primary}`, `colors={[colors.primary]}`

### Refresh pattern

```tsx
const fetchData = async (isRefresh = false) => {
  if (isRefresh) setRefreshing(true);
  else setLoading(true);
  // ...
};

const handleRefresh = () => fetchData(true);
```

### Error handling

- API errors: surface a message to the user — never silently swallow
- Use the `ApiResponse<T>` discriminated union: always check `result.success` before accessing `result.data`
- Never call `.data` without first confirming `result.success === true`

---

## Coding Conventions

### StyleSheet

- All styles in a `const styles = StyleSheet.create({})` block at the **bottom** of the file
- No inline style objects (exception: dynamic values like `{ color: amountColor }`)
- Style names in `camelCase`, descriptive of the element they style

### TouchableOpacity

- Always set `activeOpacity={0.7}`
- Always set a minimum touch target — either via `touchTarget.minHeight` or by ensuring padding makes the element ≥ 44dp

### D-pad / focus

- Do **not** add custom focus indicator styles — Android's native white highlight is sufficient
- Do **not** track `focusedIndex` state to apply styles
- **Do** use `nextFocusUp` / `nextFocusDown` / `nextFocusLeft` / `nextFocusRight` with `findNodeHandle` refs where Android's automatic focus order would be incorrect (e.g. header buttons sitting above a `ScrollView`)
- Only wire focus explicitly where needed — don't over-engineer it

### Icons

- Icon package: `@react-native-vector-icons/material-design-icons`
- Import as: `import Icon from '@react-native-vector-icons/material-design-icons'`
- Prefer outline variants for secondary/subtle actions (e.g. `cog-outline`)
- Prefer filled variants for primary actions (e.g. `bank-plus`)
- Cast `name` prop to `any` when using a variable rather than a literal

### Logging

Every `console.log` / `console.error` must be prefixed with a bracketed screen or service name:

```
[API]           — starlingApi.ts network calls
[Storage]       — storage.ts SecureStore operations
[Home]          — HomeScreen
[AccountDetail] — AccountDetailScreen
[AddAccount]    — AddAccountScreen
```

Log the beginning and end of significant operations (e.g. `===== FETCHING DATA =====`). Log key values (token prefix, UIDs, counts) — never log a full token.

### PlaceholderScreen

For any screen that is not yet implemented, use the shared `PlaceholderScreen` component rather than writing a new stub from scratch:

```tsx
export default function MyScreen({ navigation, route }: MyScreenProps) {
  return (
    <PlaceholderScreen
      navigation={navigation as any}
      route={route as any}
      title="My Screen"
      iconName="some-icon-outline"
    />
  );
}
```

---

## What Not To Do

- **Don't use raw hex colours in StyleSheets** — add a token to `colors.ts` if needed
- **Don't use raw number literals for spacing/sizing** — use `spacing.*` or `borderRadius.*`
- **Don't call `fetch` directly in screens** — go through `starlingApi.ts`
- **Don't call `expo-secure-store` directly in screens** — go through `storage.ts`
- **Don't add teal focus borders to interactive elements** — Android handles focus natively
- **Don't use `useEffect` for data fetching on navigation screens** — use `useFocusEffect`
- **Don't use a text "← Back" link** — always use the `<ScreenHeader>` back button with `arrow-left` icon
- **Don't copy the scrollbar logic** — use the `useScrollbar` hook and `<ScrollbarIndicator>` component
