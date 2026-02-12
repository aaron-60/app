const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'jobconnect.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      headline TEXT,
      summary TEXT,
      avatar TEXT,
      location TEXT,
      industry TEXT,
      experience_years INTEGER DEFAULT 0,
      skills TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      content TEXT NOT NULL,
      image TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT REFERENCES posts(id),
      user_id TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT REFERENCES posts(id),
      user_id TEXT REFERENCES users(id),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      posted_by TEXT REFERENCES users(id),
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      type TEXT CHECK(type IN ('Full-time', 'Part-time', 'Contract', 'Remote')),
      salary_min INTEGER,
      salary_max INTEGER,
      experience_level TEXT CHECK(experience_level IN ('Entry', 'Mid', 'Senior', 'Lead')),
      skills_required TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      job_id TEXT REFERENCES jobs(id),
      user_id TEXT REFERENCES users(id),
      cover_letter TEXT,
      resume TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      requester_id TEXT REFERENCES users(id),
      receiver_id TEXT REFERENCES users(id),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT REFERENCES users(id),
      receiver_id TEXT REFERENCES users(id),
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      type TEXT CHECK(type IN ('connection_request', 'connection_accepted', 'job_application', 'message', 'post_like', 'post_comment')),
      reference_id TEXT,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      job_id TEXT REFERENCES jobs(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
    CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
    CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON connections(requester_id);
    CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON connections(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
  `);

  console.log('Database initialized successfully');
}

module.exports = { db, initDatabase };
