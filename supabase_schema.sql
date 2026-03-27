-- ============================================================
--  BOCRA Customer Portal – Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Users (bocra_users to avoid conflicts)
CREATE TABLE IF NOT EXISTS bocra_users (
  id                 BIGSERIAL PRIMARY KEY,
  name               TEXT    NOT NULL,
  email              TEXT    NOT NULL UNIQUE,
  password           TEXT    NOT NULL,
  phone              TEXT    DEFAULT '+267 7100 0000',
  company            TEXT    DEFAULT '',
  email_verified     BOOLEAN DEFAULT FALSE,
  verification_token TEXT    DEFAULT NULL,
  token_expires_at   TIMESTAMPTZ DEFAULT NULL,
  deleted            BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT  NOT NULL REFERENCES bocra_users(id),
  ref              TEXT    NOT NULL UNIQUE,
  type             TEXT    NOT NULL,
  service_provider TEXT    DEFAULT '',
  category         TEXT    DEFAULT '',
  location         TEXT    DEFAULT NULL,
  description      TEXT    NOT NULL DEFAULT '',
  status           TEXT    NOT NULL DEFAULT 'In Progress',
  resolution_notes TEXT    DEFAULT '',
  files            JSONB   DEFAULT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NULL
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES bocra_users(id),
  name       TEXT   NOT NULL,
  type       TEXT   NOT NULL,
  serial     TEXT   NOT NULL UNIQUE,
  status     TEXT   NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licenses
CREATE TABLE IF NOT EXISTS licenses (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES bocra_users(id),
  app_id     TEXT   NOT NULL UNIQUE,
  type       TEXT   NOT NULL,
  status     TEXT   NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT  NOT NULL REFERENCES bocra_users(id),
  ref         TEXT    NOT NULL,
  description TEXT    NOT NULL,
  type        TEXT    NOT NULL DEFAULT 'normal',
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Activity
CREATE TABLE IF NOT EXISTS activity (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES bocra_users(id),
  ref         TEXT   NOT NULL,
  description TEXT   NOT NULL,
  status      TEXT   NOT NULL DEFAULT 'Success',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id       BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer   TEXT NOT NULL
);

-- Seed FAQs (only if empty)
INSERT INTO faqs (question, answer)
SELECT * FROM (VALUES
  ('How do I track my complaint?', 'Go to the Complaints tab and use your Reference ID in the tracking box.'),
  ('What do I do if device verification fails?', 'You can click Retry on the Devices page to re-upload clear photos of the serial number.'),
  ('How long does a license application take?', 'License applications are typically reviewed within 10–15 business days of submission.'),
  ('How do I update my contact information?', 'Go to Account Settings and click on any field to edit it inline.'),
  ('Is my data secure on this portal?', 'Yes. All data is encrypted in transit (HTTPS) and passwords are stored using industry-standard hashing (bcrypt).')
) AS v(question, answer)
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);
