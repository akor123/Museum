const bcrypt = require('bcryptjs');
const db = require('../config/db');

class UserController {
  // 获取所有用户（排除密码字段）
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '', role = '' } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT id, username, email, full_name, department, position, role, created_at 
        FROM users 
        WHERE 1=1
      `;
      let params = [];
      
      if (search) {
        query += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      console.log('执行用户查询:', query, params);
      const [rows] = await db.query(query, params);
      
      // 获取总数
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      let countParams = [];
      
      if (search) {
        countQuery += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (role) {
        countQuery += ' AND role = ?';
        countParams.push(role);
      }
      
      const [countRows] = await db.query(countQuery, countParams);
      
      res.json({
        success: true,
        data: {
          users: rows,
          total: countRows[0].total,
          page: parseInt(page),
          totalPages: Math.ceil(countRows[0].total / limit)
        }
      });
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }

  // 创建用户
  async createUser(req, res) {
    try {
      const { username, password, email, full_name, department, position, role = 'curator' } = req.body;
      
      console.log('创建用户请求:', req.body);
      
      // 验证必填字段
      if (!username || !password || !email || !full_name) {
        return res.status(400).json({
          success: false,
          message: '用户名、密码、邮箱和姓名为必填项'
        });
      }
      
      // 检查用户名是否已存在
      const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
      
      // 检查邮箱是否已存在
      const [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: '邮箱已存在'
        });
      }
      
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 插入新用户
      const [result] = await db.query(
        'INSERT INTO users (username, password, email, full_name, department, position, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email, full_name, department || '', position || '', role]
      );
      
      // 获取新创建的用户（排除密码）
      const [newUser] = await db.query(
        'SELECT id, username, email, full_name, department, position, role, created_at FROM users WHERE id = ?',
        [result.insertId]
      );
      
      res.status(201).json({
        success: true,
        data: newUser[0],
        message: '用户创建成功'
      });
    } catch (error) {
      console.error('创建用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误: ' + error.message
      });
    }
  }

  // 获取单个用户信息
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const [users] = await db.query(
        'SELECT id, username, email, full_name, department, position, role, created_at FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      res.json({
        success: true,
        data: users[0]
      });
    } catch (error) {
      console.error('获取用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }

  // 更新用户信息
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { email, full_name, department, position, role, password } = req.body;
      
      console.log('更新用户请求:', id, req.body);
      
      // 检查用户是否存在
      const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      const existingUser = existingUsers[0];
      
      // 构建更新字段
      const updateFields = {};
      const updateValues = [];
      
      // 验证邮箱唯一性（如果修改了邮箱）
      if (email && email !== existingUser.email) {
        const [emailCheck] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
        if (emailCheck.length > 0) {
          return res.status(400).json({
            success: false,
            message: '邮箱已被其他用户使用'
          });
        }
        updateFields.email = email;
      }
      
      if (full_name !== undefined) updateFields.full_name = full_name;
      if (department !== undefined) updateFields.department = department;
      if (position !== undefined) updateFields.position = position;
      if (role !== undefined) updateFields.role = role;
      
      // 如果提供了新密码，则加密更新
      if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
      }
      
      // 如果没有更新字段
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有提供更新字段'
        });
      }
      
      // 构建更新SQL
      const setClause = Object.keys(updateFields)
        .map(key => {
          updateValues.push(updateFields[key]);
          return `${key} = ?`;
        })
        .join(', ');
      
      updateValues.push(id);
      
      const query = `UPDATE users SET ${setClause} WHERE id = ?`;
      await db.query(query, updateValues);
      
      // 获取更新后的用户信息
      const [updatedUser] = await db.query(
        'SELECT id, username, email, full_name, department, position, role, created_at FROM users WHERE id = ?',
        [id]
      );
      
      res.json({
        success: true,
        data: updatedUser[0],
        message: '用户信息更新成功'
      });
    } catch (error) {
      console.error('更新用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误: ' + error.message
      });
    }
  }

  // 删除用户
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      console.log('删除用户请求:', id, '操作用户:', req.user.id);
      
      // 不能删除自己
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: '不能删除自己的账户'
        });
      }
      
      // 检查用户是否存在
      const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      const existingUser = existingUsers[0];
      
      // 不能删除管理员账号（额外的保护）
      if (existingUser.username === 'admin') {
        return res.status(400).json({
          success: false,
          message: '不能删除系统管理员账号'
        });
      }
      
      // 删除用户
      await db.query('DELETE FROM users WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: '用户删除成功'
      });
    } catch (error) {
      console.error('删除用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }

  // 重置用户密码
  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      
      // 检查用户是否存在
      const [existingUsers] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      // 生成随机密码（生产环境中应该通过邮件发送）
      const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // 更新密码
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
      
      // 在生产环境中，这里应该发送邮件给用户，而不是直接返回密码
      res.json({
        success: true,
        data: {
          newPassword: randomPassword
        },
        message: '密码重置成功，新密码为：' + randomPassword
      });
    } catch (error) {
      console.error('重置密码错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
}

module.exports = new UserController();