CREATE TABLE intelligence_questions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subcategory_id INT UNSIGNED NOT NULL,
  question_text TEXT NOT NULL,
  image_url VARCHAR(255) NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer ENUM('A','B','C','D') NOT NULL,
  difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
  score_weight DECIMAL(4,2) DEFAULT 1.00,
  time_seconds INT UNSIGNED DEFAULT 60,
  order_number INT UNSIGNED DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES test_subcategories(id) ON DELETE CASCADE,
  INDEX idx_subcat (subcategory_id)
) ENGINE=InnoDB;

CREATE TABLE personality_questions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type ENUM('ipsative','likert') DEFAULT 'ipsative',
  dimension VARCHAR(50) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  order_number INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE personality_options (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id INT UNSIGNED NOT NULL,
  option_label ENUM('A','B','C','D') NOT NULL,
  statement_text TEXT NOT NULL,
  dimension_score JSON NOT NULL,
  FOREIGN KEY (question_id) REFERENCES personality_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;
