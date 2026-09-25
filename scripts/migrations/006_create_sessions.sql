CREATE TABLE test_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  status ENUM('in_progress','completed','timeout','abandoned') DEFAULT 'in_progress',
  total_score DECIMAL(8,2) DEFAULT 0,
  max_score DECIMAL(8,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  integrity_score INT DEFAULT 100,
  violation_count INT DEFAULT 0,
  camera_enabled TINYINT(1) DEFAULT 0,
  time_spent_seconds INT UNSIGNED DEFAULT 0,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES test_categories(id),
  INDEX idx_candidate_status (candidate_id, status)
) ENGINE=InnoDB;

CREATE TABLE intelligence_answers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  selected_answer ENUM('A','B','C','D') NULL,
  is_correct TINYINT(1) DEFAULT 0,
  raw_score DECIMAL(4,2) DEFAULT 0,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_taken_seconds INT UNSIGNED DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES intelligence_questions(id),
  UNIQUE KEY uq_session_question (session_id, question_id)
) ENGINE=InnoDB;

CREATE TABLE personality_answers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  selected_most ENUM('A','B','C','D') NULL,
  selected_least ENUM('A','B','C','D') NULL,
  dimension_scores JSON NOT NULL,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES personality_questions(id),
  UNIQUE KEY uq_session_question (session_id, question_id)
) ENGINE=InnoDB;

CREATE TABLE personality_results (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL UNIQUE,
  candidate_id INT UNSIGNED NOT NULL,
  integrity_score DECIMAL(5,2) DEFAULT 0,
  conflict_mgmt_score DECIMAL(5,2) DEFAULT 0,
  conviction_score DECIMAL(5,2) DEFAULT 0,
  creativity_score DECIMAL(5,2) DEFAULT 0,
  teamwork_score DECIMAL(5,2) DEFAULT 0,
  interpersonal_score DECIMAL(5,2) DEFAULT 0,
  character_summary TEXT NULL,
  raw_dimension_data JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- PROCTORING TABLES
-- ============================================
CREATE TABLE proctoring_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  severity ENUM('info','warning','critical') DEFAULT 'warning',
  score_delta INT DEFAULT 0,
  detail TEXT,
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE,
  INDEX idx_session (session_id, occurred_at)
) ENGINE=InnoDB;

CREATE TABLE proctoring_snapshots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  image_data MEDIUMTEXT NOT NULL,
  reason VARCHAR(100),
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE,
  INDEX idx_session_time (session_id, captured_at)
) ENGINE=InnoDB;