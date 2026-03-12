import React from 'react';
import PlaceholderScreen from './PlaceholderScreen';
import type { SavingsGoalsScreenProps } from '../types';

export default function SavingsGoalsScreen({ navigation, route }: SavingsGoalsScreenProps) {
  return (
    <PlaceholderScreen
      navigation={navigation as any}
      route={route as any}
      title="Savings Goals"
      iconName="piggy-bank-outline"
    />
  );
}
