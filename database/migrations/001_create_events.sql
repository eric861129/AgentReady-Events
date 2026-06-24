CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('taipei', 'new_taipei', 'taichung', 'kaohsiung', 'online')),
  location_label TEXT NOT NULL,
  venue TEXT NOT NULL,
  price TEXT NOT NULL CHECK (price IN ('free', 'paid')),
  price_label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'ai', 'devops', 'security', 'data')),
  category_label TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  level_label TEXT NOT NULL,
  remaining_capacity INTEGER NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  detail_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_filters ON events (location, price, category, level);
