import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import type { HomeScreenProps } from '../types';
import type { Balance } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { getAccountBalance, formatCurrency } from '../services/starlingApi';
import { getAccounts, deleteAllAccounts, type StoredAccount } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [balances, setBalances] = useState<Record<string, Balance>>({});
  const [showScrollbar, setShowScrollbar] = useState(false);
  
  // Use Animated.Value for smooth, performant scrollbar updates
  const scrollIndicatorOffset = useRef(new Animated.Value(0)).current;
  const scrollIndicatorHeight = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  const scrollHeight = useRef(0);

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

  // DEBUG: Handle delete all accounts
  const handleDeleteAll = async () => {
    await deleteAllAccounts();
    setAccounts([]);
    setBalances({});
  };

  // Handle scroll to update indicator position (using Animated for performance)
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollHeightVal = layoutMeasurement.height;
    const contentHeightVal = contentSize.height;
    const scrollOffset = contentOffset.y;

    // Store values in refs
    scrollHeight.current = scrollHeightVal;
    contentHeight.current = contentHeightVal;

    if (contentHeightVal > scrollHeightVal) {
      // Calculate indicator height and position
      const indicatorHeight = Math.max((scrollHeightVal / contentHeightVal) * scrollHeightVal, 30);
      const maxScrollOffset = contentHeightVal - scrollHeightVal;
      const indicatorOffset = (scrollOffset / maxScrollOffset) * (scrollHeightVal - indicatorHeight);

      // Use Animated.timing for smooth updates without causing re-renders
      scrollIndicatorHeight.setValue(indicatorHeight);
      scrollIndicatorOffset.setValue(indicatorOffset);
      
      if (!showScrollbar) {
        setShowScrollbar(true);
      }
    } else {
      // No scrollable content
      if (showScrollbar) {
        setShowScrollbar(false);
      }
    }
  };

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    scrollHeight.current = height;
    
    // Recalculate scrollbar if we have content
    if (contentHeight.current > 0) {
      updateScrollbar();
    }
  };

  const handleContentSizeChange = (_width: number, height: number) => {
    contentHeight.current = height;
    
    // Recalculate scrollbar when content size changes
    if (scrollHeight.current > 0) {
      updateScrollbar();
    }
  };

  const updateScrollbar = () => {
    const contentHeightVal = contentHeight.current;
    const scrollHeightVal = scrollHeight.current;

    if (contentHeightVal > scrollHeightVal) {
      // Calculate initial indicator height (at scroll position 0)
      const indicatorHeight = Math.max((scrollHeightVal / contentHeightVal) * scrollHeightVal, 30);
      
      scrollIndicatorHeight.setValue(indicatorHeight);
      scrollIndicatorOffset.setValue(0);
      
      if (!showScrollbar) {
        setShowScrollbar(true);
      }
    } else {
      if (showScrollbar) {
        setShowScrollbar(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Waxwing</Text>
          <Text style={styles.subtitle}>Accounts</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAll}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>DELETE</Text>
          </TouchableOpacity>
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
      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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

        {/* Custom Scroll Indicator */}
        {showScrollbar && (
          <View style={styles.scrollIndicatorTrack}>
            <Animated.View 
              style={[
                styles.scrollIndicatorThumb,
                {
                  height: scrollIndicatorHeight,
                  transform: [{ translateY: scrollIndicatorOffset }],
                },
              ]}
            />
          </View>
        )}
      </View>
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
  deleteButton: {
    backgroundColor: colors.debit, // coral red for DEBUG visibility
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  addIconButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
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
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
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
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollIndicatorTrack: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'transparent',
  },
  scrollIndicatorThumb: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.6,
  },

});
