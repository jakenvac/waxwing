/**
 * Modal for adding money to a savings goal.
 * The parent is responsible for fetching the available balance and passing it in.
 */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
import { formatCurrency } from '../services/starlingApi';

interface Props {
  visible: boolean;
  /** Available balance in minor units (effectiveBalance — includes overdraft) */
  availableMinorUnits: number;
  currency: string;
  submitting: boolean;
  error: string;
  onSubmit: (minorUnits: number) => void;
  onCancel: () => void;
}

export default function AddMoneyModal({
  visible,
  availableMinorUnits,
  currency,
  submitting,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const [input, setInput] = useState('');

  // Clear input each time the modal opens
  useEffect(() => {
    if (visible) setInput('');
  }, [visible]);

  const handleSubmit = () => {
    const parsed = parseFloat(input);
    if (isNaN(parsed) || parsed <= 0) return;
    const minorUnits = Math.round(parsed * 100);
    onSubmit(minorUnits);
  };

  const parsedAmount = parseFloat(input);
  const minorUnitsEntered = isNaN(parsedAmount) ? 0 : Math.round(parsedAmount * 100);
  const isOverAvailable = minorUnitsEntered > availableMinorUnits;
  const isInvalid = isNaN(parsedAmount) || parsedAmount <= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>Add money</Text>

          <Text style={styles.availableLabel}>
            Available: {formatCurrency(availableMinorUnits, currency)}
          </Text>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="0.00"
            placeholderTextColor={colors.textDisabled}
            keyboardType="decimal-pad"
            autoFocus
            editable={!submitting}
          />

          {isOverAvailable && input.length > 0 && (
            <Text style={styles.validationError}>
              Amount exceeds available balance
            </Text>
          )}

          {error ? (
            <Text style={styles.validationError}>{error}</Text>
          ) : null}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={submitting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (isInvalid || isOverAvailable || submitting) && styles.confirmButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isInvalid || isOverAvailable || submitting}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.confirmButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  availableLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    minHeight: touchTarget.minHeight,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  validationError: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    minHeight: touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    minHeight: touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
});
