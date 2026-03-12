import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { colors, typography, spacing, touchTarget } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** Forward a ref to the back button (e.g. for D-pad focus wiring). */
  backButtonRef?: React.Ref<React.ElementRef<typeof TouchableOpacity>>;
  /** Extra props passed through to the back button (e.g. nextFocusRight). */
  backButtonProps?: Partial<React.ComponentProps<typeof TouchableOpacity>>;
  right?: React.ReactNode;
}

/**
 * Standard screen header used by all screens.
 * Back button always uses the arrow-left icon.
 * Optional subtitle shown below the title.
 * Optional right slot for additional buttons (e.g. cog).
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  backButtonRef,
  backButtonProps,
  right,
}: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        ref={backButtonRef as React.RefObject<React.ElementRef<typeof TouchableOpacity>>}
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        {...backButtonProps}
      >
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  right: {
    marginLeft: spacing.sm,
  },
});
