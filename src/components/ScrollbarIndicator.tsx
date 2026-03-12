import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  offset: Animated.Value;
  height: Animated.Value;
}

/**
 * Custom scroll indicator thumb. Always use alongside the useScrollbar hook.
 * Must be positioned inside a View with position: 'relative'.
 */
export default function ScrollbarIndicator({ visible, offset, height }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.thumb,
          {
            height,
            transform: [{ translateY: offset }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'transparent',
  },
  thumb: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.6,
  },
});
