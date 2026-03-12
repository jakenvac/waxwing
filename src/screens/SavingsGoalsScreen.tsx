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
import type { SavingsGoalsScreenProps } from '../types';
import type { SavingsGoal } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { getSavingsGoals, formatCurrency } from '../services/starlingApi';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollbar } from '../hooks/useScrollbar';
import ScrollbarIndicator from '../components/ScrollbarIndicator';
import ScreenHeader from '../components/ScreenHeader';
import commonStyles from '../styles/commonStyles';

export default function SavingsGoalsScreen({ navigation, route }: SavingsGoalsScreenProps) {
  const { accountUid, accountName, token } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [error, setError] = useState('');

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
      setLoading(true);
    }
    setError('');

    const result = await getSavingsGoals(token, accountUid);
    if (result.success) {
      // Only show active goals
      setGoals(result.data.savingsGoalList.filter(g => g.state === 'ACTIVE'));
    } else {
      setError(result.error);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <ScreenHeader
          title="Savings Goals"
          subtitle={accountName}
          onBack={() => navigation.goBack()}
        />
        <View style={commonStyles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={commonStyles.loadingText}>Loading savings goals...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScreenHeader
        title="Savings Goals"
        subtitle={accountName}
        onBack={() => navigation.goBack()}
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
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : goals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No savings goals</Text>
            </View>
          ) : (
            goals.map((goal) => {
              const saved = formatCurrency(goal.totalSaved.minorUnits, goal.totalSaved.currency);
              const target = goal.target
                ? formatCurrency(goal.target.minorUnits, goal.target.currency)
                : null;
              const pct = goal.savedPercentage ?? null;

              return (
                <TouchableOpacity key={goal.savingsGoalUid} style={styles.goalCard} activeOpacity={0.7}>
                  <View style={styles.goalRow}>
                    <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
                    <Text style={styles.goalSaved}>{saved}</Text>
                  </View>

                  {target && (
                    <>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(pct ?? 0, 100)}%` },
                          ]}
                        />
                      </View>
                      <View style={styles.goalMeta}>
                        <Text style={styles.goalTarget}>of {target}</Text>
                        {pct !== null && (
                          <Text style={styles.goalPercent}>{pct}%</Text>
                        )}
                      </View>
                    </>
                  )}
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
  errorContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  goalName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  goalSaved: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
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
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalTarget: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  goalPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
});
