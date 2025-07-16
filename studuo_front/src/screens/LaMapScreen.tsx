import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TextInput, Image, FlatList, Modal, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList, useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { mockUsers } from '../data/mockData';
import { User } from '../data/types';
import { useNavbar } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const UserListItem = ({ user }: { user: User }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].isViewable) {
      setCurrentSongIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={styles.userCard}>
      <View style={styles.imageContainer}>
        <FlatList
          data={user.songs}
          renderItem={({ item }) => (
            <View style={styles.swipeableImage}>
              <Image 
                source={item.cover} 
                style={styles.songCover}
              />
              <TouchableOpacity style={styles.heartButton}>
                <Ionicons name="heart-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        
        <View style={styles.paginationContainer}>
          {user.songs.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { opacity: index === currentSongIndex ? 1 : 0.3 }
              ]}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.userDetails}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.verified && <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} style={{marginLeft: 5}} />}
          </View>
          <Text style={styles.userRole}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
        </View>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="heart" size={16} color={theme.colors.primary} />
          <Text style={styles.rating}>4.{Math.floor(Math.random() * 9) + 1}</Text>
        </View>
      </View>
    </View>
  );
};

const categories = [
    { name: 'All', icon: 'apps-outline', type: 'ionicon' },
    { name: 'Studos', icon: 'business-outline', type: 'ionicon' },
    { name: 'Rapper', icon: 'mic-outline', type: 'ionicon' },
    { name: 'Singer', icon: 'musical-notes-outline', type: 'ionicon' },
    { name: 'Pianist', icon: 'piano', type: 'material' },
    { name: 'Beatmaker', icon: 'music-box-multiple-outline', type: 'material' },
    { name: 'Engineer', icon: 'settings-outline', type: 'ionicon' },
    { name: 'Violinist', icon: 'violin', type: 'material' },
    { name: 'Director', icon: 'videocam-outline', type: 'ionicon' },
    { name: 'Guitarist', icon: 'guitar-electric', type: 'material' },
    { name: 'Producer', icon: 'color-filter-outline', type: 'ionicon' },
    { name: 'DJ', icon: 'disc-outline', type: 'ionicon' },
];

