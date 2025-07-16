import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { currentUser } from '../data/mockData';
import { User, Song } from '../data/types';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.5; // Profile picture takes 50% of screen
const PANEL_MIN_HEIGHT = height * 0.6; // Panel minimum height
const PANEL_OVERLAP = 80; // How much the panel overlaps the profile picture
const PULL_DOWN_LIMIT = HEADER_HEIGHT; // Limit for pull-down gesture
const IMAGE_EXTRA_HEIGHT = HEADER_HEIGHT * 0.01; // Extra height for pull-down effect

interface GalleryItem extends Song {
  height: number;
}

export default function ProfileScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const carouselImages = [
    currentUser.profilePicture,
    ...(currentUser.songs?.map(s => s.cover) || []),
  ];

  useEffect(() => {
    // Generate random heights for gallery images for a masonry effect
    const items = (currentUser.songs || []).map(song => ({
      ...song,
      height: Math.floor(Math.random() * (280 - 180 + 1)) + 180,
    }));
    setGalleryItems(items);
  }, []);

  useEffect(() => {
    if (carouselImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % carouselImages.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [carouselImages.length]);

  // Parallax and scale animation for profile picture
  const profileImageTranslateY = scrollY.interpolate({
    inputRange: [-PULL_DOWN_LIMIT, 0, HEADER_HEIGHT],
    outputRange: [0, -IMAGE_EXTRA_HEIGHT, -IMAGE_EXTRA_HEIGHT - HEADER_HEIGHT * 0.3],
    extrapolate: 'clamp',
  });

  const profileImageScale = scrollY.interpolate({
    inputRange: [-PULL_DOWN_LIMIT, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  // Panel translation for smooth overlay effect
  const panelTranslateY = scrollY.interpolate({
    inputRange: [-PULL_DOWN_LIMIT, 0, HEADER_HEIGHT],
    outputRange: [PULL_DOWN_LIMIT * 0.25, 0, -HEADER_HEIGHT * 0.2],
    extrapolate: 'clamp',
  });

  // Username opacity fade effect
  const usernameOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 0.3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderGallery = () => {
    const column1 = galleryItems.filter((_, index) => index % 2 === 0);
    const column2 = galleryItems.filter((_, index) => index % 2 !== 0);

    return (
      <View style={styles.galleryContainer}>
        <View style={styles.column}>
          {column1.map(item => (
            <TouchableOpacity key={item.id} style={styles.galleryItem}>
              <Image source={item.cover} style={[styles.galleryImage, { height: item.height }]} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.column}>
          {column2.map(item => (
            <TouchableOpacity key={item.id} style={styles.galleryItem}>
              <Image source={item.cover} style={[styles.galleryImage, { height: item.height }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderProfileContent = () => (
    <View style={styles.profileContent}>
      {/* Bio Section */}
      <View style={styles.aboutContainer}>
        <View style={styles.aboutImageContainer}>
          <FlatList
            ref={flatListRef}
            data={carouselImages}
            renderItem={({ item }) => (
              <Image source={item} style={styles.aboutImage} resizeMode="cover" />
            )}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            onScrollToIndexFailed={() => {}}
          />
        </View>
        <View style={styles.aboutTextContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{currentUser.bio}</Text>
        </View>
      </View>

      {/* Gallery Section */}
      {renderGallery()}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background Profile Picture */}
      <View style={styles.profileImageContainer}>
        <Animated.View
          style={[
            styles.animatedImageWrapper,
            {
              transform: [
                { translateY: profileImageTranslateY },
                { scale: profileImageScale },
              ],
            },
          ]}
        >
          <Image
            source={currentUser.profilePicture}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Dark overlay for text readability */}
        <View style={styles.overlay} />

        {/* Username overlay */}
        <Animated.View
          style={[
            styles.usernameContainer,
            { opacity: usernameOpacity }
          ]}
        >
          <Text style={styles.username}>{currentUser.username}</Text>
          {currentUser.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.detailsContainer, { opacity: usernameOpacity }]}>
          <Text style={styles.detailsText}>{currentUser.role} • {currentUser.location}</Text>
        </Animated.View>
      </View>

      {/* Overlapping Content Panel */}
      <Animated.View
        style={[
          styles.contentPanel,
          {
            transform: [{ translateY: panelTranslateY }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {renderProfileContent()}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
    overflow: 'hidden',
  },
  animatedImageWrapper: {
    width: '100%',
    height: HEADER_HEIGHT + IMAGE_EXTRA_HEIGHT,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  usernameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  username: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  verifiedBadge: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: PANEL_OVERLAP + theme.spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  detailsText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    textTransform: 'capitalize',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contentPanel: {
    position: 'absolute',
    top: HEADER_HEIGHT - PANEL_OVERLAP,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    zIndex: 2,
    minHeight: PANEL_MIN_HEIGHT,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  profileContent: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  aboutContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 48,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    marginHorizontal: -theme.spacing.sm,
    marginTop: -theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutImageContainer: {
    width: 90,
    height: 110,
    borderRadius: 45,
    overflow: 'hidden',
  },
  aboutImage: {
    width: 90,
    height: 110,
  },
  aboutTextContainer: {
    flex: 1,
    paddingLeft: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  bioText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.md,
  },
  galleryContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xs,
  },
  column: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
  },
  galleryItem: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    borderRadius: theme.borderRadius.md,
  },
}); 