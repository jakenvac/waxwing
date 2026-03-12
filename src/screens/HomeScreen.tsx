import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import type { HomeScreenProps } from '../types';
import type { Balance } from '../types';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
import commonStyles from '../styles/commonStyles';
import { getAccountBalance, formatCurrency } from '../services/starlingApi';
import { getAccounts, type StoredAccount } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollbar } from '../hooks/useScrollbar';
import ScrollbarIndicator from '../components/ScrollbarIndicator';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const {
    showScrollbar,
    scrollIndicatorOffset,
    scrollIndicatorHeight,
    handleScroll,
    handleLayout,
    handleContentSizeChange,
  } = useScrollbar();

  // Fetch account data
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('[Home] Fetching stored accounts...');

      // Get stored accounts
      const storedAccounts = await getAccounts();
      
      console.log('[Home] Found', storedAccounts.length, 'stored accounts');
      
      setAccounts(storedAccounts);

      // Fetch balance for each account
      const balancePromises = storedAccounts.map(async (account) => {
        const balanceResult = await getAccountBalance(account.token, account.accountUid);
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
      console.error('[Home] Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload accounts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true);
  };

  // Handle add account
  const handleAddAccount = () => {
    navigation.navigate('AddAccount');
  };

  if (loading) {
    return (
      <View style={commonStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={commonStyles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Waxwing</Text>
          <Text style={styles.subtitle}>Accounts</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addIconButton}
            onPress={handleAddAccount}
            activeOpacity={0.7}
          >
            <Icon name="bank-plus" size={32} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Account List */}
      <View style={commonStyles.scrollContainer}>
        <ScrollView
          style={commonStyles.scrollView}
          contentContainerStyle={commonStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={handleLayout}
          onContentSizeChange={handleContentSizeChange}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Account Cards */}
          {accounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No accounts added yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first account to get started
              </Text>
            </View>
          ) : (
            accounts.map((account) => {
              const balance = balances[account.accountUid];
              return (
                <TouchableOpacity 
                  key={account.accountUid}
                  style={styles.accountCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.navigate('AccountDetail', {
                      accountUid: account.accountUid,
                      accountName: account.accountName,
                      accountType: account.accountType,
                      defaultCategory: account.defaultCategory,
                      token: account.token,
                    });
                  }}
                >
                  <View style={styles.cardContent}>
                    {/* Left side - Account info */}
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{account.accountName}</Text>
                      <Text style={styles.accountType}>{account.accountType}</Text>
                    </View>
                    
                    {/* Spacer */}
                    <View style={styles.spacer} />
                    
                    {/* Right side - Balance */}
                    {balance ? (
                      <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>Available</Text>
                        <Text style={styles.balanceAmount}>
                          {formatCurrency(
                            balance.effectiveBalance.minorUnits,
                            balance.effectiveBalance.currency
                          )}
                        </Text>
                      </View>
                    ) : (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <ScrollbarIndicator
          visible={showScrollbar}
          offset={scrollIndicatorOffset}
          height={scrollIndicatorHeight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addIconButton: {
    padding: spacing.xs,
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: touchTarget.minHeight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountInfo: {
    justifyContent: 'center',
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
  },
  spacer: {
    flex: 1,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
