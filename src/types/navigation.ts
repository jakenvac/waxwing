/**
 * Navigation types for React Navigation
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  AddAccount: undefined;
  AccountDetail: {
    accountUid: string;
    accountName: string;
    accountType: string;
    defaultCategory: string;
    token: string;
  };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddAccountScreenProps = NativeStackScreenProps<RootStackParamList, 'AddAccount'>;
export type AccountDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'AccountDetail'>;
