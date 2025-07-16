import { User, Session } from './types';
import marcusMeta from './audios/metadata/marcus.json';
import jordanMeta from './audios/metadata/jordan.json';
import alexMeta from './audios/metadata/alex.json';
import sophiaMeta from './audios/metadata/sophia.json';
import deshawnMeta from './audios/metadata/deshawn.json';

const imageMap: { [key: string]: any } = {
  // Profile Pictures
  'marcus_profile.jpg': require('./images/audio-covers/marcus_profile.jpg'),
  'jordan_profile.jpg': require('./images/audio-covers/jordan_profile.jpg'),
  'alex_profile.jpg': require('./images/audio-covers/alex_profile.jpg'),
  'sophia_profile.jpg': require('./images/audio-covers/sophia_profile.jpg'),
  'deshawn_profile.jpg': require('./images/audio-covers/deshawn_profile.jpg'),

  // Audio Covers
  'audio_cover_1.jpg': require('./images/audio-covers/audio_cover_1.jpg'),
  'audio_cover_2.jpg': require('./images/audio-covers/audio_cover_2.jpg'),
  'audio_cover_3.jpg': require('./images/audio-covers/audio_cover_3.jpg'),
  'audio_cover_4.jpg': require('./images/audio-covers/audio_cover_4.jpg'),
  'audio_cover_5.jpg': require('./images/audio-covers/audio_cover_5.jpg'),
  'audio_cover_6.jpg': require('./images/audio-covers/audio_cover_6.jpg'),
  'audio_cover_7.jpg': require('./images/audio-covers/audio_cover_7.jpg'),
  'audio_cover_8.jpg': require('./images/audio-covers/audio_cover_8.jpg'),
  'audio_cover_9.jpg': require('./images/audio-covers/audio_cover_9.jpg'),
  'audio_cover_10.jpg': require('./images/audio-covers/audio_cover_10.jpg'),
  'audio_cover_11.jpg': require('./images/audio-covers/audio_cover_11.jpg'),
  'audio_cover_12.jpg': require('./images/audio-covers/audio_cover_12.jpg'),
  'audio_cover_13.jpg': require('./images/audio-covers/audio_cover_13.jpg'),
  'audio_cover_14.jpg': require('./images/audio-covers/audio_cover_14.jpg'),
  'audio_cover_15.jpg': require('./images/audio-covers/audio_cover_15.jpg'),
  'audio_cover_16.jpg': require('./images/audio-covers/audio_cover_16.jpg'),
  'audio_cover_17.jpg': require('./images/audio-covers/audio_cover_17.jpg'),
  'audio_cover_18.jpg': require('./images/audio-covers/audio_cover_18.jpg'),
  'audio_cover_19.jpg': require('./images/audio-covers/audio_cover_19.jpg'),
  'audio_cover_20.jpg': require('./images/audio-covers/audio_cover_20.jpg'),
  'audio_cover_21.jpg': require('./images/audio-covers/audio_cover_21.jpg'),
  'audio_cover_22.jpg': require('./images/audio-covers/audio_cover_22.jpg'),
  'audio_cover_23.jpg': require('./images/audio-covers/audio_cover_23.jpg'),
  'audio_cover_24.jpg': require('./images/audio-covers/audio_cover_24.jpg'),
  'audio_cover_25.jpg': require('./images/audio-covers/audio_cover_25.jpg'),
};

const processSongs = (songs: any[]) => {
  return songs.map(song => ({
    ...song,
    cover: imageMap[song.cover],
  }));
};

