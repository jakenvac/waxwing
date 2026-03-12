import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, type AppStateStatus, ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import AddAccountScreen from './src/screens/AddAccountScreen';
import AccountDetailScreen from './src/screens/AccountDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SavingsGoalsScreen from './src/screens/SavingsGoalsScreen';
import SavingsGoalDetailScreen from './src/screens/SavingsGoalDetailScreen';
import PayeesScreen from './src/screens/PayeesScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import ReceiveMoneyScreen from './src/screens/ReceiveMoneyScreen';
import { SessionProvider, useSession } from './src/context/SessionContext';
import { colors, typography, spacing } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ---------------------------------------------------------------------------
// Inner app — consumes SessionContext so it can read session state
// ---------------------------------------------------------------------------

function AppInner(): React.JSX.Element {
  const { sessionState, accounts, loadSession, clearSession } = useSession();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Authenticate once on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Clear session when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prev = appState.current;
      appState.current = nextState;

      if (prev === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        console.log('[App] Backgrounded — clearing session');
        clearSession();
      }
    });
    return () => subscription.remove();
  }, [clearSession]);

  // Loading / authenticating
  if (sessionState === 'idle' || sessionState === 'loading') {
    return (
      <View style={styles.lockContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.lockText}>Authenticating…</Text>
      </View>
    );
  }

  // Auth failed — let user retry
  if (sessionState === 'failed') {
    return (
      <View style={styles.lockContainer}>
        <Text style={styles.lockTitle}>Authentication required</Text>
        <Text style={styles.lockSubtext}>
          Waxwing needs your device PIN or biometrics to unlock your accounts.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSession} activeOpacity={0.7}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Authenticated — show navigator
  const hasAccounts = accounts.length > 0;

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
          <Stack.Screen name="SavingsGoalDetail" component={SavingsGoalDetailScreen} />
          <Stack.Screen name="Payees" component={PayeesScreen} />
          <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
          <Stack.Screen name="ReceiveMoney" component={ReceiveMoneyScreen} />
          <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Root — wraps everything in SessionProvider
// ---------------------------------------------------------------------------

export default function App(): React.JSX.Element {
  return (
    <SessionProvider>
      <AppInner />
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  lockText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  lockTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  lockSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
});
