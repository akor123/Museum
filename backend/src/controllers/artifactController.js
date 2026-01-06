const Artifact = require('../models/Artifact');
const db = require('../config/db'); // 需要导入db

exports.getAllArtifacts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      era = '', 
      value_level = '',
      preservation_status = '',
      available_min = '',
      available_amount = ''
    } = req.query;
    
    console.log('获取文物列表参数:', {
      page, limit, search, category, era, value_level, 
      preservation_status, available_min, available_amount
    });
    
    const result = await Artifact.findAll({ 
      page, 
      limit, 
      search, 
      category, 
      era,
      value_level,
      preservation_status,
      available_min,
      available_amount
    });
    
    console.log('查询结果:', {
      文物数量: result.artifacts.length,
      总数: result.total,
      当前页: result.page
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取文物列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误: ' + error.message
    });
  }
};

exports.getArtifactById = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: '文物不存在'
      });
    }
    res.json({
      success: true,
      data: artifact
    });
  } catch (error) {
    console.error('获取文物详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

exports.createArtifact = async (req, res) => {
  try {
    // 检查文物编号是否已存在
    const existingArtifact = await Artifact.findByCode(req.body.artifact_code);
    if (existingArtifact) {
      return res.status(400).json({
        success: false,
        message: '文物编号已存在'
      });
    }
    
    const artifact = await Artifact.create(req.body);
    res.status(201).json({
      success: true,
      data: artifact,
      message: '文物添加成功'
    });
  } catch (error) {
    console.error('添加文物错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

exports.updateArtifact = async (req, res) => {
  try {
    // 1. 验证请求参数
    const artifactId = req.params.id;
    const updateData = req.body;
    
    // 检查更新数据是否为空
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '更新数据不能为空'
      });
    }

    // 2. 检查文物是否存在
    const existingArtifact = await Artifact.findById(artifactId);
    if (!existingArtifact) {
      return res.status(404).json({
        success: false,
        message: '文物不存在'
      });
    }

    // 3. 如果更新文物编号，检查是否与其他文物重复
    if (updateData.artifact_code && updateData.artifact_code !== existingArtifact.artifact_code) {
      const artifactWithSameCode = await Artifact.findByCode(updateData.artifact_code);
      if (artifactWithSameCode) {
        return res.status(400).json({
          success: false,
          message: '文物编号已存在，无法更新'
        });
      }
    }

    // 4. 执行更新操作
    const updatedArtifact = await Artifact.update(artifactId, updateData);
    
    // 5. 返回更新结果
    res.json({
      success: true,
      data: updatedArtifact,
      message: '文物更新成功'
    });
  } catch (error) {
    console.error('更新文物错误:', error);
    res.status(500).json({
      success: false,
      message: `服务器错误: ${error.message}`
    });
  }
};

exports.deleteArtifact = async (req, res) => {
  try {
    const deleted = await Artifact.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '文物不存在'
      });
    }
    res.json({
      success: true,
      message: '文物删除成功'
    });
  } catch (error) {
    console.error('删除文物错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Artifact.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

exports.getEras = async (req, res) => {
  try {
    const eras = await Artifact.getEras();
    res.json({
      success: true,
      data: eras
    });
  } catch (error) {
    console.error('获取年代错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    console.log('开始获取统计信息...');
    
    // 1. 获取文物总数（按文物记录数，不是按件数）
    const [totalResult] = await db.query('SELECT COUNT(*) as total FROM artifacts');
    const total = parseInt(totalResult[0].total) || 0;
    console.log('文物记录总数:', total);
    
    // 2. 获取可展示藏品（available_amount > 0 的文物）
    const [availableResult] = await db.query(
      'SELECT COUNT(*) as count FROM artifacts WHERE available_amount > 0'
    );
    const available = parseInt(availableResult[0].count) || 0;
    console.log('可展示文物数:', available);
    
    // 3. 获取修复中的文物（保存状况为"修复中"的文物）
    const [restorationResult] = await db.query(
      'SELECT COUNT(*) as count FROM artifacts WHERE preservation_status = "修复中"'
    );
    const underRestoration = parseInt(restorationResult[0].count) || 0;
    console.log('修复中文物数:', underRestoration);
    
    // 4. 获取借展中的文物（保存状况不是"修复中"且可展示数量为0的文物）
    const [loanResult] = await db.query(`
      SELECT COUNT(*) as count FROM artifacts 
      WHERE preservation_status != '修复中' 
      AND available_amount = 0
      AND total_amount > 0
    `);
    const onLoan = parseInt(loanResult[0].count) || 0;
    console.log('借展中文物数:', onLoan);
    
    // 5. 获取各等级文物数量
    const [valueLevelResult] = await db.query(
      'SELECT value_level, COUNT(*) as count FROM artifacts GROUP BY value_level'
    );
    console.log('等级统计:', valueLevelResult);
    
    // 6. 获取分类数量
    const [categoriesResult] = await db.query(
      'SELECT COUNT(DISTINCT category) as categories FROM artifacts WHERE category IS NOT NULL'
    );
    const categories = parseInt(categoriesResult[0].categories) || 0;
    
    // 7. 获取最近入库的文物（按创建时间倒序，取前5条）
    const [recentArtifacts] = await db.query(`
      SELECT 
        artifact_code,
        name,
        era,
        category,
        value_level,
        preservation_status,
        total_amount,
        available_amount,
        CONCAT(available_amount, '/', total_amount, ' 件') as inventory_status
      FROM artifacts 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('最终统计结果:', {
      total,
      available,
      onLoan,
      underRestoration,
      categories,
      valueLevels: valueLevelResult,
      recentArtifacts
    });
    
    res.json({
      success: true,
      data: {
        total,
        available,
        onLoan,
        underRestoration,
        categories,
        valueLevels: valueLevelResult,
        recentArtifacts
      }
    });
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
};