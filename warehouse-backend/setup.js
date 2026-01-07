const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  let connection;
  
  try {
    // Connect to MySQL (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Connected to MySQL');

    // Drop and recreate database
    console.log('🗑️  Dropping old database if exists...');
    await connection.query('DROP DATABASE IF EXISTS warehouse_inventory');
    
    console.log('📦 Creating database...');
    await connection.query('CREATE DATABASE warehouse_inventory');
    
    console.log('🔄 Switching to database...');
    await connection.query('USE warehouse_inventory');

    console.log('📋 Creating tables...');

    // Users
    await connection.query(`
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
      )
    `);
    console.log('  ✓ users');

    await connection.query(`
      INSERT INTO users (username, email, password, name, role, status) 
      VALUES ('admin', 'markjadebucao10@gmail.com', 'q110978123', 'Mark Jade Bucao', 'Admin', 'approved')
    `);

    // Categories
    await connection.query(`
      CREATE TABLE categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        date_added DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ categories');

    await connection.query(`
      INSERT INTO categories (category_name, description, date_added) VALUES
      ('Office Supplies', 'Paper, pens, and general office items', CURDATE()),
      ('Equipment', 'Printers, computers, and machinery', CURDATE()),
      ('Furniture', 'Desks, chairs, and storage', CURDATE()),
      ('Electronics', 'Gadgets and electronic accessories', CURDATE()),
      ('Other', 'Miscellaneous items', CURDATE())
    `);

    // Locations
    await connection.query(`
      CREATE TABLE locations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        location_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        date_added DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ locations');

    await connection.query(`
      INSERT INTO locations (location_name, description, date_added) VALUES
      ('Warehouse A, Shelf 1', 'Main storage area, first floor', CURDATE()),
      ('Warehouse B, Section 2', 'Equipment storage, second floor', CURDATE()),
      ('Warehouse C, Area 1', 'Furniture storage', CURDATE()),
      ('Warehouse A, Shelf 3', 'Office supplies section', CURDATE()),
      ('Warehouse B, Section 4', 'Electronics storage', CURDATE())
    `);

    // Suppliers
    await connection.query(`
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
      )
    `);
    console.log('  ✓ suppliers');

    await connection.query(`
      INSERT INTO suppliers (supplier_name, contact_person, contact_email, contact_phone, address, is_active, date_added) VALUES
      ('Office Warehouse', 'Juan Dela Cruz', 'jomissmart@gmail.com', '+63-912-345-6789', 'Quezon City, Metro Manila', TRUE, CURDATE()),
      ('COSCO SHIPPING', 'Maria Santos', 'berdecaloy@gmail.com', '+63-917-888-9999', 'Manila Port Area', TRUE, CURDATE()),
      ('Tech Supplies Inc.', 'Pedro Reyes', 'chiefmayo2024@gmail.com', '+63-918-111-2222', 'Makati City', TRUE, CURDATE())
    `);

    // Inventory Items
    await connection.query(`
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
      )
    `);
    console.log('  ✓ inventory_items');

    await connection.query(`
      INSERT INTO inventory_items (item_name, category_id, quantity, location_id, reorder_level, price, supplier_id, date_added) VALUES
      ('A4 Bond Paper', 1, 100, 1, 20, 250.00, 1, CURDATE()),
      ('HP Printer', 2, 40, 2, 10, 15000.00, 3, CURDATE()),
      ('Office Desk', 3, 50, 3, 5, 8500.00, 1, CURDATE()),
      ('Ballpen (Black)', 1, 200, 4, 50, 10.00, 1, CURDATE()),
      ('Laptop Stand', 4, 100, 5, 20, 1200.00, 3, CURDATE())
    `);

    // Stock Transactions
    await connection.query(`
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
      )
    `);
    console.log('  ✓ stock_transactions');

    // Appointments
    await connection.query(`
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
      )
    `);
    console.log('  ✓ appointments');

    // Appointment Items
    await connection.query(`
      CREATE TABLE appointment_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ appointment_items');

    // Damaged Items
    await connection.query(`
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
      )
    `);
    console.log('  ✓ damaged_items');

    // Activity Logs
    await connection.query(`
      CREATE TABLE activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_name VARCHAR(100) NOT NULL,
        action ENUM('Added', 'Edited', 'Deleted', 'Transaction', 'Alert') NOT NULL,
        user_id INT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        details TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('  ✓ activity_logs');

    // Low Stock Alerts
    await connection.query(`
      CREATE TABLE low_stock_alerts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_id INT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ low_stock_alerts');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Database: warehouse_inventory');
    console.log('   - Tables: 11 tables created');
    console.log('   - Admin user: admin / q110978123');
    console.log('   - Sample data: Added');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();