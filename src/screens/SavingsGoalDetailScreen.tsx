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
import type { SavingsGoalDetailScreenProps } from '../types';
import type { SavingsGoal, FeedItem, Balance } from '../types';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
import { getSavingsGoals, getTransactionFeed, getAccountBalance, addMoneyToSavingsGoal, formatCurrency } from '../services/starlingApi';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollbar } from '../hooks/useScrollbar';
import ScrollbarIndicator from '../components/ScrollbarIndicator';
import ScreenHeader from '../components/ScreenHeader';
import commonStyles from '../styles/commonStyles';
import AddMoneyModal from '../components/AddMoneyModal';

export default function SavingsGoalDetailScreen({ navigation, route }: SavingsGoalDetailScreenProps) {
  const {
    accountUid,
    accountName,
    token,
    savingsGoalUid,
    goalName,
    totalSavedMinorUnits,
    totalSavedCurrency,
    targetMinorUnits,
    targetCurrency,
    savedPercentage: initialPct,
  } = route.params;

  const backButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const addMoneyRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const withdrawMoneyRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const firstTransactionRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  // Goal state — seeded from nav params, refreshed on pull-to-refresh
  const [goal, setGoal] = useState<SavingsGoal>({
    savingsGoalUid,
    name: goalName,
    totalSaved: { minorUnits: totalSavedMinorUnits, currency: totalSavedCurrency },
    target: targetMinorUnits !== undefined && targetCurrency !== undefined
      ? { minorUnits: targetMinorUnits, currency: targetCurrency }
      : undefined,
    savedPercentage: initialPct,
    state: 'ACTIVE',
  });

  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<FeedItem[]>([]);

  // Account balance for available funds check in the add money modal
  const [accountBalance, setAccountBalance] = useState<Balance | null>(null);

  // Add money modal state
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [addMoneySubmitting, setAddMoneySubmitting] = useState(false);
  const [addMoneyError, setAddMoneyError] = useState('');

  const {
    showScrollbar,
    scrollIndicatorOffset,
    scrollIndicatorHeight,
    handleScroll,
    handleLayout,
    handleContentSizeChange,
  } = useScrollbar();

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingTransactions(true);
    }

    // Refresh goal data, account balance, and transactions in parallel
    const fetchGoal = async () => {
      const result = await getSavingsGoals(token, accountUid);
      if (result.success) {
        const updated = result.data.savingsGoalList.find(
          g => g.savingsGoalUid === savingsGoalUid
        );
        if (updated) setGoal(updated);
      }
    };

    const fetchBalance = async () => {
      const result = await getAccountBalance(token, accountUid);
      if (result.success) setAccountBalance(result.data);
    };

    const fetchTransactions = async () => {
      const result = await getTransactionFeed(token, accountUid, savingsGoalUid);
      if (result.success) {
        setTransactions(result.data.feedItems);
      }
      setLoadingTransactions(false);
      if (isRefresh) setRefreshing(false);
    };

    await Promise.all([fetchGoal(), fetchBalance(), fetchTransactions()]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const hours = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const timeStr = `${displayHours}:${mins}${ampm}`;
    if (isToday) return `Today ${timeStr}`;
    if (isYesterday) return `Yesterday ${timeStr}`;
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    return `${day} ${month} ${timeStr}`;
  };

  const handleAddMoneySubmit = async (minorUnits: number) => {
    setAddMoneySubmitting(true);
    setAddMoneyError('');
    const result = await addMoneyToSavingsGoal(
      token,
      accountUid,
      savingsGoalUid,
      minorUnits,
      goal.totalSaved.currency
    );
    setAddMoneySubmitting(false);
    if (result.success && result.data.success) {
      setAddMoneyVisible(false);
      // Refresh goal and transactions to reflect the transfer
      fetchData(true);
    } else {
      setAddMoneyError(
        result.success ? 'Transfer failed. Please try again.' : result.error
      );
    }
  };

  const pct = goal.savedPercentage ?? null;
  const hasTarget = goal.target !== undefined;

  return (
    <View style={commonStyles.container}>
      <AddMoneyModal
        visible={addMoneyVisible}
        availableMinorUnits={accountBalance?.effectiveBalance.minorUnits ?? 0}
        currency={goal.totalSaved.currency}
        submitting={addMoneySubmitting}
        error={addMoneyError}
        onSubmit={handleAddMoneySubmit}
        onCancel={() => { setAddMoneyVisible(false); setAddMoneyError(''); }}
      />
      <ScreenHeader
        title={goal.name}
        subtitle={accountName}
        onBack={() => navigation.goBack()}
        backButtonRef={backButtonRef}
        backButtonProps={{
          nextFocusDown: findNodeHandle(addMoneyRef.current) ?? undefined,
        }}
      />

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
              onRefresh={() => fetchData(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Balance Card */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Saved</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(goal.totalSaved.minorUnits, goal.totalSaved.currency)}
            </Text>

            {hasTarget && goal.target && (
              <>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(pct ?? 0, 100)}%` },
                    ]}
                  />
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>
                    of {formatCurrency(goal.target.minorUnits, goal.target.currency)}
                  </Text>
                  {pct !== null && (
                    <Text style={styles.targetPercent}>{pct}%</Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              ref={addMoneyRef}
              style={styles.actionRow}
              activeOpacity={0.7}
              nextFocusUp={findNodeHandle(backButtonRef.current) ?? undefined}
              nextFocusDown={findNodeHandle(withdrawMoneyRef.current) ?? undefined}
              onPress={() => { setAddMoneyError(''); setAddMoneyVisible(true); }}
            >
              <Icon name="bank-transfer-in" size={22} color={colors.textSecondary} />
              <Text style={styles.actionLabel}>Add Money</Text>
              <Icon name="chevron-right" size={20} color={colors.textDisabled} />
            </TouchableOpacity>
            <TouchableOpacity
              ref={withdrawMoneyRef}
              style={[styles.actionRow, styles.actionRowLast]}
              activeOpacity={0.7}
              nextFocusUp={findNodeHandle(addMoneyRef.current) ?? undefined}
              nextFocusDown={findNodeHandle(firstTransactionRef.current) ?? undefined}
            >
              <Icon name="bank-transfer-out" size={22} color={colors.textSecondary} />
              <Text style={styles.actionLabel}>Withdraw Money</Text>
              <Icon name="chevron-right" size={20} color={colors.textDisabled} />
            </TouchableOpacity>
          </View>

          {/* Transactions */}
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
                    nextFocusUp={
                      index === 0
                        ? findNodeHandle(withdrawMoneyRef.current) ?? undefined
                        : undefined
                    }
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
  balanceSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  targetPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  actionsSection: {
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
    minHeight: touchTarget.minHeight,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  actionLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  transactionsSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  transactionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: touchTarget.minHeight,
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
});
