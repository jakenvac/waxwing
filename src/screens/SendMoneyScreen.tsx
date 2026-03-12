import React from 'react';
import PlaceholderScreen from './PlaceholderScreen';
import type { SendMoneyScreenProps } from '../types';

export default function SendMoneyScreen({ navigation, route }: SendMoneyScreenProps) {
  return (
    <PlaceholderScreen
      navigation={navigation as any}
      route={route as any}
      title="Send Money"
      iconName="bank-transfer-out"
    />
  );
}
