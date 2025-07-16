# Studuo Frontend - Project Structure

A React Native/Expo prototype for a music collaboration social platform.

## 🏗️ Project Architecture

```
studuo_front/
├── App.tsx                 # Root component with navigation setup
├── src/
│   ├── components/         # Reusable UI components (to be implemented)
│   ├── screens/           # Main screen components
│   │   ├── HomeScreen.tsx     # Swipe/Discovery interface
│   │   ├── PlugScreen.tsx     # Matches and chat list
│   │   ├── NextUpScreen.tsx   # Trending users
│   │   ├── ProfileScreen.tsx  # User profile
│   │   └── ChatScreen.tsx     # Individual chat
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.tsx   # Bottom tabs + stack navigation
│   ├── data/             # Data management
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── mockData.ts       # Development mock data
│   │   ├── profiles/         # Profile data (user to fill)
│   │   ├── audios/          # Audio files and metadata
│   │   │   ├── files/
│   │   │   ├── metadata/
│   │   │   └── thumbnails/
│   │   └── images/          # Image assets
│   │       ├── profiles/
│   │       ├── audio-covers/
│   │       ├── backgrounds/
│   │       └── ui/
│   ├── hooks/            # Custom React hooks (to be implemented)
│   ├── utils/            # Utility functions (to be implemented)
│   └── theme/            # Design system
│       └── index.ts          # Colors, typography, spacing
└── assets/               # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Vibrant Orange (#FF7900)
- **Secondary**: Golden Yellow (#FFBF00) 
- **Accent**: Golden Yellow (#FFBF00)
- **Accent Secondary**: Light Golden Yellow (#F2CF7E)
- **Background**: Black (#000000)
- **Surface**: Dark Gray (#1A1A1A)
- **Text**: White (#FFFFFF)
- **Like/Action**: Golden Yellow (#FFBF00)
- **Warning**: Bright Yellow (#FFE642)

### Typography
- System fonts with multiple size scales
- Consistent line heights
- Bold, medium, and regular weights

### Spacing & Layout
- 8px grid system
- Consistent padding and margins
- Responsive border radius values

## 🗃️ Data Models

### User Profile
```typescript
interface User {
  id: string
  username: string
  name: string
  surname: string
  age: number
  location: string
  profilePicture: string
  bio: string
  role: 'rapper' | 'beatmaker' | 'engineer'
  audios: Audio[]
  isVerified?: boolean
  followers?: number
  following?: number
  impressions?: number
}
```

### Audio Track
```typescript
interface Audio {
  id: string
  title: string
  url: string
  duration: number
  associatedImage: string
  genre?: string
  createdAt: string
  plays?: number
}
```

## 📱 App Structure

### 4 Main Screens
1. **Home** - Tinder-like swipe interface for discovery
2. **Plug** - Matches and chat conversations
3. **Next Up** - Trending creators with most impressions
4. **Profile** - User's own profile with edit capabilities

### Navigation Flow
- Bottom tab navigation for main screens
- Stack navigation for chat screens
- Dark theme with custom styling

## 🚀 Technologies Used

- **React Native + Expo** - Cross-platform development
- **TypeScript** - Type safety
- **React Navigation** - Navigation system
- **Expo AV** - Audio handling (ready for implementation)
- **React Native Reanimated** - Animations (ready for implementation)
- **React Native Gesture Handler** - Touch interactions

## 📦 Dependencies Installed

- `@react-navigation/native`
- `@react-navigation/bottom-tabs` 
- `@react-navigation/native-stack`
- `react-native-screens`
- `react-native-safe-area-context`
- `expo-av`
- `react-native-reanimated`
- `react-native-gesture-handler`
- `@expo/vector-icons`

## 🎯 Next Steps

1. **Implement Home Screen**: Swipe cards with user profiles
2. **Build Plug Screen**: Match list and chat interface  
3. **Create Next Up Screen**: Trending users layout
4. **Design Profile Screen**: Rich media profile with editing
5. **Add Components**: Reusable UI components
6. **Implement Audio Player**: Integrated music playback
7. **Add Animations**: Smooth transitions and gestures

## 🎵 Mock Data

Contains 5 sample users with different roles:
- Rappers with audio tracks
- Beatmakers with instrumentals  
- Sound engineers with portfolios
- Complete with follower counts and impressions

Ready for stunning visual implementation! 🎨 