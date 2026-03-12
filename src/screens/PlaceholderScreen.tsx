/**
 * Generic placeholder screen used for features not yet implemented.
 * Accepts a title, subtitle (account name), and optional icon name.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { colors, typography, spacing } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type PlaceholderRoute = 'SavingsGoals' | 'Payees' | 'SendMoney' | 'ReceiveMoney';

type Props = NativeStackScreenProps<RootStackParamList, PlaceholderRoute> & {
  title: string;
  iconName: string;
};

export default function PlaceholderScreen({ navigation, route, title, iconName }: Props) {
  const { accountName } = route.params;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{accountName}</Text>
        </View>
      </View>

      {/* Placeholder */}
      <View style={styles.placeholder}>
        <Icon name={iconName as any} size={48} color={colors.textDisabled} />
        <Text style={styles.placeholderText}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
});
