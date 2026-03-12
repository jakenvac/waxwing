import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { SettingsScreenProps } from '../types';
import { colors, typography, spacing, borderRadius, touchTarget } from '../theme';
import { removeAccount } from '../services/storage';
import ScreenHeader from '../components/ScreenHeader';
import commonStyles from '../styles/commonStyles';

export default function SettingsScreen({ navigation, route }: SettingsScreenProps) {
  const { accountUid, accountName } = route.params;
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Remove account',
      `Remove "${accountName}" from Waxwing? Your Starling account will not be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            await removeAccount(accountUid);
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <ScreenHeader
        title="Settings"
        subtitle={accountName}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={deleting}
          activeOpacity={0.7}
        >
          {deleting ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={styles.deleteButtonText}>Remove account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: touchTarget.minHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
});
