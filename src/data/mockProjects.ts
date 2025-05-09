import { Project, User, MusicalKey } from '../types';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'beatmaster',
    email: 'beatmaster@example.com',
    avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Producer with 10+ years of experience. Specializing in electronic music and hip-hop beats.',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: '2',
    username: 'synthwave_producer',
    email: 'synthwave@example.com',
    avatarUrl: 'https://images.pexels.com/photos/1059117/pexels-photo-1059117.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Creating nostalgic 80s-inspired synthwave and retrowave music.',
    createdAt: '2023-02-20T00:00:00Z',
  },
  {
    id: '3',
    username: 'lofi_creator',
    email: 'lofi@example.com',
    avatarUrl: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Chill beats and lofi hip-hop production. Coffee enthusiast.',
    createdAt: '2023-03-10T00:00:00Z',
  },
];

// Mock projects
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Summer Vibes House Track',
    description: 'A groovy house track with summer vibes. Perfect for remixing or learning house production techniques. Includes vocal samples and synth presets.',
    dawType: 'Ableton Live',
    genre: 'House',
    bpm: 128,
    key: 'Am' as MusicalKey,
    price: 0,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_8a5f5f76c7.mp3?filename=deep-house-122bpm-deep-end-12598.mp3',
    imageUrl: 'https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: '1',
    author: mockUsers[0],
    downloadCount: 245,
    createdAt: '2023-05-15T00:00:00Z',
    updatedAt: '2023-05-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Retrowave Synth Project',
    description: 'Full 80s inspired synthwave project. Includes all the synth patches and drum samples used. Great for learning retro production techniques.',
    dawType: 'Logic Pro',
    genre: 'Electronic',
    bpm: 120,
    key: 'Fm' as MusicalKey,
    price: 19.99,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=lifelike-126534.mp3',
    imageUrl: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: '2',
    author: mockUsers[1],
    downloadCount: 127,
    createdAt: '2023-04-20T00:00:00Z',
    updatedAt: '2023-04-22T00:00:00Z',
  },
  {
    id: '3',
    title: 'Lofi Hip-Hop Beat Template',
    description: 'Chill lofi hip-hop beat perfect for studying or relaxing. Includes sample processing techniques and vinyl simulation effects.',
    dawType: 'FL Studio',
    genre: 'Hip-Hop',
    bpm: 85,
    key: 'Dm' as MusicalKey,
    price: 9.99,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1b8dd3ce72.mp3?filename=lofi-study-112191.mp3',
    imageUrl: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: '3',
    author: mockUsers[2],
    downloadCount: 318,
    createdAt: '2023-06-05T00:00:00Z',
    updatedAt: '2023-06-06T00:00:00Z',
  },
  {
    id: '4',
    title: 'EDM Festival Banger',
    description: 'High-energy EDM track designed for festival mainstages. Includes advanced sound design techniques and mastering chain.',
    dawType: 'Ableton Live',
    genre: 'EDM',
    bpm: 140,
    key: 'F' as MusicalKey,
    price: 24.99,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/10/29/audio_e8414db2a9.mp3?filename=house-loop-13092.mp3',
    imageUrl: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: '1',
    author: mockUsers[0],
    downloadCount: 95,
    createdAt: '2023-07-10T00:00:00Z',
    updatedAt: '2023-07-11T00:00:00Z',
  },
  {
    id: '5',
    title: 'Ambient Soundscape',
    description: 'Atmospheric ambient soundscape with evolving textures and field recordings. Great for film scoring or relaxation music.',
    dawType: 'Cubase',
    genre: 'Ambient',
    bpm: 90,
    key: 'C' as MusicalKey,
    price: 14.99,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/10/12/audio_88e176c334.mp3?filename=ambient-piano-atmosphere-with-natural-water-sounds-21379.mp3',
    imageUrl: 'https://images.pexels.com/photos/268941/pexels-photo-268941.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: '2',
    author: mockUsers[1],
    downloadCount: 72,
    createdAt: '2023-08-05T00:00:00Z',
    updatedAt: '2023-08-06T00:00:00Z',
  },
  {
    id: '6',
    title: 'Deep Tech House Project',
    description: 'Deep and groovy tech house project with unique sound design and rhythmic elements. Professional mixdown included.',
    dawType: 'FL Studio',
    genre: 'Techno',
    bpm: 125,
    key: 'Gm' as MusicalKey,
    price: 0,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_acf782aba9.mp3?filename=electronic-future-beats-117997.mp3',
    imageUrl: 'https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg?auto=compress&cs=tinysrgb&w=800',
    authorId: '3',
    author: mockUsers[2],
    downloadCount: 256,
    createdAt: '2023-09-12T00:00:00Z',
    updatedAt: '2023-09-13T00:00:00Z',
  },
];