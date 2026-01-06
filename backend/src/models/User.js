const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, username, email, full_name, department, position, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(userData) {
    const { username, password, email, full_name, department, position, role = 'curator' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO users (username, password, email, full_name, department, position, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email, full_name, department, position, role]
    );
    
    return this.findById(result.insertId);
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
