-- Contacts table for logging calls/emails
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'email')),
  source TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table for menu management
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  duration_minutes INT,
  age_requirement VARCHAR(100),
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery photos
CREATE TABLE gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table for accessibility and site config
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default services (matching the PWA)
INSERT INTO services (name, description, price_min, price_max, duration_minutes, age_requirement, display_order) VALUES
  ('Riding Lessons', 'Professional one-on-one riding instruction for all skill levels', 50.00, 75.00, 60, '8+', 1),
  ('Trail Rides', 'Scenic guided trail rides through beautiful countryside', 60.00, 80.00, 90, '12+', 2),
  ('Special Events', 'Private birthday parties, group events, and corporate outings', 100.00, 500.00, 120, 'varies', 3);

-- Set admin access control (basic: request-level auth in Next.js)
-- Note: Store admin password hash in Supabase secrets, not in DB
INSERT INTO settings (key, value) VALUES
  ('site_name', 'JD''s Horse Ranch'),
  ('site_phone', '(404) 981-2361'),
  ('site_address', '7555 Jones Rd. Fairburn, GA'),
  ('accessibility_default_text_size', '100'),
  ('accessibility_default_contrast', 'normal');

-- Create indexes for performance
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_services_display_order ON services(display_order);
CREATE INDEX idx_gallery_photos_display_order ON gallery_photos(display_order);
CREATE INDEX idx_testimonials_display_order ON testimonials(display_order);
