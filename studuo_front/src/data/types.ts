export interface Song {
  id: string;
  title: string;
  duration: number;
  plays: number;
  cover: any;
  timestamp: { start: number; end: number };
  collaborators?: User[];
  url?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  surname: string;
  age: number;
  location: string;
  latitude: number;
  longitude: number;
  profilePicture: any;
  bio: string;
  role: 'rapper' | 'beatmaker' | 'engineer' | 'singer' | 'pianist' | 'violinist' | 'director' | 'guitarist' | 'drummer' | 'producer' | 'dj' | 'songwriter';
  audioFile: any;
  songs: Song[];
  verified?: boolean;
  followers?: number;
  impressions?: number;
}

export interface Audio {
  id: string;
  title: string;
  url: string;
  duration: number;
  associatedImage: string;
  genre?: string;
  createdAt: string;
  plays?: number;
}

export interface Match {
  id: string;
  user: User;
  matchedAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  createdAt: string;
}

export type RootStackParamList = {
  Main: undefined;
  Chat: { matchId: string; user: User };
  CreateSession: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Plug: undefined;
  LaMap: undefined;
  Sessions: undefined;
  Profile: undefined;
};

export type Role = 'rapper' | 'beatmaker' | 'engineer' | 'singer' | 'pianist' | 'violinist' | 'director' | 'guitarist' | 'drummer' | 'producer' | 'dj' | 'songwriter' | 'bassist';

export interface Session {
  id: string;
  creator: User;
  title: string;
  description: string;
  coverImage: any;
  location?: string;
  roles: Role[];
  isPaid: boolean;
  price?: string;
  applicants: User[];
  createdAt: string;
} 