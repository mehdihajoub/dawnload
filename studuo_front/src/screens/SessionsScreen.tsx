import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { mockSessions } from '../data/mockData';
import { Session, Role, User } from '../data/types';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HEADER_HEIGHT = 56;

const SessionCard = ({ item }: { item: Session }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  const filledRoles = new Map<Role, User>(item.applicants.map(applicant => [applicant.role, applicant]));

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
    };
  });

  const toggleExpansion = () => {
    animatedHeight.value = withSpring(isExpanded ? 0 : contentHeight, {
      damping: 15,
      stiffness: 100,
    });
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={item.coverImage}
          style={styles.cardImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.overlayContent}>
            <View style={styles.sessionInfo}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.username}>by {item.creator.username}</Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <Animated.View style={[styles.cardContent, animatedContainerStyle]}>
        <View 
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
          onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
        >
          <View style={{ padding: 16 }}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
            
            <View style={styles.detailsHeaderRow}>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Members</Text>
              {item.isPaid && (
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Paid</Text>
              )}
            </View>

            <View style={styles.detailsContentRow}>
              <View style={styles.expandedRolesContainer}>
                {item.roles.map(role => {
                  const applicant = filledRoles.get(role);
                  return (
                    <View key={role} style={styles.roleItemExpanded}>
                      {applicant ? (
                        <Image source={applicant.profilePicture} style={styles.roleProfileImage} />
                      ) : (
                        <View style={styles.vacantRole}>
                          <Ionicons name="add" size={24} color={theme.colors.text} />
                        </View>
                      )}
                      <Text style={styles.roleName} numberOfLines={1}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                    </View>
                  );
                })}
              </View>

              {item.isPaid && item.price && (
                <Text style={styles.priceText}>{item.price}</Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
        
      {!isExpanded && (
        <View style={styles.bottomContainer}>
          <View style={styles.rolesSection}>
            {item.roles.map(role => {
              const applicant = filledRoles.get(role);
              return (
                <View key={role} style={styles.compactRoleItem}>
                  {applicant ? (
                    <Image source={applicant.profilePicture} style={styles.compactRoleProfileImage} />
                  ) : (
                    <View style={styles.compactVacantRole}/>
                  )}
                </View>
              );
            })}
          </View>

          {item.isPaid && item.price && (
            <View style={styles.compactPriceContainer}>
              <View style={styles.separatorBar} />
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          )}
        </View>
      )}
      
      <TouchableOpacity onPress={toggleExpansion} style={styles.arrowButtonContainer}>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

export default function SessionsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const headerTotalHeight = HEADER_HEIGHT + insets.top;
    const translateY = interpolate(
      scrollY.value,
      [HEADER_HEIGHT * 8, HEADER_HEIGHT * 10],
      [0, -headerTotalHeight],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      height: headerTotalHeight,
      paddingTop: insets.top,
    };
  });
  
  const listContainerStyle = useMemo(() => ({
    ...styles.listContainer,
    paddingTop: styles.listContainer.paddingTop + insets.top
  }), [insets.top]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <Text style={styles.headerTitle}>Sessions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateSession')}>
          <Ionicons name="add-circle-outline" size={32} color={theme.colors.text} />
        </TouchableOpacity>
      </Animated.View>
      <Animated.FlatList
        data={mockSessions}
        renderItem={({ item }) => <SessionCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={listContainerStyle}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16 + HEADER_HEIGHT,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#201c1c',
    borderRadius: 24,
    marginBottom: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  imageContainer: {
    height: 320,
    position: 'relative',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  cardImage: {
    height: '100%',
    width: '100%',
    borderRadius: 16,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 32,
    borderRadius: 16,
  },
  overlayContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  username: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  joinButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  detailsContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -8,
  },
  priceText: {
    color: theme.colors.success,
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
  },
  expandedRolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  roleItemExpanded: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 12,
    width: 60,
  },
  roleName: {
    color: theme.colors.text,
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  rolesSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleItem: {
    marginRight: 8,
  },
  roleProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#201c1c',
  },
  vacantRole: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#201c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRoleItem: {
    marginRight: -12,
  },
  compactRoleProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#201c1c',
  },
  compactVacantRole: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.border,
    borderWidth: 2,
    borderColor: '#201c1c',
  },
  arrowButtonContainer: {
    alignSelf: 'center',
    padding: 0,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  compactPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separatorBar: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  }
}); 