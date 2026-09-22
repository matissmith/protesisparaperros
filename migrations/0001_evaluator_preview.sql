CREATE TABLE IF NOT EXISTS evaluator_cases (
  case_id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  dog_name TEXT NOT NULL,
  dog_age_value INTEGER NOT NULL,
  dog_age_unit TEXT NOT NULL CHECK (dog_age_unit IN ('months','years')),
  dog_weight_range TEXT NOT NULL,
  need_selected TEXT NOT NULL,
  recommended_product TEXT NOT NULL,
  selected_product TEXT NOT NULL,
  product_changed INTEGER NOT NULL DEFAULT 0,
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  price_display TEXT NOT NULL,
  reservation_amount INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('purchase','information_only')),
  buyer_name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_iso TEXT NOT NULL,
  country_code TEXT NOT NULL,
  whatsapp_raw TEXT NOT NULL,
  whatsapp_normalized TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  price_terms_viewed INTEGER NOT NULL DEFAULT 0,
  buy_now_selected INTEGER NOT NULL DEFAULT 0,
  information_only_selected INTEGER NOT NULL DEFAULT 0,
  contact_completed INTEGER NOT NULL DEFAULT 0,
  checkout_viewed INTEGER NOT NULL DEFAULT 0,
  payment_started INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'not_started',
  payment_id TEXT,
  amount_paid INTEGER,
  status TEXT NOT NULL,
  source_url TEXT,
  follow_up_type TEXT,
  follow_up_status TEXT,
  refund_status TEXT,
  refund_id TEXT,
  refunded_at TEXT,
  sync_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_evaluator_cases_created ON evaluator_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_evaluator_cases_payment ON evaluator_cases(payment_status);

CREATE TABLE IF NOT EXISTS payment_preferences (
  case_id TEXT NOT NULL,
  idempotency_key TEXT PRIMARY KEY,
  preference_id TEXT NOT NULL UNIQUE,
  expected_amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  checkout_url TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES evaluator_cases(case_id)
);

CREATE TABLE IF NOT EXISTS payment_events (
  event_key TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  received_at TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES evaluator_cases(case_id)
);
