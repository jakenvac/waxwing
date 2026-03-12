/**
 * Navigation types for React Navigation
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AccountRouteParams = {
  accountUid: string;
  accountName: string;
  token: string;
};

export type RootStackParamList = {
  Home: undefined;
  AddAccount: undefined;
  Settings: AccountRouteParams;
  AccountDetail: AccountRouteParams & {
    accountType: string;
    defaultCategory: string;
  };
  SavingsGoals: AccountRouteParams;
  Payees: AccountRouteParams;
  SendMoney: AccountRouteParams;
  ReceiveMoney: AccountRouteParams;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddAccountScreenProps = NativeStackScreenProps<RootStackParamList, 'AddAccount'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type AccountDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'AccountDetail'>;
export type SavingsGoalsScreenProps = NativeStackScreenProps<RootStackParamList, 'SavingsGoals'>;
export type PayeesScreenProps = NativeStackScreenProps<RootStackParamList, 'Payees'>;
export type SendMoneyScreenProps = NativeStackScreenProps<RootStackParamList, 'SendMoney'>;
export type ReceiveMoneyScreenProps = NativeStackScreenProps<RootStackParamList, 'ReceiveMoney'>;
