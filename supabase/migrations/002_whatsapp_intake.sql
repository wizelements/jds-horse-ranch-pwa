-- JD's Horse Ranch Reservation Assistant V1
-- Shared intake for web, WhatsApp, SMS, and future voice.
-- JD remains the approval authority before any payment request.

CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'web', 'voice')),
  preferred_channel VARCHAR(20) NOT NULL CHECK (preferred_channel IN ('whatsapp', 'sms', 'web', 'voice')),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  email TEXT,
  service_requested TEXT,
  rider_count INT CHECK (rider_count IS NULL OR (rider_count >= 1 AND rider_count <= 12)),
  rider_details TEXT,
  requested_datetime_text TEXT,
  alternate_datetime_text TEXT,
  experience TEXT,
  qualification_notes TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(40) NOT NULL DEFAULT 'COLLECTING_INFORMATION'
    CHECK (status IN (
      'COLLECTING_INFORMATION',
      'PENDING_JD',
      'AWAITING_PAYMENT',
      'BOOKED',
      'COMPLETED',
      'DECLINED',
      'CANCELLED',
      'EXPIRED'
    )),
  intake_step VARCHAR(60) NOT NULL DEFAULT 'name',
  hold_expires_at TIMESTAMPTZ,
  approved_start_at TIMESTAMPTZ,
  approval_note TEXT,
  approved_amount_cents INT CHECK (approved_amount_cents IS NULL OR approved_amount_cents > 0),
  square_payment_link_id TEXT UNIQUE,
  square_order_id TEXT UNIQUE,
  square_payment_url TEXT,
  paid_at TIMESTAMPTZ,
  booked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  followup_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communication_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_message_id TEXT UNIQUE,
  inquiry_id UUID REFERENCES booking_inquiries(id) ON DELETE SET NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'web', 'voice')),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  phone TEXT NOT NULL,
  body TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_inquiries_phone
  ON booking_inquiries(customer_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status
  ON booking_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_hold
  ON booking_inquiries(status, hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_start
  ON booking_inquiries(status, approved_start_at);
CREATE INDEX IF NOT EXISTS idx_communication_inquiry
  ON communication_messages(inquiry_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_events_inquiry
  ON booking_events(inquiry_id, created_at DESC);

ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_events ENABLE ROW LEVEL SECURITY;

-- No public RLS policies. These records contain private customer booking data.
-- Server routes use SUPABASE_SERVICE_ROLE_KEY; the browser never receives it.
