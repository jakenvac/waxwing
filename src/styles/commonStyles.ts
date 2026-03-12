/**
 * Shared styles reused across multiple screens.
 * Import individual entries as needed rather than spreading the whole object,
 * to keep StyleSheet.create() calls per-file for RN optimisation.
 */
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

const commonStyles = StyleSheet.create({
  /** Full-screen background container */
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /** Centred loading / empty state container */
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  /** Small loading text beneath a spinner */
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  /** Wrapper that positions the custom scrollbar indicator */
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },

  /** The ScrollView itself */
  scrollView: {
    flex: 1,
  },

  /** Standard scroll content padding */
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
});

export default commonStyles;
