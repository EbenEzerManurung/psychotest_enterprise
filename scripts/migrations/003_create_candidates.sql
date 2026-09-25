CREATE TABLE candidates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  nik VARCHAR(20) UNIQUE,
  phone VARCHAR(20),
  birth_date DATE,
  gender ENUM('L','P') DEFAULT 'L',
  address TEXT,
  education VARCHAR(100),
  position_applied VARCHAR(150),
  status ENUM('registered','testing','completed','hired','rejected') DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
