# 📊 Data Requirements Plan for Enhanced Profiles

## Current Status: 5 Profiles × 2 Songs Each = 10 Songs Total

### 🎵 **New Audio Data Structure**
Each user gets:
- **1 Audio File**: `user_name.mp4` in `data/audios/files/`
- **1 Metadata File**: `user_name.json` in `data/audios/metadata/`
- **Multiple Songs**: Defined in metadata with covers and visuals

### 📁 **Updated Folder Structure**

```
src/data/
├── audios/
│   ├── files/                 # NEW: Audio files
│   │   ├── marcus.mp4         # Marcus Johnson's audio
│   │   ├── jordan.mp4         # Jordan Williams' audio
│   │   ├── alex.mp4           # Alex Chen's audio
│   │   ├── sophia.mp4         # Sophia Rodriguez's audio
│   │   └── deshawn.mp4        # DeShawn Davis' audio
│   └── metadata/              # NEW: Audio metadata
│       ├── marcus.json        # Marcus's song data
│       ├── jordan.json        # Jordan's song data
│       ├── alex.json          # Alex's song data
│       ├── sophia.json        # Sophia's song data
│       └── deshawn.json       # DeShawn's song data
├── images/
│   ├── profiles/              # Profile pictures
│   │   ├── marcus_profile.jpg
│   │   ├── jordan_profile.jpg
│   │   ├── alex_profile.jpg
│   │   ├── sophia_profile.jpg
│   │   └── deshawn_profile.jpg
│   ├── audio-covers/          # Song covers
│   │   ├── fire_beat_cover.jpg
│   │   ├── midnight_vibes_cover.jpg
│   │   └── ... (10 total covers needed)
│   └── song-visuals/          # Song video/images
│       ├── marcus_song1_visual.mp4
│       ├── marcus_song2_visual.mp4
│       └── ... (10 total visuals needed)
└── mockData.ts               # User profiles
```

### 📄 **Metadata File Structure**

Each `user_name.json` contains:
```json
{
  "userId": "marcus_johnson",
  "audioFile": "marcus.mp4",
  "songs": [
    {
      "id": "marcus_song_1",
      "title": "Fire Beat 2024",
      "duration": 180,
      "genre": "Hip Hop",
      "plays": 15200,
      "cover": "fire_beat_cover.jpg",
      "visual": "marcus_song1_visual.mp4",
      "timestamp": {
        "start": 0,
        "end": 180
      }
    },
    {
      "id": "marcus_song_2", 
      "title": "Street Dreams",
      "duration": 195,
      "genre": "Trap",
      "plays": 8900,
      "cover": "street_dreams_cover.jpg",
      "visual": "marcus_song2_visual.mp4",
      "timestamp": {
        "start": 180,
        "end": 375
      }
    }
  ],
  "totalDuration": 375,
  "uploadDate": "2024-01-15",
  "verified": true
}
```

### 👥 **Updated Profile-Audio Plan**

#### **Audio Files Needed (5 total):**
- `marcus.mp3` - Contains 2 songs (Fire Beat 2024 + Street Dreams)
- `jordan.mp3` - Contains 2 songs (Midnight Vibes + Bass Drop)  
- `alex.mp3` - Contains 2 songs (Studio Session + Mix Master)
- `sophia.mp3` - Contains 2 songs (Golden Hour + Fuego)
- `deshawn.mp3` - Contains 2 songs (Chi-Town Beats + Late Night Sessions)

#### **Metadata Files Needed (5 total):**
- `marcus.json` - Song metadata for Marcus
- `jordan.json` - Song metadata for Jordan
- `alex.json` - Song metadata for Alex
- `sophia.json` - Song metadata for Sophia
- `deshawn.json` - Song metadata for DeShawn

### 📊 **Updated Asset Count**

| Asset Type | Have | Need | Missing |
|------------|------|------|---------|
| Profile Pictures | 5 | 5 | 0 ✅ |
| Audio Files (.mp4) | 0 | 5 | 5 ❌ |
| Metadata Files (.json) | 0 | 5 | 5 ❌ |
| Audio Covers | 10 | 10 | 0 ✅ |
| Song Visuals | 0 | 10 | 10 ❌ |
| **Total** | **15** | **35** | **20** |

### 🎯 **Implementation Benefits**

1. **Clean Organization**: Audio files separate from metadata
2. **Scalable**: Easy to add more songs per user
3. **Efficient**: One audio file per user with multiple songs
4. **Flexible**: Metadata can define song segments within audio file
5. **Performant**: Single file load per user for all their content

### 🚀 **Ready for Implementation**

#### ✅ **Directories Created:**
- `src/data/audios/files/` 
- `src/data/audios/metadata/`

#### 📝 **Next Steps:**
1. Create 5 metadata JSON files for each user
2. Update mock data to reference new audio structure
3. Add 5 .mp4 audio files (user_name.mp4)
4. Add 1 more audio cover + 10 song visuals
5. Implement audio player with timestamp support

The new structure is much cleaner and allows for better organization of multi-song content per user! 🎵 