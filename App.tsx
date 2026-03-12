import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import AddAccountScreen from './src/screens/AddAccountScreen';
import AccountDetailScreen from './src/screens/AccountDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SavingsGoalsScreen from './src/screens/SavingsGoalsScreen';
import PayeesScreen from './src/screens/PayeesScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import ReceiveMoneyScreen from './src/screens/ReceiveMoneyScreen';
import { getAccounts } from './src/services/storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccounts, setHasAccounts] = useState(false);

  // Check if user has any accounts on app launch
  useEffect(() => {
    checkAccounts();
  }, []);

  const checkAccounts = async () => {
    try {
      const accounts = await getAccounts();
      setHasAccounts(accounts.length > 0);
    } catch (error) {
      setHasAccounts(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking accounts
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={hasAccounts ? 'Home' : 'AddAccount'}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddAccount" component={AddAccountScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SavingsGoals" component={SavingsGoalsScreen} />
          <Stack.Screen name="Payees" component={PayeesScreen} />
          <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
          <Stack.Screen name="ReceiveMoney" component={ReceiveMoneyScreen} />
          <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
