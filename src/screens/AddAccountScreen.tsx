import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { AddAccountScreenProps } from '../types';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
import { verifyToken, getAccounts as getApiAccounts } from '../services/starlingApi';
import { addAccount } from '../services/storage';

export default function AddAccountScreen({ navigation }: AddAccountScreenProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clear form when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[AddAccount] Screen focused - clearing form');
      setToken('');
      setError('');
      setSuccess('');
      setLoading(false);
    }, [])
  );

  const handleAddAccount = async () => {
    // Clear previous error
    setError('');

    // Validate input
    if (!token.trim()) {
      setError('Please enter your access token');
      return;
    }

    setLoading(true);

    try {
      console.log('[AddAccount] ========== STARTING ADD ACCOUNT PROCESS ==========');
      console.log('[AddAccount] Token (first 10 chars):', token.trim().substring(0, 10) + '...');
      console.log('[AddAccount] Token length:', token.trim().length);
      console.log('[AddAccount] Verifying token...');
      
      // Verify token with Starling API
      const verifyResult = await verifyToken(token.trim());

      if (!verifyResult.success) {
        console.log('[AddAccount] Token verification FAILED:', verifyResult.error);
        setError(verifyResult.error);
        setLoading(false);
        return;
      }

      console.log('[AddAccount] Token verified successfully!');
      console.log('[AddAccount] Fetching account details...');

      // Fetch account details
      const accountsResult = await getApiAccounts(token.trim());
      
      if (!accountsResult.success) {
        console.log('[AddAccount] Fetch account details FAILED:', accountsResult.error);
        setError(accountsResult.error);
        setLoading(false);
        return;
      }

      console.log('[AddAccount] Found', accountsResult.data.accounts.length, 'account(s)');

      if (accountsResult.data.accounts.length === 0) {
        console.log('[AddAccount] No accounts found for this token');
        setError('No accounts found for this token');
        setLoading(false);
        return;
      }

      // Get the first account (PAT should only have access to one)
      const account = accountsResult.data.accounts[0];
      
      console.log('[AddAccount] Account details:');
      console.log('[AddAccount]   - Name:', account.name);
      console.log('[AddAccount]   - UID:', account.accountUid);
      console.log('[AddAccount]   - Type:', account.accountType);
      console.log('[AddAccount]   - Default Category:', account.defaultCategory);

      const accountToSave = {
        accountUid: account.accountUid,
        accountName: account.name,
        accountType: account.accountType,
        defaultCategory: account.defaultCategory,
        token: token.trim(),
        addedAt: Date.now(),
      };

      console.log('[AddAccount] Saving account to storage...');
      await addAccount(accountToSave);
      console.log('[AddAccount] Account saved successfully!');

      // Show success message
      setSuccess(`Account "${account.name}" added successfully!`);
      
      // Wait a moment to show success, then navigate
      setTimeout(() => {
        console.log('[AddAccount] Navigating back to Home...');
        navigation.navigate('Home');
        console.log('[AddAccount] ========== ADD ACCOUNT PROCESS COMPLETE ==========');
      }, 1000);
    } catch (err) {
      console.error('[AddAccount] ========== ERROR IN ADD ACCOUNT PROCESS ==========');
      console.error('[AddAccount] Error:', err);
      console.error('[AddAccount] Error type:', err?.constructor?.name);
      console.error('[AddAccount] Error message:', err instanceof Error ? err.message : String(err));
      if (err instanceof Error && err.stack) {
        console.error('[AddAccount] Error stack:', err.stack);
      }
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Add Account</Text>
          <Text style={styles.subtitle}>
            Enter a Personal Access Token to link your Starling account
          </Text>

          {/* Token Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Personal Access Token</Text>
            <TextInput
              style={styles.input}
              value={token}
              onChangeText={setToken}
              placeholder="Enter your token"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          {/* Add Account Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddAccount}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>Add Account</Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <Text style={styles.helpText}>
            You can generate a Personal Access Token from your Starling Bank
            developer dashboard. Each token is linked to one account.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: touchTarget.minHeight,
  },
  errorContainer: {
    backgroundColor: colors.error + '20', // 20% opacity
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#10B98120', // green with 20% opacity
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: typography.fontSize.sm,
    color: '#10B981', // green
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});
