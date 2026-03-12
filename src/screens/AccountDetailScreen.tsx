import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  findNodeHandle,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import type { AccountDetailScreenProps } from '../types';
import type { Balance, FeedItem } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { getAccountBalance, getTransactionFeed, formatCurrency } from '../services/starlingApi';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollbar } from '../hooks/useScrollbar';
import ScrollbarIndicator from '../components/ScrollbarIndicator';

export default function AccountDetailScreen({ navigation, route }: AccountDetailScreenProps) {
  const { accountUid, accountName, accountType, defaultCategory, token } = route.params;

  const backButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const cogButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const savingsGoalsRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const payeesRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const sendMoneyRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const receiveMoneyRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const firstTransactionRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<FeedItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const {
    showScrollbar,
    scrollIndicatorOffset,
    scrollIndicatorHeight,
    handleScroll,
    handleLayout,
    handleContentSizeChange,
  } = useScrollbar();

  // Fetch balance and transactions in parallel, updating each independently
  const fetchData = async (isRefresh = false) => {
    console.log('[AccountDetail] ========== FETCHING DATA ==========');
    console.log('[AccountDetail] accountUid:', accountUid);
    console.log('[AccountDetail] defaultCategory:', defaultCategory);
    console.log('[AccountDetail] token (first 10 chars):', token.substring(0, 10) + '...');

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingBalance(true);
      setLoadingTransactions(true);
    }

    const fetchBalance = async () => {
      try {
        console.log('[AccountDetail] Fetching balance...');
        const result = await getAccountBalance(token, accountUid);
        if (result.success) {
          console.log('[AccountDetail] Balance fetch successful');
          setBalance(result.data);
          setLastUpdated(new Date());
        } else {
          console.error('[AccountDetail] Failed to fetch balance:', result.error);
        }
      } catch (err) {
        console.error('[AccountDetail] Balance fetch error:', err);
      } finally {
        setLoadingBalance(false);
      }
    };

    const fetchTransactions = async () => {
      try {
        console.log('[AccountDetail] Fetching transactions...');
        const result = await getTransactionFeed(token, accountUid, defaultCategory);
        if (result.success) {
          console.log('[AccountDetail] Transaction fetch successful, got', result.data.feedItems.length, 'items');
          setTransactions(result.data.feedItems);
        } else {
          console.error('[AccountDetail] Failed to fetch transactions:', result.error);
        }
      } catch (err) {
        console.error('[AccountDetail] Transaction fetch error:', err);
      } finally {
        setLoadingTransactions(false);
        if (isRefresh) setRefreshing(false);
      }
    };

    // Fire both in parallel - each updates its own state as it resolves
    await Promise.all([fetchBalance(), fetchTransactions()]);
    console.log('[AccountDetail] ========== FETCH COMPLETE ==========');
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true);
  };

  // Handle back button
  const handleBack = () => {
    navigation.goBack();
  };


  // Format relative time (e.g., "2m ago", "1h ago")
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // Format as date for older transactions
    return then.toLocaleDateString();
  };

  // Format transaction time to show date and time
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if it's today
    const isToday = date.toDateString() === now.toDateString();
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    // Format time
    const hours = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const timeStr = `${displayHours}:${mins}${ampm}`;
    
    // Format date
    if (isToday) {
      return `Today ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday ${timeStr}`;
    } else {
      // Show date (e.g., "12 Mar")
      const day = date.getDate();
      const month = date.toLocaleDateString('en-GB', { month: 'short' });
      return `${day} ${month} ${timeStr}`;
    }
  };

  // Only block render until balance is ready - transactions load inline
  if (loadingBalance && balance === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading account details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          ref={backButtonRef}
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          nextFocusRight={findNodeHandle(cogButtonRef.current) ?? undefined}
          nextFocusDown={findNodeHandle(savingsGoalsRef.current) ?? undefined}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{accountName}</Text>
          <Text style={styles.headerSubtitle}>{accountType}</Text>
        </View>
        <TouchableOpacity
          ref={cogButtonRef}
          style={styles.cogButton}
          onPress={() => navigation.navigate('Settings', { accountUid, accountName, token })}
          activeOpacity={0.7}
          nextFocusLeft={findNodeHandle(backButtonRef.current) ?? undefined}
        >
          <Icon name="cog-outline" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
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
          {/* Balance Section */}
          {balance ? (
            <View style={styles.balanceSection}>
              {/* Header row: label + last updated */}
              <View style={styles.balanceLabelRow}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.lastUpdated}>
                  {formatRelativeTime(lastUpdated.toISOString())}
                </Text>
              </View>

              {/* Main row: big amount + cleared/pending stack */}
              <View style={styles.balanceMainRow}>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(
                    balance.effectiveBalance.minorUnits,
                    balance.effectiveBalance.currency
                  )}
                </Text>

                <View style={styles.balanceDetails}>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceDetailLabel}>Cleared</Text>
                    <Text style={styles.balanceDetailValue}>
                      {formatCurrency(
                        balance.clearedBalance.minorUnits,
                        balance.clearedBalance.currency
                      )}
                    </Text>
                  </View>

                  {balance.pendingTransactions.minorUnits !== 0 && (
                    <View style={styles.balanceRow}>
                      <Text style={styles.balanceDetailLabel}>Pending</Text>
                      <Text style={styles.balanceDetailValue}>
                        {formatCurrency(
                          balance.pendingTransactions.minorUnits,
                          balance.pendingTransactions.currency
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.balanceSection}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            {[
              { label: 'Savings Goals', icon: 'piggy-bank-outline', ref: savingsGoalsRef, upRef: backButtonRef, downRef: payeesRef, route: 'SavingsGoals' },
              { label: 'Payees',        icon: 'account-multiple-outline', ref: payeesRef, upRef: savingsGoalsRef, downRef: sendMoneyRef, route: 'Payees' },
              { label: 'Send Money',    icon: 'bank-transfer-out', ref: sendMoneyRef, upRef: payeesRef, downRef: receiveMoneyRef, route: 'SendMoney' },
              { label: 'Receive Money', icon: 'bank-transfer-in',  ref: receiveMoneyRef, upRef: sendMoneyRef, downRef: firstTransactionRef, route: 'ReceiveMoney' },
            ].map(({ label, icon, ref, upRef, downRef, route: targetRoute }, index, arr) => (
              <TouchableOpacity
                key={label}
                ref={ref}
                style={[styles.actionRow, index === arr.length - 1 && styles.actionRowLast]}
                activeOpacity={0.7}
                nextFocusUp={findNodeHandle(upRef.current) ?? undefined}
                nextFocusDown={findNodeHandle(downRef.current) ?? undefined}
                onPress={() => navigation.navigate(targetRoute as any, { accountUid, accountName, token })}
              >
                <Icon name={icon as any} size={22} color={colors.textSecondary} />
                <Text style={styles.actionLabel}>{label}</Text>
                <Icon name="chevron-right" size={20} color={colors.textDisabled} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Transactions Section */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            
            {loadingTransactions ? (
              <View style={styles.transactionsLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.transactionsLoadingText}>Loading transactions...</Text>
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No transactions in the last 7 days</Text>
              </View>
            ) : (
              transactions.map((transaction, index) => {
                const isDebit = transaction.direction === 'OUT';
                const amountColor = isDebit ? colors.debit : colors.success;
                
                return (
                  <TouchableOpacity
                    key={transaction.feedItemUid}
                    ref={index === 0 ? firstTransactionRef : undefined}
                    style={styles.transactionCard}
                    activeOpacity={0.7}
                    nextFocusUp={index === 0 ? findNodeHandle(backButtonRef.current) ?? undefined : undefined}
                    onPress={() => {
                      console.log('[AccountDetail] Transaction pressed:', transaction.feedItemUid);
                      // TODO: Show transaction detail
                    }}
                  >
                    <View style={styles.transactionContent}>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionName}>
                          {transaction.counterPartyName || transaction.reference || 'Transaction'}
                        </Text>
                        <Text style={styles.transactionTime}>
                          {formatTime(transaction.transactionTime)}
                          {transaction.status === 'PENDING' && ' • Pending'}
                        </Text>
                      </View>
                      
                      <Text style={[styles.transactionAmount, { color: amountColor }]}>
                        {isDebit ? '-' : '+'}
                        {formatCurrency(
                          transaction.amount.minorUnits,
                          transaction.amount.currency
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  cogButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  balanceSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  lastUpdated: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textDisabled,
  },
  balanceMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  balanceDetails: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  balanceDetailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
  balanceDetailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  quickActionsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  transactionsSection: {
    marginTop: spacing.sm,
  },
  transactionsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  transactionsLoadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  transactionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 52,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  transactionTime: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
