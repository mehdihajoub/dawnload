import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  useAnimatedReaction,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { theme } from '../theme';
import { User } from '../data/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.4;
const TAB_BAR_HEIGHT = 80; // Approximate height of the bottom tab bar

interface UserCardProps {
  user: User;
  isActive: boolean;
  onTap?: () => void;
  isPlaybackMode?: SharedValue<boolean>;
  topInset?: number;
  activeSongIndex?: number;
  playbackTranslateY?: SharedValue<number>;
  pullUpTranslateY: SharedValue<number>;
  isCardExpanded: SharedValue<boolean>;
  cardPlaybackAdjustment?: Readonly<SharedValue<number>>;
}

export default function UserCard({ 
  user, 
  isActive, 
  onTap, 
  isPlaybackMode, 
  topInset = 0,
  activeSongIndex = 0,
  playbackTranslateY = useSharedValue(0),
  pullUpTranslateY,
  isCardExpanded,
  cardPlaybackAdjustment = useSharedValue(0),
}: UserCardProps) {

  // Defensively get the active song, falling back to the first song if the index is invalid
  const activeSong = user.songs[activeSongIndex] || user.songs[0];
  if (!activeSong) {
    // If there are no songs at all, render nothing to prevent a crash
    return null;
  }

  const panGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startY: number }
  >({
    onStart: (_, context) => {
      context.startY = pullUpTranslateY.value;
    },
    onActive: (event, context) => {
      const newTranslateY = context.startY + event.translationY;
      
      if (Math.abs(event.translationY) > Math.abs(event.translationX) && newTranslateY <= 0) {
        pullUpTranslateY.value = newTranslateY;
      }
    },
    onEnd: (event) => {
      if (Math.abs(event.translationY) > Math.abs(event.translationX)) {
        const shouldExpand = event.translationY < -100 || event.velocityY < -500;
        const springConfig = { damping: 25, stiffness: 90 };
        
        if (shouldExpand && !isCardExpanded.value) {
          pullUpTranslateY.value = withSpring(-EXPANDED_HEIGHT * 0.6, springConfig);
          isCardExpanded.value = true;
        } else if (!shouldExpand && isCardExpanded.value) {
          pullUpTranslateY.value = withSpring(0, springConfig);
          isCardExpanded.value = false;
        } else if (isCardExpanded.value) {
          pullUpTranslateY.value = withSpring(-EXPANDED_HEIGHT * 0.6, springConfig);
        } else {
          pullUpTranslateY.value = withSpring(0, springConfig);
        }
      }
    },
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY:
            pullUpTranslateY.value +
            playbackTranslateY.value +
            cardPlaybackAdjustment.value,
        },
      ],
    };
  });

  const infoPanelStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isPlaybackMode ? (isPlaybackMode.value ? 0 : 1) : 1, {
        damping: 18,
        stiffness: 80,
      }),
    };
  });

  const profilePicStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isPlaybackMode ? (isPlaybackMode.value ? 0.7 : 1) : 1, {
        damping: 18,
        stiffness: 80,
      }),
    };
  });

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'rapper':
        return 'mic';
      case 'beatmaker':
        return 'musical-notes';
      case 'engineer':
        return 'settings';
      default:
        return 'person';
    }
  };

  const getRoleColor = (role: User['role']) => {
    return '#004787'; // Same blue color for all roles
  };

  return (
    <TapGestureHandler onActivated={onTap}>
      <Animated.View style={styles.container}>
        <View style={styles.detailsContainer}>
        </View>

        <PanGestureHandler 
          onGestureEvent={panGestureHandler}
          activeOffsetY={[-10, 10]}
          failOffsetX={[-20, 20]}
        >
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            <Image source={activeSong.cover} style={styles.backgroundImage} />
            
            <Animated.Image source={user.profilePicture} style={[styles.circularProfile, profilePicStyle]} />

            <Animated.View style={[styles.infoContainer, infoPanelStyle]}>
              <BlurView intensity={20} tint="dark" style={styles.glassContainer}>
                <View style={styles.nameInfo}>
                  <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                    {user.username} - {activeSong.title}
                  </Text>
                  <View style={styles.ageLocation}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                      <Ionicons 
                        name={getRoleIcon(user.role)} 
                        size={14} 
                        color="white"
                      />
                      <Text style={styles.roleText}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.location}>{user.location}</Text>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: CARD_HEIGHT,
  },
  detailsContainer: {
    position: 'absolute',
    top: CARD_HEIGHT * 0.668, // Start from 55% of the card height
    bottom: 0,
    left: SCREEN_WIDTH * 0.025,
    right: SCREEN_WIDTH * 0.025,
    backgroundColor: 'transparent', // Dark background for the details
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  detailsText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  card: {
    width: SCREEN_WIDTH * 0.95,
    height: CARD_HEIGHT,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    marginHorizontal: SCREEN_WIDTH * 0.025,
    ...theme.shadows.large,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
  },
  glassContainer: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    padding: theme.spacing.md,
    paddingLeft: theme.spacing.md * 2 + 50, // Space for the profile picture + margin
  },
  nameSection: {
    // No specific styles needed here now
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularProfile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: theme.colors.text,
    position: 'absolute',
    bottom: theme.spacing.md * 2.5,
    left: theme.spacing.md * 2,
    zIndex: 1,
  },
  nameInfo: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  ageLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  age: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  location: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    transform: [{ translateY: -3 }], // Nudge up to align with badge text
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  roleText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: theme.spacing.xs,
  },
}); 