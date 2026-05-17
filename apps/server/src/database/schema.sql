PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('live_photo', 'photo', 'video')),
  image_path TEXT NOT NULL,
  video_path TEXT,
  video_compatible_path TEXT,
  thumbnail_path TEXT NOT NULL,
  duration REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_album_id ON media_items(album_id);
