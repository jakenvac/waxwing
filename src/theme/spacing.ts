/**
 * Spacing system for consistent layout
 * Based on 4px grid for small screens
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius values
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

/**
 * Minimum touch target size (48x48 dp recommended by Android guidelines)
 */
export const touchTarget = {
  minHeight: 48,
  minWidth: 48,
};

/**
 * Screen padding for small screens
 */
export const screenPadding = {
  horizontal: spacing.md,
  vertical: spacing.lg,
};
