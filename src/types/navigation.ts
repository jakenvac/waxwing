/**
 * Navigation types for React Navigation
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  AddAccount: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddAccountScreenProps = NativeStackScreenProps<RootStackParamList, 'AddAccount'>;
