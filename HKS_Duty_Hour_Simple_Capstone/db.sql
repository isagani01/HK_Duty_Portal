CREATE DATABASE hks_db;
USE hks_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'Student'
);

CREATE TABLE duty_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  duty_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(100) NOT NULL,
  max_students INT NOT NULL,
  teacher_id INT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE duty_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  duty_date DATE NOT NULL,
  location VARCHAR(100) NOT NULL,
  position_name VARCHAR(100) NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  semester VARCHAR(30) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

INSERT INTO users (full_name,email,password,role) VALUES
('System Admin','admin@hks.local','admin123','Admin'),
('Sample Teacher','teacher@hks.local','teacher123','Teacher'),
('Sample Student','student@hks.local','student123','Student');
