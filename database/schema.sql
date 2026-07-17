-- Doudis Beauty - MySQL schema
CREATE DATABASE IF NOT EXISTS doudis_beauty
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE doudis_beauty;

-- ============================
-- Table: admins
-- ============================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================
-- Table: products
-- ============================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_fr VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  title_ar VARCHAR(200) NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  description_ar TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  stock_status ENUM('in_stock','out_of_stock') NOT NULL DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_price (price)
) ENGINE=InnoDB;

-- ============================
-- Table: orders
-- ============================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  payment_type ENUM('cod','bank_transfer','ccp') NOT NULL DEFAULT 'cod',
  delivery_type ENUM('home','pickup') NOT NULL DEFAULT 'home',
  status ENUM('pending','processed','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_status (status),
  INDEX idx_wilaya (wilaya)
) ENGINE=InnoDB;
