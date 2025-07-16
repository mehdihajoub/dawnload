# Audio Data

This folder will contain audio files and related metadata.

## Structure

- Audio files (.mp3, .wav, .m4a, etc.)
- Audio metadata JSON files
- Audio thumbnails/waveforms

## Audio Requirements

Each audio should include:
- id (unique identifier)
- title
- url (path to audio file)
- duration (in seconds)
- associated image (cover art/thumbnail)
- genre (optional)
- creation date
- play count (optional)

## File Organization

```
audios/
├── files/           # Audio files
├── metadata/        # JSON metadata files
└── thumbnails/      # Associated images/cover art
```

The mock data is currently defined in `../mockData.ts` for development purposes. 