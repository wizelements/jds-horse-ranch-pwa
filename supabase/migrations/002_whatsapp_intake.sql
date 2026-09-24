-- JD's Horse Ranch WhatsApp booking intake
-- Preserves the required JD human approval gate before payment.

CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'sms', 'web', 'voice')),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  rider_count INT CHECK (rider_count IS NULL OR (rider_count >= 1 AND rider_count <= 12)),
  rider_details TEXT,
  requested_datetime_text TEXT,
  experience TEXT,
  email TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'COLLECTING_INFORMATION'
    CHECK (status IN (
      'COLLECTING_INFORMATION',
      'PENDING_JD',
      'AWAITING_PAYMENT',
      'PAID',
      'BOOKED',
      'DECLINED',
      'CANCELLED',
      'EXPIRED'
    )),
  intake_step VARCHAR(60) NOT NULL DEFAULT 'name',
  hold_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wa_message_id TEXT UNIQUE,
  inquiry_id UUID REFERENCES booking_inquiries(id) ON DELETE SET NULL,
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  phone TEXT NOT NULL,
  body TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_inquiries_phone
  ON booking_inquiries(customer_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status
  ON booking_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_inquiry
  ON whatsapp_messages(inquiry_id, created_at DESC);

ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- No public policies by design. The webhook/admin path uses the server-only
-- SUPABASE_SERVICE_ROLE_KEY.