export default function LaMapScreen() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [visibleUsers, setVisibleUsers] = useState(mockUsers);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [bottomSheetPosition, setBottomSheetPosition] = useState(0);
  const { setNavbarOpacity, setNavbarTranslateY } = useNavbar();

  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'rapper' | 'beatmaker' | 'engineer' | 'all'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState(false);

  const snapPoints = useMemo(() => ['12%', '98%'], []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setVisibleUsers(mockUsers);
    } else {
      const filtered = mockUsers.filter(user => user.role.toLowerCase() === selectedCategory.toLowerCase());
      setVisibleUsers(filtered);
    }
  }, [selectedCategory]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    setBottomSheetPosition(index);
    
    // Control navbar visibility based on bottom sheet position
    if (index === 0) {
      // Bottom sheet is collapsed - hide navbar
      setNavbarOpacity(0);
      setNavbarTranslateY(100);
    } else {
      // Bottom sheet is expanded - show navbar
      setNavbarOpacity(1);
      setNavbarTranslateY(0);
    }
  }, [setNavbarOpacity, setNavbarTranslateY]);

  const handleSheetAnimate = useCallback((fromIndex: number, toIndex: number) => {
    // Progressive animation based on sheet position
    const progress = toIndex; // 0 = collapsed, 1 = expanded
    const opacity = progress;
    const translateY = (1 - progress) * 100;
    
    setNavbarOpacity(opacity);
    setNavbarTranslateY(translateY);
  }, [setNavbarOpacity, setNavbarTranslateY]);

  const onRegionChangeComplete = (region: Region) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    const north = latitude + latitudeDelta / 2;
    const south = latitude - latitudeDelta / 2;
    const east = longitude + longitudeDelta / 2;
    const west = longitude - longitudeDelta / 2;

    const filteredUsers = mockUsers.filter(user => 
      user.latitude >= south && user.latitude <= north &&
      user.longitude >= west && user.longitude <= east
    );
    
    let categoryFiltered = filteredUsers;
    if (selectedCategory !== 'All') {
        categoryFiltered = filteredUsers.filter(user => user.role.toLowerCase() === selectedCategory.toLowerCase());
    }
    setVisibleUsers(categoryFiltered);
  };

  const handleSearch = () => {
    let filtered = mockUsers;

    if (locationFilter) {
      filtered = filtered.filter(user => user.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (verifiedFilter) {
      filtered = filtered.filter(user => user.verified);
    }

    setVisibleUsers(filtered);
    setIsSearchModalVisible(false);
  };

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity 
        style={[styles.categoryButton, selectedCategory === item.name && styles.categoryButtonSelected]}
        onPress={() => setSelectedCategory(item.name)}
    >
        {item.type === 'ionicon' ? 
            <Ionicons name={item.icon as any} size={24} color={selectedCategory === item.name ? theme.colors.text : theme.colors.textSecondary} /> :
            <MaterialCommunityIcons name={item.icon as any} size={24} color={selectedCategory === item.name ? theme.colors.text : theme.colors.textSecondary} />
        }
      <Text style={[styles.categoryButtonText, selectedCategory === item.name && styles.categoryButtonTextSelected]}>{item.name}</Text>
      {selectedCategory === item.name && <View style={styles.selectionBar} />}
    </TouchableOpacity>
  );

  const renderItem = useCallback(({ item }: { item: User }) => (
    <UserListItem user={item} />
  ), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        <Modal
          animationType="slide"
          transparent={false}
          visible={isSearchModalVisible}
          onRequestClose={() => {
            setIsSearchModalVisible(!isSearchModalVisible);
          }}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsSearchModalVisible(false)}>
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Search Filters</Text>
              <TouchableOpacity onPress={handleSearch}>
                <Text style={styles.modalSearchButton}>Search</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Location</Text>
                    <TextInput 
                        style={styles.filterInput}
                        placeholder="e.g., New York, NY"
                        value={locationFilter}
                        onChangeText={setLocationFilter}
                    />
                </View>

                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Artist Role</Text>
                    <View style={styles.roleFilterContainer}>
                        {['all', 'rapper', 'beatmaker', 'engineer'].map(role => (
                            <TouchableOpacity 
                                key={role}
                                style={[styles.roleButton, roleFilter === role && styles.roleButtonSelected]}
                                onPress={() => setRoleFilter(role as any)}
                            >
                                <Text style={[styles.roleButtonText, roleFilter === role && styles.roleButtonTextSelected]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Verified Artist</Text>
                    <Switch
                        trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                        thumbColor={verifiedFilter ? theme.colors.background : theme.colors.textSecondary}
                        onValueChange={setVerifiedFilter}
                        value={verifiedFilter}
                    />
                </View>
            </View>
          </SafeAreaView>
        </Modal>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={onRegionChangeComplete}
        >
          {mockUsers.map(user => (
            <Marker
              key={user.id}
              coordinate={{ latitude: user.latitude, longitude: user.longitude }}
              title={user.name}
            />
          ))}
        </MapView>
        
        <View 
            style={[styles.headerContainer, { paddingTop: insets.top }]}
            onLayout={(event) => {
                setHeaderHeight(event.nativeEvent.layout.height);
            }}
        >
            <TouchableOpacity onPress={() => setIsSearchModalVisible(true)}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={24} color={theme.colors.textSecondary} style={{ marginRight: theme.spacing.sm }}/>
                    <Text style={styles.searchInputText}>Where to?</Text>
                </View>
            </TouchableOpacity>
            <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.name}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryListContainer}
            />
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          onAnimate={handleSheetAnimate}
          handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
          topInset={headerHeight > 0 ? headerHeight - (SCREEN_HEIGHT * 0.05) : headerHeight}
          style={[styles.bottomSheet, { zIndex: 1 }]}
        >
          <BottomSheetFlatList
            data={visibleUsers}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
            ListHeaderComponent={<Text style={styles.bottomSheetTitle}>{visibleUsers.length} Artists Nearby</Text>}
          />
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 8, // Adjusted
    paddingBottom: 8, // Adjusted
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8, // Adjusted
    marginHorizontal: 15,
    height: 42, // Adjusted
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15, // Adjusted
    color: theme.colors.text,
    height: 42, // Adjusted
  },
  searchInputText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  categoryListContainer: {
    paddingTop: 15,
    paddingHorizontal: theme.spacing.lg,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  categoryButtonSelected: {
    // No background change, selection is indicated by the bar
  },
  categoryButtonText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
  },
  categoryButtonTextSelected: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  selectionBar: {
      height: 3,
      backgroundColor: theme.colors.accent,
      marginTop: 6,
      borderRadius: 2,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  bottomSheetTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  userCard: {
    flexDirection: 'column',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  swipeableImage: {
    width: SCREEN_WIDTH - theme.spacing.lg * 4,
    height: 400,
    borderRadius: theme.borderRadius.xl,
    position: 'relative',
  },
  songCover: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.xl,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 2,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userRole: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  bottomSheet: {
    ...theme.shadows.large,
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalCloseButton: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
  },
  modalSearchButton: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  filterGroup: {
    marginBottom: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  filterInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.sizes.md,
  },
  roleFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  roleButtonTextSelected: {
      color: theme.colors.background,
  }
}); 