import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  Image, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { mockUsers } from '../data/mockData';
import { User, Match, Message } from '../data/types';

// Mock data for recent matches
const mockRecentMatches: User[] = [
  {
    ...mockUsers[0], // Marcus
    name: 'Adam',
    profilePicture: require('../data/images/audio-covers/audio_cover_1.jpg'),
  },
  {
    ...mockUsers[1], // Jordan
    name: 'Kristin',
    profilePicture: require('../data/images/audio-covers/audio_cover_2.jpg'),
  },
  {
    ...mockUsers[2], // Alex
    name: 'Bessie',
    profilePicture: require('../data/images/audio-covers/audio_cover_3.jpg'),
  },
  {
    ...mockUsers[3], // Sophia
    name: 'Courtney',
    profilePicture: require('../data/images/audio-covers/audio_cover_4.jpg'),
  },
];

// Mock data for chats - expanded with more conversations
const mockChats: (Match & { lastMessage: Message; unreadCount?: number })[] = [
  {
    id: 'chat_1',
    user: {
      ...mockUsers[0],
      name: 'Charlie',
      profilePicture: require('../data/images/audio-covers/audio_cover_5.jpg'),
    },
    matchedAt: '2024-01-15T10:00:00Z',
    lastMessage: {
      id: 'msg_1',
      text: 'What about that new jacke...',
      senderId: 'charlie_id',
      timestamp: '09:18',
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: 'chat_2',
    user: {
      ...mockUsers[1],
      name: 'Eleanor',
      profilePicture: require('../data/images/audio-covers/audio_cover_6.jpg'),
    },
    matchedAt: '2024-01-15T08:00:00Z',
    lastMessage: {
      id: 'msg_2',
      text: 'Damn, you\'re a knockout. W...',
      senderId: 'eleanor_id',
      timestamp: '12:44',
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: 'chat_3',
    user: {
      ...mockUsers[2],
      name: 'Jack',
      profilePicture: require('../data/images/audio-covers/audio_cover_7.jpg'),
    },
    matchedAt: '2024-01-15T06:00:00Z',
    lastMessage: {
      id: 'msg_3',
      text: 'I\'m new in town. Could you...',
      senderId: 'jack_id',
      timestamp: '08:06',
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: 'chat_4',
    user: {
      ...mockUsers[3],
      name: 'Annette',
      profilePicture: require('../data/images/audio-covers/audio_cover_8.jpg'),
    },
    matchedAt: '2024-01-15T04:00:00Z',
    lastMessage: {
      id: 'msg_4',
      text: 'Hey, can you check my image...',
      senderId: 'annette_id',
      timestamp: '09:32',
      isRead: true,
    },
  },
  {
    id: 'chat_5',
    user: {
      ...mockUsers[4],
      name: 'Grace',
      profilePicture: require('../data/images/audio-covers/audio_cover_9.jpg'),
    },
    matchedAt: '2024-01-15T02:00:00Z',
    lastMessage: {
      id: 'msg_5',
      text: '',
      senderId: 'grace_id',
      timestamp: '08:15',
      isRead: true,
    },
  },
  {
    id: 'chat_6',
    user: {
      ...mockUsers[0],
      name: 'Tyler',
      profilePicture: require('../data/images/audio-covers/audio_cover_10.jpg'),
    },
    matchedAt: '2024-01-14T22:00:00Z',
    lastMessage: {
      id: 'msg_6',
      text: 'That beat is fire bro! 🔥',
      senderId: 'tyler_id',
      timestamp: '22:30',
      isRead: true,
    },
  },
  {
    id: 'chat_7',
    user: {
      ...mockUsers[1],
      name: 'Maya',
      profilePicture: require('../data/images/audio-covers/audio_cover_11.jpg'),
    },
    matchedAt: '2024-01-14T20:00:00Z',
    lastMessage: {
      id: 'msg_7',
      text: 'When can we link up to record?',
      senderId: 'maya_id',
      timestamp: '20:15',
      isRead: true,
    },
  },
  {
    id: 'chat_8',
    user: {
      ...mockUsers[2],
      name: 'Brandon',
      profilePicture: require('../data/images/audio-covers/audio_cover_12.jpg'),
    },
    matchedAt: '2024-01-14T18:00:00Z',
    lastMessage: {
      id: 'msg_8',
      text: 'Your mix sounds professional',
      senderId: 'brandon_id',
      timestamp: '18:45',
      isRead: true,
    },
  },
  {
    id: 'chat_9',
    user: {
      ...mockUsers[3],
      name: 'Zoe',
      profilePicture: require('../data/images/audio-covers/audio_cover_13.jpg'),
    },
    matchedAt: '2024-01-14T16:00:00Z',
    lastMessage: {
      id: 'msg_9',
      text: 'Love your style! Let\'s collab',
      senderId: 'zoe_id',
      timestamp: '16:20',
      isRead: true,
    },
  },
  {
    id: 'chat_10',
    user: {
      ...mockUsers[4],
      name: 'Kevin',
      profilePicture: require('../data/images/audio-covers/audio_cover_14.jpg'),
    },
    matchedAt: '2024-01-14T14:00:00Z',
    lastMessage: {
      id: 'msg_10',
      text: 'Studio session tomorrow?',
      senderId: 'kevin_id',
      timestamp: '14:10',
      isRead: true,
    },
  },
  {
    id: 'chat_11',
    user: {
      ...mockUsers[0],
      name: 'Aria',
      profilePicture: require('../data/images/audio-covers/audio_cover_15.jpg'),
    },
    matchedAt: '2024-01-14T12:00:00Z',
    lastMessage: {
      id: 'msg_11',
      text: 'That vocal take was perfect',
      senderId: 'aria_id',
      timestamp: '12:30',
      isRead: true,
    },
  },
  {
    id: 'chat_12',
    user: {
      ...mockUsers[1],
      name: 'Marcus',
      profilePicture: require('../data/images/audio-covers/audio_cover_16.jpg'),
    },
    matchedAt: '2024-01-14T10:00:00Z',
    lastMessage: {
      id: 'msg_12',
      text: 'Need beats for my next project',
      senderId: 'marcus_id',
      timestamp: '10:55',
      isRead: true,
    },
  },
];

const RecentMatchItem: React.FC<{ user: User }> = ({ user }) => (
  <TouchableOpacity style={styles.matchItem}>
    <Image source={user.profilePicture} style={styles.matchAvatar} />
    <Text style={styles.matchName}>{user.name}</Text>
  </TouchableOpacity>
);

const ChatItem: React.FC<{ chat: Match & { lastMessage: Message; unreadCount?: number } }> = ({ chat }) => (
  <TouchableOpacity style={styles.chatItem}>
    <View style={styles.chatLeft}>
      <Image source={chat.user.profilePicture} style={styles.chatAvatar} />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{chat.user.name}</Text>
        {chat.lastMessage.text && (
          <Text style={styles.chatMessage}>{chat.lastMessage.text}</Text>
        )}
      </View>
    </View>
    <View style={styles.chatRight}>
      <Text style={styles.chatTime}>{chat.lastMessage.timestamp}</Text>
      {chat.unreadCount && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function PlugScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
      </SafeAreaView>

      {/* Recent Matches */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Matches</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.matchesScrollView}
          contentContainerStyle={styles.matchesContainer}
        >
          {mockRecentMatches.map((user, index) => (
            <RecentMatchItem key={index} user={user} />
          ))}
        </ScrollView>
      </View>

      {/* Chat List */}
      <View style={styles.chatListContainer}>
        <FlatList
          data={mockChats}
          renderItem={({ item }) => <ChatItem chat={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.chatList}
          contentContainerStyle={styles.chatListContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  recentSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  matchesScrollView: {
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  matchesContainer: {
    paddingRight: theme.spacing.lg,
  },
  matchItem: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    minWidth: 60,
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: theme.spacing.xs,
  },
  matchName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    textAlign: 'center',
  },
  chatListContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 0, // Remove bottom padding to stick to footer
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  chatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  chatMessage: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  chatRight: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  unreadCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
}); 