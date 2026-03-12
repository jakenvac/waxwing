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
import type { AccountDetailScreenProps } from '../types';
import type { Balance, FeedItem } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { getAccountBalance, getTransactionFeed, formatCurrency } from '../services/starlingApi';
import { useFocusEffect } from '@react-navigation/native';

export default function AccountDetailScreen({ navigation, route }: AccountDetailScreenProps) {
  const { accountUid, accountName, accountType, defaultCategory, token } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<FeedItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-2); // Track focus for D-pad
  
  // Use Animated.Value for smooth scrollbar
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

      console.log('[AccountDetail] ========== FETCHING DATA ==========');
      console.log('[AccountDetail] accountUid:', accountUid);
      console.log('[AccountDetail] accountName:', accountName);
      console.log('[AccountDetail] accountType:', accountType);
      console.log('[AccountDetail] defaultCategory:', defaultCategory);
      console.log('[AccountDetail] token (first 10 chars):', token.substring(0, 10) + '...');

      // Fetch balance
      console.log('[AccountDetail] Fetching balance...');
      const balanceResult = await getAccountBalance(token, accountUid);
      if (balanceResult.success) {
        console.log('[AccountDetail] Balance fetch successful');
        setBalance(balanceResult.data);
      } else {
        console.error('[AccountDetail] Failed to fetch balance:', balanceResult.error);
      }

      // Fetch transactions using the defaultCategory from route params
      console.log('[AccountDetail] Fetching transactions...');
      const feedResult = await getTransactionFeed(token, accountUid, defaultCategory);
      if (feedResult.success) {
        console.log('[AccountDetail] Transaction fetch successful, got', feedResult.data.feedItems.length, 'items');
        setTransactions(feedResult.data.feedItems);
      } else {
        console.error('[AccountDetail] Failed to fetch transactions:', feedResult.error);
      }

      setLastUpdated(new Date());
      console.log('[AccountDetail] ========== FETCH COMPLETE ==========');
    } catch (err) {
      console.error('[AccountDetail] Error fetching data:', err);
      console.error('[AccountDetail] Error type:', err?.constructor?.name);
      console.error('[AccountDetail] Error message:', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  // Handle scroll for scrollbar
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollHeightVal = layoutMeasurement.height;
    const contentHeightVal = contentSize.height;
    const scrollOffset = contentOffset.y;

    scrollHeight.current = scrollHeightVal;
    contentHeight.current = contentHeightVal;

    if (contentHeightVal > scrollHeightVal) {
      const indicatorHeight = Math.max((scrollHeightVal / contentHeightVal) * scrollHeightVal, 30);
      const maxScrollOffset = contentHeightVal - scrollHeightVal;
      const indicatorOffset = (scrollOffset / maxScrollOffset) * (scrollHeightVal - indicatorHeight);

      scrollIndicatorHeight.setValue(indicatorHeight);
      scrollIndicatorOffset.setValue(indicatorOffset);
      
      if (!showScrollbar) {
        setShowScrollbar(true);
      }
    } else {
      if (showScrollbar) {
        setShowScrollbar(false);
      }
    }
  };

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    scrollHeight.current = height;
    
    if (contentHeight.current > 0) {
      updateScrollbar();
    }
  };

  const handleContentSizeChange = (_width: number, height: number) => {
    contentHeight.current = height;
    
    if (scrollHeight.current > 0) {
      updateScrollbar();
    }
  };

  const updateScrollbar = () => {
    const contentHeightVal = contentHeight.current;
    const scrollHeightVal = scrollHeight.current;

    if (contentHeightVal > scrollHeightVal) {
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

  if (loading) {
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
          style={[
            styles.backButton,
            focusedIndex === -1 && styles.focusedElement
          ]}
          onPress={handleBack}
          onFocus={() => setFocusedIndex(-1)}
          onBlur={() => setFocusedIndex(-2)}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{accountName}</Text>
          <Text style={styles.headerSubtitle}>{accountType}</Text>
        </View>
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
              <Text style={styles.balanceLabel}>Available Balance</Text>
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
              
              <Text style={styles.lastUpdated}>
                Last updated: {formatRelativeTime(lastUpdated.toISOString())}
              </Text>
            </View>
          ) : (
            <View style={styles.balanceSection}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          {/* Transactions Section */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            
            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              transactions.map((transaction, index) => {
                const isFocused = focusedIndex === index;
                const isDebit = transaction.direction === 'OUT';
                const amountColor = isDebit ? '#FF6B6B' : '#10B981'; // vibrant coral red for debits, green for credits
                
                return (
                  <TouchableOpacity
                    key={transaction.feedItemUid}
                    style={[
                      styles.transactionCard,
                      isFocused && styles.focusedElement
                    ]}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-2)}
                    activeOpacity={0.7}
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
    padding: spacing.lg,
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
    marginBottom: spacing.md,
  },
  balanceDetails: {
    marginBottom: spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  balanceDetailLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
  balanceDetailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  lastUpdated: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
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
  focusedElement: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: borderRadius.lg,
  },
});
