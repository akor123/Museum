const db = require('../config/db');

class Artifact {
  static async findAll({ 
    page = 1, 
    limit = 10, 
    search = '', 
    category = '', 
    era = '', 
    value_level = '',
    preservation_status = '',
    available_min = '',
    available_amount = ''
  }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM artifacts WHERE 1=1';
    let params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR artifact_code LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (era) {
      query += ' AND era = ?';
      params.push(era);
    }
    
    // 新增：按价值等级过滤
    if (value_level) {
      query += ' AND value_level = ?';
      params.push(value_level);
    }
    
    // 新增：按保存状况过滤
    if (preservation_status) {
      query += ' AND preservation_status = ?';
      params.push(preservation_status);
    }
    
    // 新增：按最小可展示数量过滤
    if (available_min !== '') {
      query += ' AND available_amount >= ?';
      params.push(parseInt(available_min));
    }
    
    // 新增：按特定可展示数量过滤
    if (available_amount !== '') {
      query += ' AND available_amount = ?';
      params.push(parseInt(available_amount));
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [rows] = await db.query(query, params);
    
    // 获取总数（包含过滤条件）
    let countQuery = 'SELECT COUNT(*) as total FROM artifacts WHERE 1=1';
    let countParams = [];
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR artifact_code LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    if (era) {
      countQuery += ' AND era = ?';
      countParams.push(era);
    }
    
    if (value_level) {
      countQuery += ' AND value_level = ?';
      countParams.push(value_level);
    }
    
    if (preservation_status) {
      countQuery += ' AND preservation_status = ?';
      countParams.push(preservation_status);
    }
    
    if (available_min !== '') {
      countQuery += ' AND available_amount >= ?';
      countParams.push(parseInt(available_min));
    }
    
    if (available_amount !== '') {
      countQuery += ' AND available_amount = ?';
      countParams.push(parseInt(available_amount));
    }
    
    const [countRows] = await db.query(countQuery, countParams);
    
    return {
      artifacts: rows,
      total: countRows[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM artifacts WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByCode(code) {
    const [rows] = await db.query('SELECT * FROM artifacts WHERE artifact_code = ?', [code]);
    return rows[0];
  }

  static async create(artifactData) {
    const {
      artifact_code, name, era, category, material, size, weight,
      discovery_place, discovery_date, source, value_level,
      preservation_status, location, description, image_url,
      total_amount, available_amount
    } = artifactData;
    
    // 自动逻辑：如果文物状态为修复中，可展示数量强制为0
    let finalAvailableAmount = available_amount || 0;
    let finalPreservationStatus = preservation_status || '完好';
    
    // 业务规则1：如果保存状况是"修复中"，则available_amount必须为0
    if (finalPreservationStatus === '修复中') {
      finalAvailableAmount = 0;
      console.log(`文物 ${artifact_code} 状态为修复中，自动设置可展示数量为0`);
    }
    
    // 业务规则2：确保available_amount不超过total_amount
    const finalTotalAmount = total_amount || 1;
    if (finalAvailableAmount > finalTotalAmount) {
      finalAvailableAmount = finalTotalAmount;
      console.log(`文物 ${artifact_code} 可展示数量超过总数量，自动调整为总数量`);
    }
    
    // 业务规则3：确保available_amount不小于0
    if (finalAvailableAmount < 0) {
      finalAvailableAmount = 0;
      console.log(`文物 ${artifact_code} 可展示数量为负数，自动调整为0`);
    }
    
    console.log('创建文物参数:', {
      编号: artifact_code,
      名称: name,
      保存状况: finalPreservationStatus,
      总数量: finalTotalAmount,
      可展示数量: finalAvailableAmount
    });
    
    const [result] = await db.query(
      `INSERT INTO artifacts (
        artifact_code, name, era, category, material, size, weight,
        discovery_place, discovery_date, source, value_level,
        preservation_status, location, description, image_url,
        total_amount, available_amount, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        artifact_code, name, era, category, material, size, weight,
        discovery_place, discovery_date, source, value_level,
        finalPreservationStatus, location, description, image_url,
        finalTotalAmount, finalAvailableAmount
      ]
    );
    
    console.log(`文物 ${artifact_code} 创建成功，ID: ${result.insertId}`);
    return this.findById(result.insertId);
  }

  static async update(id, artifactData) {
    // 首先获取当前文物信息
    const currentArtifact = await this.findById(id);
    if (!currentArtifact) {
      throw new Error('文物不存在');
    }
    
    console.log('更新文物 - 当前信息:', {
      id,
      当前保存状况: currentArtifact.preservation_status,
      当前可展示数量: currentArtifact.available_amount,
      更新数据: artifactData
    });
    
    const fields = [];
    const values = [];
    
    // 处理保存状况和可用数量的业务逻辑
    let finalPreservationStatus = artifactData.preservation_status !== undefined 
      ? artifactData.preservation_status 
      : currentArtifact.preservation_status;
    
    let finalAvailableAmount = artifactData.available_amount !== undefined 
      ? artifactData.available_amount 
      : currentArtifact.available_amount;
    
    let finalTotalAmount = artifactData.total_amount !== undefined 
      ? artifactData.total_amount 
      : currentArtifact.total_amount;
    
    // 业务规则1：如果保存状况改为"修复中"，则available_amount强制设为0
    if (finalPreservationStatus === '修复中') {
      finalAvailableAmount = 0;
      console.log(`文物ID ${id} 状态改为修复中，自动设置可展示数量为0`);
      
      // 确保更新数据中包含调整后的值
      artifactData.available_amount = 0;
    }
    
    // 业务规则2：如果保存状况从"修复中"改为其他状态，并且可用数量为0
    // 可以提示用户需要手动设置可用数量，这里我们保持0
    if (currentArtifact.preservation_status === '修复中' && 
        finalPreservationStatus !== '修复中' && 
        finalAvailableAmount === 0) {
      console.log(`文物ID ${id} 从修复中状态恢复，当前可展示数量为0，可能需要手动调整`);
    }
    
    // 业务规则3：确保available_amount不超过total_amount
    if (finalAvailableAmount > finalTotalAmount) {
      finalAvailableAmount = finalTotalAmount;
      console.log(`文物ID ${id} 可展示数量超过总数量，自动调整为总数量`);
      
      // 确保更新数据中包含调整后的值
      artifactData.available_amount = finalTotalAmount;
    }
    
    // 业务规则4：确保available_amount不小于0
    if (finalAvailableAmount < 0) {
      finalAvailableAmount = 0;
      console.log(`文物ID ${id} 可展示数量为负数，自动调整为0`);
      
      // 确保更新数据中包含调整后的值
      artifactData.available_amount = 0;
    }
    
    // 业务规则5：如果total_amount减少，确保available_amount不超过新的total_amount
    if (artifactData.total_amount !== undefined && 
        artifactData.total_amount < currentArtifact.total_amount) {
      if (finalAvailableAmount > finalTotalAmount) {
        finalAvailableAmount = finalTotalAmount;
        artifactData.available_amount = finalTotalAmount;
        console.log(`文物ID ${id} 总数量减少，可展示数量自动调整为新总数量`);
      }
    }
    
    // 构建更新字段
    Object.keys(artifactData).forEach(key => {
      if (artifactData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(artifactData[key]);
      }
    });
    
    if (fields.length === 0) {
      console.log('没有需要更新的字段');
      return currentArtifact;
    }
    
    // 添加更新时间戳
    fields.push('updated_at = NOW()');
    
    values.push(id);
    const query = `UPDATE artifacts SET ${fields.join(', ')} WHERE id = ?`;
    
    console.log('执行更新SQL:', query);
    console.log('更新参数:', values);
    
    const [result] = await db.query(query, values);
    
    if (result.affectedRows === 0) {
      throw new Error('更新失败，文物可能不存在');
    }
    
    console.log(`文物ID ${id} 更新成功，影响行数: ${result.affectedRows}`);
    
    // 返回更新后的文物信息
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM artifacts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getCategories() {
    const [rows] = await db.query('SELECT DISTINCT category FROM artifacts WHERE category IS NOT NULL ORDER BY category');
    return rows.map(row => row.category);
  }

  static async getEras() {
    const [rows] = await db.query('SELECT DISTINCT era FROM artifacts WHERE era IS NOT NULL ORDER BY era');
    return rows.map(row => row.era);
  }

  static async getStats() {
    try {
      // 获取总数量
      const [totalResult] = await db.query('SELECT COUNT(*) as total FROM artifacts');
      
      // 获取可展示数量（available_amount > 0）
      const [availableResult] = await db.query('SELECT COUNT(*) as available FROM artifacts WHERE available_amount > 0');
      
      // 获取借展中数量（保存状况不是"修复中"且available_amount = 0）
      const [loanResult] = await db.query(`
        SELECT COUNT(*) as onLoan FROM artifacts 
        WHERE preservation_status != '修复中' 
        AND available_amount = 0
        AND total_amount > 0
      `);
      
      // 获取修复中数量
      const [restorationResult] = await db.query('SELECT COUNT(*) as underRestoration FROM artifacts WHERE preservation_status = ?', ['修复中']);
      
      // 获取分类数量
      const [categoriesResult] = await db.query('SELECT COUNT(DISTINCT category) as categories FROM artifacts WHERE category IS NOT NULL');
      
      // 获取价值等级统计
      const [valueLevelResult] = await db.query('SELECT value_level, COUNT(*) as count FROM artifacts GROUP BY value_level ORDER BY FIELD(value_level, "一级", "二级", "三级", "一般")');
      
      return {
        total: totalResult[0].total,
        available: availableResult[0].available,
        onLoan: loanResult[0].onLoan,
        underRestoration: restorationResult[0].underRestoration,
        categories: categoriesResult[0].categories,
        valueLevels: valueLevelResult
      };
    } catch (error) {
      console.error('获取统计信息错误:', error);
      throw error;
    }
  }
}

module.exports = Artifact;