import React from 'react';
import PlaceholderScreen from './PlaceholderScreen';
import type { ReceiveMoneyScreenProps } from '../types';

export default function ReceiveMoneyScreen({ navigation, route }: ReceiveMoneyScreenProps) {
  return (
    <PlaceholderScreen
      navigation={navigation as any}
      route={route as any}
      title="Receive Money"
      iconName="bank-transfer-in"
    />
  );
}
