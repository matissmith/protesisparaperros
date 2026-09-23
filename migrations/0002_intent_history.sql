-- Historial append-only de intención/decisión del usuario, separado del
-- snapshot actual (que sigue viviendo en evaluator_cases.decision /
-- selected_product, ya existentes). No reemplaza ni duplica payment_events.
ALTER TABLE evaluator_cases ADD COLUMN intent_revision INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS case_intent_events (
  event_key TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  decision TEXT NOT NULL,
  selected_product TEXT NOT NULL,
  previous_decision TEXT,
  previous_product TEXT,
  revision INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES evaluator_cases(case_id)
);

CREATE INDEX IF NOT EXISTS idx_case_intent_events_case ON case_intent_events(case_id);
