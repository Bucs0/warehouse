const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('🔄 Starting comprehensive foreign key fix...\n');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });
    
    console.log('✅ Connected to database\n');
    
    // First, let's check what foreign keys exist
    console.log('🔍 Checking existing foreign keys...\n');
    
    const [fks] = await connection.query(`
      SELECT 
        kcu.TABLE_NAME,
        kcu.COLUMN_NAME,
        kcu.CONSTRAINT_NAME,
        rc.DELETE_RULE
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      WHERE kcu.TABLE_SCHEMA = ? AND kcu.REFERENCED_TABLE_NAME = 'users'
    `, [process.env.DB_NAME]);
    
    console.log('📋 Found foreign keys:');
    console.table(fks);
    console.log('');
    
    console.log('🔧 Applying comprehensive fix...\n');
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Disabled foreign key checks');
    
    // Drop existing constraints one by one
    for (const fk of fks) {
      try {
        await connection.query(`ALTER TABLE ${fk.TABLE_NAME} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        console.log(`✅ Dropped constraint: ${fk.CONSTRAINT_NAME} from ${fk.TABLE_NAME}`);
      } catch (err) {
        console.log(`⚠️  Warning dropping ${fk.CONSTRAINT_NAME}: ${err.message}`);
      }
    }
    
    // Make columns nullable
    console.log('\n📝 Making user_id columns nullable...');
    
    await connection.query('ALTER TABLE stock_transactions MODIFY COLUMN user_id INT NULL');
    console.log('✅ stock_transactions.user_id is now nullable');
    
    await connection.query('ALTER TABLE appointments MODIFY COLUMN scheduled_by_user_id INT NULL');
    console.log('✅ appointments.scheduled_by_user_id is now nullable');
    
    await connection.query('ALTER TABLE activity_logs MODIFY COLUMN user_id INT NULL');
    console.log('✅ activity_logs.user_id is now nullable');
    
    // Add new constraints with ON DELETE SET NULL
    console.log('\n🔗 Adding new foreign key constraints with ON DELETE SET NULL...');
    
    await connection.query(`
      ALTER TABLE stock_transactions 
      ADD CONSTRAINT fk_stock_transactions_user 
      FOREIGN KEY (user_id) REFERENCES users(id) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);
    console.log('✅ Added constraint to stock_transactions');
    
    await connection.query(`
      ALTER TABLE appointments 
      ADD CONSTRAINT fk_appointments_user 
      FOREIGN KEY (scheduled_by_user_id) REFERENCES users(id) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);
    console.log('✅ Added constraint to appointments');
    
    await connection.query(`
      ALTER TABLE activity_logs 
      ADD CONSTRAINT fk_activity_logs_user 
      FOREIGN KEY (user_id) REFERENCES users(id) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);
    console.log('✅ Added constraint to activity_logs');
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Re-enabled foreign key checks');
    
    console.log('\n🔍 Verifying foreign keys after fix...\n');
    
    const [newFks] = await connection.query(`
      SELECT 
        kcu.TABLE_NAME,
        kcu.COLUMN_NAME,
        kcu.CONSTRAINT_NAME,
        rc.DELETE_RULE
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      WHERE kcu.TABLE_SCHEMA = ? AND kcu.REFERENCED_TABLE_NAME = 'users'
    `, [process.env.DB_NAME]);
    
    console.log('📋 Foreign keys after fix:');
    console.table(newFks);
    
    // Check if all are SET NULL
    const allSetNull = newFks.every(fk => fk.DELETE_RULE === 'SET NULL');
    
    if (allSetNull) {
      console.log('\n✅ SUCCESS! All foreign keys now have ON DELETE SET NULL');
      console.log('🎉 You can now delete user accounts!\n');
      console.log('Next steps:');
      console.log('1. Restart your backend server: node server.js');
      console.log('2. Try deleting Curze Furge again');
      console.log('3. It should work now! ✅\n');
    } else {
      console.log('\n⚠️  WARNING: Some foreign keys may still have issues');
      console.log('Please check the table above\n');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\n💡 TIP: You may need to run the SQL manually in MySQL Workbench');
    console.error('See the file: fix-all-foreign-keys.sql');
    process.exit(1);
  }
}

runMigration();
