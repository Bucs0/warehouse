const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

app.post('/api/auth/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    const [users] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND status = "approved"',
      [usernameOrEmail, usernameOrEmail]
    );
    
    if (users.length === 0) {
      const [pendingUsers] = await pool.query(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND status = "pending"',
        [usernameOrEmail, usernameOrEmail]
      );
      
      if (pendingUsers.length > 0) {
        return res.status(401).json({ error: 'Account pending approval' });
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      const existingUser = existing[0];
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }
    
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, name, role, status) VALUES (?, ?, ?, ?, "Staff", "pending")',
      [username, email, password, name]
    );
    
    res.json({ 
      id: result.insertId, 
      message: 'Account created successfully. Waiting for admin approval.' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/pending', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, name, role, status, DATE_FORMAT(signup_date, "%m/%d/%Y") as signupDate FROM users WHERE status = "pending" ORDER BY signup_date DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/approved', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, name, role, status FROM users WHERE status = "approved" AND role = "Staff" ORDER BY name'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/:id/approve', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE users SET status = "approved" WHERE id = ?', 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/users/:id/reject', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND status = "pending"', 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or already processed' });
    }
    
    res.json({ message: 'User rejected and removed' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    console.log('🗑️ Delete user request for ID:', req.params.id);
    console.log('📋 Request method:', req.method);
    console.log('📋 Request URL:', req.url);
    
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      console.log('❌ Invalid user ID');
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    console.log('🔍 Checking if user exists...');
    const [users] = await pool.query(
      'SELECT id, username, role, status FROM users WHERE id = ?',
      [userId]
    );
    
    console.log('📊 Query result:', users);
    
    if (users.length === 0) {
      console.log('❌ User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    console.log('👤 User found:', user);
    
    if (user.role === 'Admin') {
      console.log('🚫 Cannot delete admin account');
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }
    
    console.log('🗑️ Attempting to delete user...');
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND role != "Admin"',
      [userId]
    );
    
    console.log('📊 Delete result:', result);
    
    if (result.affectedRows === 0) {
      console.log('❌ Delete failed - no rows affected');
      return res.status(400).json({ error: 'Unable to delete user. User may be an admin or already deleted.' });
    }
    
    console.log('✅ User deleted successfully, affected rows:', result.affectedRows);
    res.json({ 
      message: 'User account deleted successfully',
      deletedUser: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('❌ Error deleting user:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        i.*,
        c.category_name as category,
        l.location_name as location,
        s.supplier_name as supplier
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      ORDER BY i.id DESC
    `);
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/inventory/:id', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        i.*,
        c.category_name as category,
        l.location_name as location,
        s.supplier_name as supplier
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.id = ?
    `, [req.params.id]);
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(items[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { 
      itemName, 
      categoryId, 
      quantity, 
      locationId, 
      reorderLevel, 
      price, 
      supplierId, 
      dateAdded 
    } = req.body;
    
    const currentDate = dateAdded || new Date().toISOString().split('T')[0];
    
    console.log('📥 Adding inventory item:', {
      itemName,
      categoryId,
      quantity,
      locationId,
      reorderLevel,
      price,
      supplierId,
      dateAdded: currentDate
    });
    
    const [result] = await pool.query(
      `INSERT INTO inventory_items 
       (item_name, category_id, quantity, location_id, reorder_level, price, supplier_id, date_added) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemName, categoryId, quantity, locationId, reorderLevel, price, supplierId || null, currentDate]
    );
    
    console.log('✅ Item added successfully with ID:', result.insertId);
    
    res.json({ 
      id: result.insertId, 
      message: 'Item added successfully' 
    });
  } catch (error) {
    console.error('❌ Error adding item:', error);
    console.error('Error details:', error.message, error.sqlMessage);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message,
      sqlError: error.sqlMessage 
    });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { 
      itemName, 
      categoryId, 
      quantity, 
      locationId, 
      reorderLevel, 
      price, 
      supplierId,
      damagedStatus 
    } = req.body;
    
    const [result] = await pool.query(
      `UPDATE inventory_items 
       SET item_name = ?, category_id = ?, quantity = ?, location_id = ?, 
           reorder_level = ?, price = ?, supplier_id = ?, damaged_status = ?
       WHERE id = ?`,
      [itemName, categoryId, quantity, locationId, reorderLevel, price, supplierId || null, damagedStatus || 'Good', req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM inventory_items WHERE id = ?', 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT 
        id,
        category_name,
        description,
        DATE_FORMAT(date_added, '%m/%d/%Y') as date_added,
        created_at
      FROM categories 
      ORDER BY category_name
    `);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    
    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const [existing] = await pool.query(
      'SELECT * FROM categories WHERE category_name = ?',
      [categoryName.trim()]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    const [result] = await pool.query(
      'INSERT INTO categories (category_name, description, date_added) VALUES (?, ?, ?)',
      [categoryName.trim(), description || '', currentDate]
    );
    
    res.json({ 
      id: result.insertId,
      message: 'Category added successfully'
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    
    const [existing] = await pool.query(
      'SELECT * FROM categories WHERE category_name = ? AND id != ?',
      [categoryName, req.params.id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    
    const [result] = await pool.query(
      'UPDATE categories SET category_name = ?, description = ? WHERE id = ?',
      [categoryName, description, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_items WHERE category_id = ?',
      [req.params.id]
    );
    
    if (items[0].count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. ${items[0].count} item(s) are using this category.` 
      });
    }
    
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const [locations] = await pool.query(`
      SELECT 
        id,
        location_name,
        description,
        DATE_FORMAT(date_added, '%m/%d/%Y') as date_added,
        created_at
      FROM locations 
      ORDER BY location_name
    `);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.post('/api/locations', async (req, res) => {
  try {
    const { locationName, description } = req.body;
    
    if (!locationName || !locationName.trim()) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    
    const [existing] = await pool.query(
      'SELECT * FROM locations WHERE location_name = ?',
      [locationName.trim()]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Location already exists' });
    }
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    const [result] = await pool.query(
      'INSERT INTO locations (location_name, description, date_added) VALUES (?, ?, ?)',
      [locationName.trim(), description || '', currentDate]
    );
    
    console.log('✅ Location added successfully:', {
      id: result.insertId,
      locationName: locationName.trim()
    });
    
    res.json({ 
      id: result.insertId,
      message: 'Location added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding location:', error);
    res.status(500).json({ 
      error: error.message || 'Server error',
      details: error.sqlMessage || ''
    });
  }
});

app.put('/api/locations/:id', async (req, res) => {
  try {
    const { locationName, description } = req.body;
    
    if (!locationName || !locationName.trim()) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    
    const [existing] = await pool.query(
      'SELECT * FROM locations WHERE location_name = ? AND id != ?',
      [locationName.trim(), req.params.id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Location name already exists' });
    }
    
    const [result] = await pool.query(
      'UPDATE locations SET location_name = ?, description = ? WHERE id = ?',
      [locationName.trim(), description || '', req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    console.log('✅ Location updated successfully:', {
      id: req.params.id,
      locationName: locationName.trim()
    });
    
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({ 
      error: error.message || 'Server error',
      details: error.sqlMessage || ''
    });
  }
});

app.delete('/api/locations/:id', async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_items WHERE location_id = ?',
      [req.params.id]
    );
    
    if (items[0].count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete location. ${items[0].count} item(s) are using this location.` 
      });
    }
    
    const [result] = await pool.query(
      'DELETE FROM locations WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    console.log('✅ Location deleted successfully:', req.params.id);
    
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting location:', error);
    res.status(500).json({ 
      error: error.message || 'Server error',
      details: error.sqlMessage || ''
    });
  }
});

app.get('/api/suppliers', async (req, res) => {
  try {
    const [suppliers] = await pool.query(`
      SELECT 
        id,
        supplier_name,
        contact_person,
        contact_email,
        contact_phone,
        address,
        is_active,
        DATE_FORMAT(date_added, '%m/%d/%Y') as date_added,
        created_at
      FROM suppliers 
      ORDER BY supplier_name
    `);
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { 
      supplierName, 
      contactPerson, 
      contactEmail, 
      contactPhone, 
      address, 
      isActive 
    } = req.body;
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    const [result] = await pool.query(
      `INSERT INTO suppliers 
       (supplier_name, contact_person, contact_email, contact_phone, address, is_active, date_added) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [supplierName, contactPerson, contactEmail, contactPhone, address, isActive, currentDate]
    );
    
    res.json({ 
      id: result.insertId,
      message: 'Supplier added successfully'
    });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { 
      supplierName, 
      contactPerson, 
      contactEmail, 
      contactPhone, 
      address, 
      isActive 
    } = req.body;
    
    const [result] = await pool.query(
      `UPDATE suppliers 
       SET supplier_name = ?, contact_person = ?, contact_email = ?, 
           contact_phone = ?, address = ?, is_active = ?
       WHERE id = ?`,
      [supplierName, contactPerson, contactEmail, contactPhone, address, isActive, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_items WHERE supplier_id = ?',
      [req.params.id]
    );
    
    const [result] = await pool.query(
      'DELETE FROM suppliers WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ 
      message: 'Supplier deleted successfully',
      itemsAffected: items[0].count
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT 
        t.*,
        i.item_name as itemName,
        u.name as userName,
        u.role as userRole,
        DATE_FORMAT(t.timestamp, '%m/%d/%Y %h:%i %p') as timestamp
      FROM stock_transactions t
      JOIN inventory_items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.timestamp DESC
    `);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { 
      itemId, 
      transactionType, 
      quantity, 
      reason, 
      userId, 
      stockBefore, 
      stockAfter 
    } = req.body;
    
    console.log('📥 Transaction request:', {
      itemId,
      transactionType,
      quantity,
      reason,
      userId,
      stockBefore,
      stockAfter
    });
    
    await connection.query(
      `INSERT INTO stock_transactions 
       (item_id, transaction_type, quantity, reason, user_id, stock_before, stock_after) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [itemId, transactionType, quantity, reason, userId, stockBefore, stockAfter]
    );
    
    await connection.query(
      'UPDATE inventory_items SET quantity = ? WHERE id = ?',
      [stockAfter, itemId]
    );
    
    if (transactionType === 'OUT' && reason === 'Damaged/Discarded') {
      console.log('🔴 Damaged item detected! Creating entry...');
      
      const [item] = await connection.query(
        'SELECT * FROM inventory_items WHERE id = ?',
        [itemId]
      );
      
      if (item.length > 0) {
        console.log('✅ Item found, inserting into damaged_items table');
        
        const result = await connection.query(
          `INSERT INTO damaged_items 
           (item_id, quantity, reason, status, date_damaged) 
           VALUES (?, ?, ?, 'Standby', CURDATE())`,
          [itemId, quantity, reason]
        );
        
        console.log('✅ Damaged item created with ID:', result[0].insertId);
      } else {
        console.error('❌ Item not found with ID:', itemId);
      }
    }
    
    await connection.commit();
    console.log('✅ Transaction completed successfully');
    res.json({ message: 'Transaction recorded successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction error:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  } finally {
    connection.release();
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const [appointments] = await pool.query(`
      SELECT 
        a.*,
        s.supplier_name as supplierName,
        u.name as scheduledBy,
        DATE_FORMAT(a.scheduled_date, '%m/%d/%Y %h:%i %p') as scheduledDate,
        DATE_FORMAT(a.last_updated, '%m/%d/%Y %h:%i %p') as lastUpdated
      FROM appointments a
      JOIN suppliers s ON a.supplier_id = s.id
      JOIN users u ON a.scheduled_by_user_id = u.id
      ORDER BY a.date, a.time
    `);
    
    for (let appointment of appointments) {
      const [items] = await pool.query(`
        SELECT 
          ai.quantity,
          i.id as itemId,
          i.item_name as itemName
        FROM appointment_items ai
        JOIN inventory_items i ON ai.item_id = i.id
        WHERE ai.appointment_id = ?
      `, [appointment.id]);
      
      appointment.items = items;
    }
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { 
      supplierId, 
      date, 
      time, 
      status, 
      notes, 
      scheduledByUserId, 
      items 
    } = req.body;
    
    const [result] = await connection.query(
      `INSERT INTO appointments 
       (supplier_id, date, time, status, notes, scheduled_by_user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [supplierId, date, time, status, notes, scheduledByUserId]
    );
    
    const appointmentId = result.insertId;
    
    for (const item of items) {
      await connection.query(
        'INSERT INTO appointment_items (appointment_id, item_id, quantity) VALUES (?, ?, ?)',
        [appointmentId, item.itemId, item.quantity]
      );
    }
    
    await connection.commit();
    res.json({ 
      id: appointmentId,
      message: 'Appointment scheduled successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding appointment:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { 
      supplierId, 
      date, 
      time, 
      status, 
      notes, 
      items 
    } = req.body;
    
    await connection.query(
      `UPDATE appointments 
       SET supplier_id = ?, date = ?, time = ?, status = ?, notes = ?
       WHERE id = ?`,
      [supplierId, date, time, status, notes, req.params.id]
    );
    
    await connection.query(
      'DELETE FROM appointment_items WHERE appointment_id = ?',
      [req.params.id]
    );
    
    for (const item of items) {
      await connection.query(
        'INSERT INTO appointment_items (appointment_id, item_id, quantity) VALUES (?, ?, ?)',
        [req.params.id, item.itemId, item.quantity]
      );
    }
    
    await connection.commit();
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

app.post('/api/appointments/:id/complete', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { userId } = req.body;
    
    const [appointments] = await connection.query(
      'SELECT * FROM appointments WHERE id = ?',
      [req.params.id]
    );
    
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appointment = appointments[0];
    
    const [items] = await connection.query(
      'SELECT * FROM appointment_items WHERE appointment_id = ?',
      [req.params.id]
    );
    
    for (const item of items) {
      const [inventory] = await connection.query(
        'SELECT quantity FROM inventory_items WHERE id = ?',
        [item.item_id]
      );
      
      const currentQty = inventory[0].quantity;
      const newQty = currentQty + item.quantity;
      
      await connection.query(
        'UPDATE inventory_items SET quantity = ?, supplier_id = ? WHERE id = ?',
        [newQty, appointment.supplier_id, item.item_id]
      );
      
      await connection.query(
        `INSERT INTO stock_transactions 
         (item_id, transaction_type, quantity, reason, user_id, stock_before, stock_after) 
         VALUES (?, 'IN', ?, ?, ?, ?, ?)`,
        [item.item_id, item.quantity, 'Restock from appointment', userId, currentQty, newQty]
      );
    }
    
    await connection.query(
      'UPDATE appointments SET status = "completed" WHERE id = ?',
      [req.params.id]
    );
    
    await connection.commit();
    res.json({ message: 'Appointment completed and inventory updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Error completing appointment:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

app.post('/api/appointments/:id/cancel', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE appointments SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/damaged-items', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        d.*,
        i.item_name as itemName,
        l.location_name as location,
        i.price
      FROM damaged_items d
      JOIN inventory_items i ON d.item_id = i.id
      LEFT JOIN locations l ON i.location_id = l.id
      ORDER BY d.date_damaged DESC
    `);
    res.json(items);
  } catch (error) {
    console.error('Error fetching damaged items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/damaged-items/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const [result] = await pool.query(
      'UPDATE damaged_items SET status = ?, notes = ? WHERE id = ?',
      [status, notes, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Damaged item not found' });
    }
    
    res.json({ message: 'Damaged item updated successfully' });
  } catch (error) {
    console.error('Error updating damaged item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/damaged-items/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM damaged_items WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Damaged item not found' });
    }
    
    res.json({ message: 'Damaged item removed successfully' });
  } catch (error) {
    console.error('Error removing damaged item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/activity-logs', async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT 
        a.*,
        u.name as userName,
        u.role as userRole,
        DATE_FORMAT(a.timestamp, '%m/%d/%Y %h:%i %p') as timestamp
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.timestamp DESC
    `);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/activity-logs', async (req, res) => {
  try {
    const { itemName, action, userId, details } = req.body;
    
    console.log('📥 Backend: Adding activity log:', {
      itemName,
      action,
      userId,
      details
    });
    
    const [result] = await pool.query(
      'INSERT INTO activity_logs (item_name, action, user_id, details) VALUES (?, ?, ?, ?)',
      [itemName, action, userId, details]
    );
    
    console.log('✅ Backend: Activity log saved with ID:', result.insertId);
    
    res.json({ 
      message: 'Activity logged successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('❌ Backend: Error adding activity log:', error);
    console.error('❌ SQL Error:', error.sqlMessage);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

app.get('/api/low-stock-items', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        i.*,
        c.category_name as category,
        l.location_name as location,
        s.supplier_name as supplier
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.quantity <= i.reorder_level
      ORDER BY i.quantity ASC
    `);
    res.json(items);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/low-stock-alerts/pending', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        i.*,
        c.category_name as category,
        l.location_name as location,
        s.supplier_name as supplier
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN low_stock_alerts lsa ON i.id = lsa.item_id
      WHERE i.quantity <= i.reorder_level 
        AND lsa.id IS NULL
      ORDER BY i.quantity ASC
    `);
    res.json(items);
  } catch (error) {
    console.error('Error fetching pending alerts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/low-stock-alerts/:itemId', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO low_stock_alerts (item_id) VALUES (?)',
      [req.params.itemId]
    );
    
    res.json({ message: 'Low stock alert marked as sent' });
  } catch (error) {
    console.error('Error marking alert as sent:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/low-stock-alerts/:itemId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM low_stock_alerts WHERE item_id = ?',
      [req.params.itemId]
    );
    
    res.json({ message: 'Low stock alert cleared' });
  } catch (error) {
    console.error('Error clearing alert:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [totalItems] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_items'
    );
    
    const [lowStock] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= reorder_level'
    );
    
    const [damaged] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_items WHERE damaged_status = "Damaged"'
    );
    
    const [totalValue] = await pool.query(
      'SELECT SUM(quantity * price) as total FROM inventory_items'
    );
    
    const [totalIn] = await pool.query(
      'SELECT SUM(quantity) as total FROM stock_transactions WHERE transaction_type = "IN"'
    );
    
    const [totalOut] = await pool.query(
      'SELECT SUM(quantity) as total FROM stock_transactions WHERE transaction_type = "OUT"'
    );
    
    const [upcomingAppointments] = await pool.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE date >= CURDATE() 
       AND status IN ('pending', 'confirmed')`
    );
    
    res.json({
      totalItems: totalItems[0].count,
      lowStockItems: lowStock[0].count,
      damagedItems: damaged[0].count,
      totalValue: totalValue[0].total || 0,
      totalIn: totalIn[0].total || 0,
      totalOut: totalOut[0].total || 0,
      upcomingAppointments: upcomingAppointments[0].count
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports/activity-logs', async (req, res) => {
  try {
    const { action, month, year } = req.query;
    
    let query = `
      SELECT 
        a.*,
        u.name as userName,
        u.role as userRole,
        DATE_FORMAT(a.timestamp, '%m/%d/%Y %h:%i %p') as timestamp
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (action && action !== 'all') {
      query += ' AND a.action = ?';
      params.push(action);
    }
    
    if (month && month !== 'all') {
      query += ' AND MONTH(a.timestamp) = ?';
      params.push(parseInt(month));
    }
    
    if (year && year !== 'all') {
      query += ' AND YEAR(a.timestamp) = ?';
      params.push(parseInt(year));
    }
    
    query += ' ORDER BY a.timestamp DESC';
    
    const [logs] = await pool.query(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports/inventory', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        i.*,
        c.category_name as category,
        l.location_name as location,
        s.supplier_name as supplier,
        (i.quantity * i.price) as total_value
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      ORDER BY i.item_name
    `);
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports/transactions', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let query = `
      SELECT 
        t.*,
        i.item_name as itemName,
        u.name as userName,
        u.role as userRole,
        DATE_FORMAT(t.timestamp, '%m/%d/%Y %h:%i %p') as timestamp
      FROM stock_transactions t
      JOIN inventory_items i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND DATE(t.timestamp) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(t.timestamp) <= ?';
      params.push(endDate);
    }
    
    if (type && type !== 'all') {
      query += ' AND t.transaction_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY t.timestamp DESC';
    
    const [transactions] = await pool.query(query, params);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});