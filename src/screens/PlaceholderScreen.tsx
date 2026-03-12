/**
 * Generic placeholder screen used for features not yet implemented.
 * Accepts a title, subtitle (account name), and optional icon name.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { Text } from 'react-native';
import { colors, typography, spacing } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import ScreenHeader from '../components/ScreenHeader';

type PlaceholderRoute = 'Settings' | 'SavingsGoals' | 'Payees' | 'SendMoney' | 'ReceiveMoney';

type Props = NativeStackScreenProps<RootStackParamList, PlaceholderRoute> & {
  title: string;
  iconName: string;
};

export default function PlaceholderScreen({ navigation, route, title, iconName }: Props) {
  const { accountName } = route.params;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={title}
        subtitle={accountName}
        onBack={() => navigation.goBack()}
      />

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
