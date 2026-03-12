import React from 'react';
import PlaceholderScreen from './PlaceholderScreen';
import type { PayeesScreenProps } from '../types';

export default function PayeesScreen({ navigation, route }: PayeesScreenProps) {
  return (
    <PlaceholderScreen
      navigation={navigation as any}
      route={route as any}
      title="Payees"
      iconName="account-multiple-outline"
    />
  );
}
