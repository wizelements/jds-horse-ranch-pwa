PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('call', 'email')),
  source TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_min REAL,
  price_max REAL,
  duration_minutes INTEGER,
  age_requirement TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_inquiries (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','sms','web','voice')),
  preferred_channel TEXT NOT NULL CHECK (preferred_channel IN ('whatsapp','sms','web','voice')),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  email TEXT,
  service_requested TEXT,
  rider_count INTEGER CHECK (rider_count IS NULL OR rider_count BETWEEN 1 AND 12),
  rider_details TEXT,
  requested_datetime_text TEXT,
  alternate_datetime_text TEXT,
  experience TEXT,
  qualification_notes TEXT,
  marketing_consent INTEGER NOT NULL DEFAULT 0 CHECK (marketing_consent IN (0,1)),
  marketing_opt_out_at TEXT,
  automation_paused INTEGER NOT NULL DEFAULT 0 CHECK (automation_paused IN (0,1)),
  human_takeover_requested_at TEXT,
  reschedule_requested_at TEXT,
  reschedule_request_text TEXT,
  last_customer_message_at TEXT,
  customer_service_window_expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'COLLECTING_INFORMATION'
    CHECK (status IN (
      'COLLECTING_INFORMATION','PENDING_JD','AWAITING_PAYMENT','BOOKED',
      'COMPLETED','DECLINED','CANCELLED','EXPIRED'
    )),
  intake_step TEXT NOT NULL DEFAULT 'name',
  hold_expires_at TEXT,
  approved_start_at TEXT,
  approval_note TEXT,
  approved_amount_cents INTEGER CHECK (approved_amount_cents IS NULL OR approved_amount_cents > 0),
  square_payment_link_id TEXT UNIQUE,
  square_order_id TEXT UNIQUE,
  square_payment_url TEXT,
  paid_at TEXT,
  booked_at TEXT,
  completed_at TEXT,
  confirmation_sent_at TEXT,
  reminder_sent_at TEXT,
  followup_sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS communication_messages (
  id TEXT PRIMARY KEY,
  provider_message_id TEXT UNIQUE,
  inquiry_id TEXT REFERENCES booking_inquiries(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','sms','web','voice')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  phone TEXT NOT NULL,
  body TEXT,
  raw_payload TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_events (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS communication_status_events (
  id TEXT PRIMARY KEY,
  provider_message_id TEXT NOT NULL,
  inquiry_id TEXT REFERENCES booking_inquiries(id) ON DELETE SET NULL,
  phone TEXT,
  status TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  raw_payload TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_display_order ON gallery_photos(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_phone ON booking_inquiries(customer_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status ON booking_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_hold ON booking_inquiries(status, hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_start ON booking_inquiries(status, approved_start_at);
CREATE INDEX IF NOT EXISTS idx_communication_inquiry ON communication_messages(inquiry_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_events_inquiry ON booking_events(inquiry_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_status_message ON communication_status_events(provider_message_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_status_inquiry ON communication_status_events(inquiry_id, created_at DESC);

INSERT OR IGNORE INTO services
  (id, name, description, price_min, price_max, duration_minutes, age_requirement, display_order, active, created_at, updated_at)
VALUES
  ('service-riding-lessons', 'Riding Lessons', 'Professional one-on-one riding instruction for all skill levels', 50, 75, 60, '8+', 1, 1, datetime('now'), datetime('now')),
  ('service-trail-rides', 'Trail Rides', 'Scenic guided trail rides through beautiful countryside', 60, 80, 90, '12+', 2, 1, datetime('now'), datetime('now')),
  ('service-special-events', 'Special Events', 'Private birthday parties, group events, and corporate outings', 100, 500, 120, 'varies', 3, 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO settings (id, key, value, updated_at) VALUES
  ('setting-site-name', 'site_name', 'JD''s Horse Ranch', datetime('now')),
  ('setting-site-phone', 'site_phone', '(404) 981-2361', datetime('now')),
  ('setting-site-address', 'site_address', '7555 Jones Rd. Fairburn, GA', datetime('now'));
