import { useState, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Encapsulates the custom animated scrollbar logic.
 * Wire the returned handlers to a ScrollView, and pass the Animated values
 * and showScrollbar flag to <ScrollbarIndicator>.
 */
export function useScrollbar() {
  const [showScrollbar, setShowScrollbar] = useState(false);

  const scrollIndicatorOffset = useRef(new Animated.Value(0)).current;
  const scrollIndicatorHeight = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  const scrollHeight = useRef(0);

  const updateScrollbar = () => {
    const contentHeightVal = contentHeight.current;
    const scrollHeightVal = scrollHeight.current;

    if (contentHeightVal > scrollHeightVal) {
      const indicatorHeight = Math.max(
        (scrollHeightVal / contentHeightVal) * scrollHeightVal,
        30
      );
      scrollIndicatorHeight.setValue(indicatorHeight);
      scrollIndicatorOffset.setValue(0);
      setShowScrollbar(true);
    } else {
      setShowScrollbar(false);
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollHeightVal = layoutMeasurement.height;
    const contentHeightVal = contentSize.height;
    const scrollOffset = contentOffset.y;

    scrollHeight.current = scrollHeightVal;
    contentHeight.current = contentHeightVal;

    if (contentHeightVal > scrollHeightVal) {
      const indicatorHeight = Math.max(
        (scrollHeightVal / contentHeightVal) * scrollHeightVal,
        30
      );
      const maxScrollOffset = contentHeightVal - scrollHeightVal;
      const indicatorOffset =
        (scrollOffset / maxScrollOffset) * (scrollHeightVal - indicatorHeight);

      scrollIndicatorHeight.setValue(indicatorHeight);
      scrollIndicatorOffset.setValue(indicatorOffset);

      if (!showScrollbar) setShowScrollbar(true);
    } else {
      if (showScrollbar) setShowScrollbar(false);
    }
  };

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    scrollHeight.current = height;
    if (contentHeight.current > 0) updateScrollbar();
  };

  const handleContentSizeChange = (_width: number, height: number) => {
    contentHeight.current = height;
    if (scrollHeight.current > 0) updateScrollbar();
  };

  return {
    showScrollbar,
    scrollIndicatorOffset,
    scrollIndicatorHeight,
    handleScroll,
    handleLayout,
    handleContentSizeChange,
  };
}
