import React from 'react';
import type { SettingsScreenProps } from '../types';
import PlaceholderScreen from './PlaceholderScreen';

export default function SettingsScreen({ navigation, route }: SettingsScreenProps) {
  return (
    <PlaceholderScreen
      navigation={navigation}
      route={route}
      title="Settings"
      iconName="cog-outline"
    />
  );
}
