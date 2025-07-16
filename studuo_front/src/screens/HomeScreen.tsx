import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { theme } from '../theme';
import { mockUsers } from '../data/mockData';
import SwipeableGallery from '../components/SwipeableGallery';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [users, setUsers] = useState(mockUsers);
  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSongChange = (songIndex: number) => {
    setActiveSongIndex(songIndex);
  };

  const handlePlaybackModeChange = (isActive: boolean) => {
    setIsPlaybackActive(isActive);
  };

  const handleCardExpansion = (isExpanded: boolean) => {
    setIsCardExpanded(isExpanded);
  };

  const titleStyle = useAnimatedStyle(() => {
    // Show title when not expanded, hide when expanded
    const targetOpacity = isCardExpanded ? 0 : 1;
    return {
      opacity: withSpring(targetOpacity),
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.Text style={[styles.title, { top: insets.top }, titleStyle]}>
        Studuo
      </Animated.Text>
      <SwipeableGallery
        users={users}
        onSongChange={handleSongChange}
        activeSongIndex={activeSongIndex}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onPlaybackModeChange={handlePlaybackModeChange}
        onCardExpanded={handleCardExpansion}
        isCardExpanded={isCardExpanded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    position: 'absolute',
    left: 16,
    top: 15,
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: 'bold',
    color: 'white',
    zIndex: 20,
  },
  content: {
    flex: 1,
  },
}); 