import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
  interpolate,
  Extrapolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';

import { User } from '../data/types';
import UserCard from './UserCard';
import SongRoll from './SongRoll';
import Description from './Description';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.4;
const TAB_BAR_HEIGHT = 80;
const SONG_ROLL_AREA_HEIGHT = 120; // was 150

interface SwipeableGalleryProps {
  users: User[];
  onSongChange: (songIndex: number) => void;
  activeSongIndex: number;
  topInset: number;
  bottomInset: number;
  onPlaybackModeChange: (isPlaybackMode: boolean) => void;
  onCardExpanded: (isExpanded: boolean) => void;
  isCardExpanded: boolean;
}

export default function SwipeableGallery({
  users,
  onSongChange,
  activeSongIndex,
  topInset,
  bottomInset,
  onPlaybackModeChange,
  onCardExpanded,
  isCardExpanded,
}: SwipeableGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isPlaybackMode = useSharedValue(false);
  const playbackTranslateY = useSharedValue(0);
  const pullUpTranslateY = useSharedValue(0);
  const isCardExpandedSV = useSharedValue(false);
  const cardPlaybackAdjustment = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return {
        playback: isPlaybackMode.value,
        expanded: isCardExpandedSV.value,
      };
    },
    (current, previous) => {
      if (current.playback !== previous?.playback) {
        runOnJS(onPlaybackModeChange)(current.playback);
      }

      // Remove playback-based positioning - keep card in pause position
      // Only respond to expansion changes, not playback changes
      playbackTranslateY.value = withSpring(0, {
        damping: 18,
        stiffness: 80,
      });
    },
    [topInset, bottomInset]
  );

  useAnimatedReaction(
    () => isCardExpandedSV.value,
    (expanded, previous) => {
      if (expanded !== previous) {
        runOnJS(onCardExpanded)(expanded);
      }
    },
    [onCardExpanded]
  );

  const playbackAdjustment = useDerivedValue(() => {
    // Remove playback adjustment - keep card position constant
    return withSpring(0, {
      damping: 18,
      stiffness: 80,
    });
  });

  useAnimatedReaction(
    () => playbackAdjustment.value,
    (adjustment) => {
      // Only apply adjustment when card is NOT expanded (pulled down)
      if (!isCardExpandedSV.value) {
        cardPlaybackAdjustment.value = adjustment;
      } else {
        cardPlaybackAdjustment.value = 0;
      }
    },
    [playbackAdjustment]
  );

  async function playSound() {
    const user = users[currentIndex];
    const song = user.songs[activeSongIndex];
    console.log(`Loading song: ${song.title}`);

    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(user.audioFile, {
      shouldPlay: true,
      positionMillis: song.timestamp.start * 1000,
    });
    setSound(newSound);
    setIsPlaying(true);
  }

  async function stopSound() {
    if (sound) {
      console.log('Stopping sound');
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  }

  const handleCardTap = () => {
    isPlaybackMode.value = !isPlaybackMode.value;
    if (!isPlaybackMode.value) {
      playSound();
    } else {
      stopSound();
    }
  };

  const handleSongRollTap = () => {
    if (isPlaybackMode.value) {
      isPlaybackMode.value = false;
      stopSound();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const mostVisibleItem = viewableItems.reduce((prev: any, current: any) => {
        if (!prev) return current;
        return current.percentVisible > prev.percentVisible ? current : prev;
      });

      const newIndex = mostVisibleItem.index;
      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < users.length
      ) {
        console.log(`Switching from index ${currentIndex} to ${newIndex}`);
        setCurrentIndex(newIndex);
        onSongChange(0);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 30,
    waitForInteraction: false,
  }).current;

  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);

    if (index !== currentIndex && index >= 0 && index < users.length) {
      console.log(`Fallback: Switching from index ${currentIndex} to ${index}`);
      setCurrentIndex(index);
      onSongChange(0);
    }
  };

  useEffect(() => {
    stopSound();
  }, [currentIndex]);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playbackOpacity = useDerivedValue(() => {
    const targetOpacity = isCardExpandedSV.value ? 1 : isPlaybackMode.value ? 0.7 : 1;
    return withSpring(targetOpacity, {
      damping: 18,
      stiffness: 80,
    });
  });

  const playbackScale = useDerivedValue(() => {
    // Keep scale constant - don't change based on playback mode
    const targetScale = isCardExpandedSV.value ? 1 : 1;
    return withSpring(targetScale, {
      damping: 18,
      stiffness: 80,
    });
  });

  const songRollSpacingAdjustment = useDerivedValue(() => {
    // Bring song roll much closer to user card to make it more visible
    return withSpring(-60, {
      damping: 18,
      stiffness: 80,
    });
  });

  const containerSizeAdjustment = useDerivedValue(() => {
    // Remove container size adjustment for playback mode
    return withSpring(0, {
      damping: 18,
      stiffness: 80,
    });
  });

  const descriptionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      pullUpTranslateY.value,
      [-EXPANDED_HEIGHT * 0.6, -EXPANDED_HEIGHT * 0.3], // Fade out in the first half of the swipe
      [1, 0],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      pullUpTranslateY.value,
      [-EXPANDED_HEIGHT * 0.6, 0],
      [0, 20], // Slide down slightly as it fades
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const combinedSongRollStyle = useAnimatedStyle(() => {
    const pullUpScale = interpolate(
      pullUpTranslateY.value,
      [-EXPANDED_HEIGHT * 0.6, 0],
      [1.1, 1],
      Extrapolate.CLAMP
    );

    const downwardOffset = interpolate(
      pullUpTranslateY.value,
      [-EXPANDED_HEIGHT * 0.6, 0],
      [30, 0],
      Extrapolate.CLAMP
    );

    const translateY = pullUpTranslateY.value + downwardOffset + playbackAdjustment.value + songRollSpacingAdjustment.value + containerSizeAdjustment.value;

    return {
      opacity: playbackOpacity.value,
      transform: [{ translateY }, { scale: playbackScale.value * pullUpScale }],
    };
  });

  const renderCard = ({ item: user, index }: { item: User; index: number }) => {
    const isActive = index === currentIndex;

    return (
      <View style={styles.cardContainer}>
        <UserCard
          user={user}
          isActive={isActive}
          onTap={isActive ? handleCardTap : undefined}
          isPlaybackMode={isPlaybackMode}
          topInset={topInset}
          activeSongIndex={activeSongIndex}
          playbackTranslateY={playbackTranslateY}
          pullUpTranslateY={pullUpTranslateY}
          isCardExpanded={isCardExpandedSV}
          cardPlaybackAdjustment={cardPlaybackAdjustment}
        />
      </View>
    );
  };

  if (!users || users.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.galleryContainer}>
        <FlatList
          ref={flatListRef}
          data={users}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onMomentumScrollEnd={handleScrollEnd}
          initialScrollIndex={0}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          removeClippedSubviews={false}
          scrollEventThrottle={16}
          style={{ overflow: 'visible' }}
        />
      </View>

      <Animated.View style={[styles.descriptionWrapper, descriptionStyle]}>
        <Description song={users[currentIndex].songs[activeSongIndex]} />
      </Animated.View>

      <Animated.View style={[styles.songRollWrapper, combinedSongRollStyle]}>
        <SongRoll
          user={users[currentIndex]}
          onSongChange={onSongChange}
          isExpanded={isCardExpanded}
          activeSongIndex={activeSongIndex}
          isPlaybackMode={isPlaybackMode}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  galleryContainer: {
    flex: 1,
    overflow: 'visible',
    zIndex: 10,
    paddingBottom: SONG_ROLL_AREA_HEIGHT,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionWrapper: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  songRollWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SONG_ROLL_AREA_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    zIndex: 20,
  },
}); 