export const mockUsers: User[] = [
  {
    id: 'marcus_johnson',
    username: 'MARCUS',
    name: 'Marcus',
    surname: 'Johnson',
    age: 24,
    location: 'Atlanta, GA',
    latitude: 33.7490,
    longitude: -84.3880,
    profilePicture: imageMap['marcus_profile.jpg'],
    bio: 'Rapper from the A, looking for fire beats and collaborations. 🔥 Been in the game for 5 years, ready to take it to the next level. 🚀',
    role: 'rapper',
    verified: true,
    audioFile: require('./audios/files/marcus.mp3'),
    songs: processSongs(marcusMeta.songs),
  },
  {
    id: 'jordan_williams',
    username: 'JWILLS',
    name: 'Jordan',
    surname: 'Williams',
    age: 28,
    location: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    profilePicture: imageMap['jordan_profile.jpg'],
    bio: 'Producer crafting next-level beats. 🎹 Specializing in trap, drill, and melodic instrumentals. Let\'s create something legendary. 🏆',
    role: 'beatmaker',
    verified: false,
    audioFile: require('./audios/files/jordan.mp3'),
    songs: processSongs(jordanMeta.songs),
  },
  {
    id: 'alex_chen',
    username: 'ALEXCHEN',
    name: 'Alex',
    surname: 'Chen',
    age: 32,
    location: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    profilePicture: imageMap['alex_profile.jpg'],
    bio: 'Sound engineer with 8 years experience. 🎧 Mixed tracks for major labels. Professional studio quality guaranteed. ✅',
    role: 'engineer',
    verified: true,
    audioFile: require('./audios/files/alex.mp3'),
    songs: processSongs(alexMeta.songs),
  },
  {
    id: 'sophia_rodriguez',
    username: 'SOPHIA',
    name: 'Sophia',
    surname: 'Rodriguez',
    age: 26,
    location: 'Miami, FL',
    latitude: 25.7617,
    longitude: -80.1918,
    profilePicture: imageMap['sophia_profile.jpg'],
    bio: 'Versatile artist - rapper, singer, songwriter. 🎤 Bilingual flows in English and Spanish.  bilingual. Ready to collaborate with producers. 🌴',
    role: 'singer',
    verified: true,
    audioFile: require('./audios/files/sophia.mp3'),
    songs: processSongs(sophiaMeta.songs),
  },
  {
    id: 'deshawn_davis',
    username: 'DESHAWN',
    name: 'DeShawn',
    surname: 'Davis',
    age: 22,
    location: 'Chicago, IL',
    latitude: 41.8781,
    longitude: -87.6298,
    profilePicture: imageMap['deshawn_profile.jpg'],
    bio: 'Trap producer from the Chi. 🏙️ Making beats that hit different. Looking for rappers who can ride the wave. 🌊',
    role: 'producer',
    verified: false,
    audioFile: require('./audios/files/deshawn.mp3'),
    songs: processSongs(deshawnMeta.songs),
  },
];

export const currentUser: User = {
  id: 'current_user',
  username: 'nairo',
  name: 'Your Name',
  surname: 'Your Surname',
  age: 25,
  location: 'Geneve, Switzerland',
  latitude: 46.2044, // Default to Geneva
  longitude: 6.1432,
  profilePicture: require('./images/audio-covers/audio_cover_1.jpg'),
  bio: 'Your bio goes here. Describe your music style, experience, and what you\'re looking for in collaborations. ✨',
  role: 'rapper',
  audioFile: require('./audios/files/marcus.mp3'),
  songs: processSongs(marcusMeta.songs),
};

export const mockSessions: Session[] = [
  {
    id: 'session_1',
    creator: mockUsers[1], // Jordan Williams (beatmaker)
    title: 'Vocalist for new track',
    description: 'I\'ve produced a new Lo-Fi beat and I\'m looking for a talented vocalist to collaborate with. The track has a chill, melancholic vibe. If you think your voice would be a good fit, please apply!',
    location: 'Los Angeles, CA',
    roles: ['singer', 'songwriter'],
    isPaid: true,
    price: '$50',
    applicants: [mockUsers[3]], // Sophia Rodriguez
    createdAt: '2024-07-22T10:00:00Z',
    coverImage: imageMap['audio_cover_1.jpg'],
  },
  {
    id: 'session_2',
    creator: mockUsers[0], // Marcus Johnson (rapper)
    title: 'Producer for my EP',
    description: 'I\'m working on a 5-track EP and I need a producer to help me with the beats. My style is similar to Kendrick Lamar and J. Cole. Looking for someone who can create unique and hard-hitting beats.',
    location: 'Atlanta, GA',
    roles: ['producer', 'beatmaker', 'engineer'],
    isPaid: false,
    applicants: [mockUsers[4], mockUsers[1]], // DeShawn Davis and Jordan Williams
    createdAt: '2024-07-21T15:30:00Z',
    coverImage: imageMap['audio_cover_2.jpg'],
  },
  {
    id: 'session_3',
    creator: mockUsers[3], // Sophia Rodriguez (singer)
    title: 'Guitarist for acoustic project',
    description: 'I\'m a singer-songwriter looking for a guitarist to collaborate on an acoustic project. I write my own lyrics and melodies, but I need someone to help me with the arrangements. My influences are artists like Joni Mitchell and Nick Drake.',
    roles: ['guitarist', 'pianist', 'violinist'],
    isPaid: true,
    price: '$100',
    applicants: [mockUsers[1]],
    createdAt: '2024-07-20T12:00:00Z',
    coverImage: imageMap['audio_cover_3.jpg'],
  },
  {
    id: 'session_4',
    creator: mockUsers[2], // Alex Chen (engineer)
    title: 'Drummer for rock band',
    description: 'We are a rock band with a guitarist, bassist, and vocalist. We need a drummer to complete our lineup. We have a few demos recorded and we are planning to play some gigs soon. Our style is alternative rock.',
    location: 'New York, NY',
    roles: ['drummer', 'guitarist', 'bassist'],
    isPaid: false,
    applicants: [mockUsers[0], mockUsers[4]], // Marcus Johnson (just for fun)
    createdAt: '2024-07-19T18:00:00Z',
    coverImage: imageMap['audio_cover_4.jpg'],
  },
]; 