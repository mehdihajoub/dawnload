import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { User } from '../data/types';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_SIZE = 50;
const SPACING = 16;
const CONTAINER_HEIGHT = 100;

interface SongRollProps {
  user: User;
  onSongChange: (songIndex: number) => void;
  isExpanded: boolean;
  activeSongIndex: number;
  isPlaybackMode: SharedValue<boolean>;
}

export default function SongRoll({
  user,
  onSongChange,
  isExpanded,
  activeSongIndex,
}: SongRollProps) {
  const flatListRef = useRef<FlatList>(null);

  const itemSize = THUMBNAIL_SIZE + SPACING;
  const listPadding = (SCREEN_WIDTH - itemSize) / 2;

  useEffect(() => {
    if (flatListRef.current && user.songs.length > 0) {
      const index = activeSongIndex;
      const offset = index * itemSize;
      
      flatListRef.current.scrollToOffset({
        offset,
        animated: true,
      });
    }
  }, [activeSongIndex, user.songs.length]);

  if (!user) {
    return null;
  }

  const renderItem = ({ item: song, index }: { item: any; index: number }) => {
    const isActive = index === activeSongIndex;
    const scale = isActive ? 1.2 : 1;
    const opacity = isActive ? 1 : 0.6;
    
    return (
      <TouchableOpacity
        onPress={() => onSongChange(index)}
        style={[
          styles.songItem,
          { width: itemSize }
        ]}
      >
        <Image
          source={song.cover}
          style={[
            styles.songCover,
            {
              width: THUMBNAIL_SIZE,
              height: THUMBNAIL_SIZE,
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
        {isExpanded && (
          <Text style={styles.songTitle} numberOfLines={2}>
            {song.title}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isExpanded && (
        <Text style={styles.projectsTitle}>Projects</Text>
      )}
      <FlatList
        ref={flatListRef}
        data={user.songs}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: listPadding,
        }}
        renderItem={renderItem}
        snapToInterval={itemSize}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    justifyContent: 'flex-end',
  },
  projectsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 0,
    marginLeft: theme.spacing.xl,
  },
  listContainer: {
    alignItems: 'center',
  },
  songItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },
  songCover: {
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  songTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    top: 80,
    width: '100%',
  },
  loopIndicator: {
    width: 2,
    height: 50,
    backgroundColor: 'white',
    opacity: 0.3,
    marginRight: 10,
  },
}); 