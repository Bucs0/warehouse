-- Create Database
CREATE DATABASE warehouse_inventory;
USE warehouse_inventory;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('Admin', 'Staff') DEFAULT 'Staff',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  signup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin
INSERT INTO users (username, email, password, name, role, status) 
VALUES ('admin', 'markjadebucao10@gmail.com', 'q110978123', 'Mark Jade Bucao', 'Admin', 'approved');

-- Categories Table
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  date_added DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  date_added DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers Table
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100) NOT NULL,
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  date_added DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Items Table
CREATE TABLE inventory_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_name VARCHAR(100) NOT NULL,
  category_id INT,
  quantity INT DEFAULT 0,
  location_id INT,
  reorder_level INT DEFAULT 10,
  price DECIMAL(10, 2) DEFAULT 0,
  supplier_id INT,
  damaged_status ENUM('Good', 'Damaged') DEFAULT 'Good',
  date_added DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Stock Transactions Table
CREATE TABLE stock_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  transaction_type ENUM('IN', 'OUT') NOT NULL,
  quantity INT NOT NULL,
  reason TEXT NOT NULL,
  user_id INT NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Appointments Table
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  scheduled_by_user_id INT NOT NULL,
  scheduled_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (scheduled_by_user_id) REFERENCES users(id)
);

-- Appointment Items Table
CREATE TABLE appointment_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Damaged Items Table
CREATE TABLE damaged_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  reason TEXT,
  status ENUM('Standby', 'Thrown') DEFAULT 'Standby',
  notes TEXT,
  date_damaged DATE NOT NULL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_name VARCHAR(100) NOT NULL,
  action ENUM('Added', 'Edited', 'Deleted', 'Transaction', 'Alert') NOT NULL,
  user_id INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Low Stock Alerts Tracking
CREATE TABLE low_stock_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);