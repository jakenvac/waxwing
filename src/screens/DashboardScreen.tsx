import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import type { DashboardScreenProps, Account, Balance } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { getAccounts, getAccountBalance, formatCurrency } from '../services/starlingApi';
import { getToken, deleteToken } from '../services/storage';

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balances, setBalances] = useState<Record<string, Balance>>({});

  // Fetch account data
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      // Get stored token
      const token = await getToken();
      if (!token) {
        // No token, redirect to login
        navigation.replace('Login');
        return;
      }

      // Fetch accounts
      const accountsResult = await getAccounts(token);
      if (!accountsResult.success) {
        setError(accountsResult.error);
        return;
      }

      setAccounts(accountsResult.data.accounts);

      // Fetch balance for each account
      const balancePromises = accountsResult.data.accounts.map(async (account) => {
        const balanceResult = await getAccountBalance(token, account.accountUid);
        return { accountUid: account.accountUid, balance: balanceResult };
      });

      const balanceResults = await Promise.all(balancePromises);
      const balanceMap: Record<string, Balance> = {};
      
      for (const result of balanceResults) {
        if (result.balance.success) {
          balanceMap[result.accountUid] = result.balance.data;
        }
      }

      setBalances(balanceMap);
    } catch (err) {
      setError('Failed to load account data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await deleteToken();
    navigation.replace('Login');
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => fetchData()}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Accounts</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutLink}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Account Cards */}
        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No accounts found</Text>
          </View>
        ) : (
          accounts.map((account) => {
            const balance = balances[account.accountUid];
            return (
              <View key={account.accountUid} style={styles.accountCard}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.accountType}</Text>
                
                {balance ? (
                  <>
                    <View style={styles.balanceContainer}>
                      <Text style={styles.balanceLabel}>Available Balance</Text>
                      <Text style={styles.balanceAmount}>
                        {formatCurrency(
                          balance.effectiveBalance.minorUnits,
                          balance.effectiveBalance.currency
                        )}
                      </Text>
                    </View>
                    
                    <View style={styles.detailsContainer}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cleared:</Text>
                        <Text style={styles.detailValue}>
                          {formatCurrency(
                            balance.clearedBalance.minorUnits,
                            balance.clearedBalance.currency
                          )}
                        </Text>
                      </View>
                      {balance.pendingTransactions.minorUnits !== 0 && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Pending:</Text>
                          <Text style={styles.detailValue}>
                            {formatCurrency(
                              balance.pendingTransactions.minorUnits,
                              balance.pendingTransactions.currency
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  logoutLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  accountName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  accountType: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  balanceContainer: {
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  logoutButton: {
    paddingVertical: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});
