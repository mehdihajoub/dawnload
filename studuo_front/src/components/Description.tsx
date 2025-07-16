import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { theme } from '../theme';
import { User, Song } from '../data/types';

const imageMap: { [key: string]: any } = {
  'jordan_profile.jpg': require('../data/images/audio-covers/jordan_profile.jpg'),
  'alex_profile.jpg': require('../data/images/audio-covers/alex_profile.jpg'),
  'sophia_profile.jpg': require('../data/images/audio-covers/sophia_profile.jpg'),
  'deshawn_profile.jpg': require('../data/images/audio-covers/deshawn_profile.jpg'),
  'marcus_profile.jpg': require('../data/images/audio-covers/marcus_profile.jpg'),
};

const Description = ({ song }: { song: Song }) => {
  const collaborators = song?.collaborators || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Credits</Text>
      <FlatList
        data={collaborators}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item: collab }) => (
          <View style={styles.collaboratorItem}>
            <Image source={imageMap[collab.profilePicture]} style={styles.profilePic} />
            <View>
              <Text style={styles.name}>{collab.name}</Text>
              <Text style={styles.role}>{collab.role}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  role: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

export default Description; 