-- 博物馆管理系统数据库脚本
CREATE DATABASE IF NOT EXISTS museum_management;
USE museum_management;

-- 文物/藏品表
CREATE TABLE artifacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artifact_code VARCHAR(50) UNIQUE NOT NULL COMMENT '文物编号',
    name VARCHAR(200) NOT NULL COMMENT '文物名称',
    era VARCHAR(100) NOT NULL COMMENT '年代',
    category VARCHAR(100) COMMENT '类别（青铜器、陶瓷、书画等）',
    material VARCHAR(100) COMMENT '材质',
    size VARCHAR(100) COMMENT '尺寸',
    weight DECIMAL(10, 2) COMMENT '重量（克）',
    discovery_place VARCHAR(200) COMMENT '发现地点',
    discovery_date DATE COMMENT '发现日期',
    source VARCHAR(200) COMMENT '来源（捐赠、考古发掘、购买等）',
    value_level ENUM('一级', '二级', '三级', '一般') DEFAULT '一般' COMMENT '价值等级',
    preservation_status ENUM('完好', '轻度损坏', '中度损坏', '严重损坏', '修复中') DEFAULT '完好' COMMENT '保存状况',
    location VARCHAR(100) NOT NULL COMMENT '存放位置',
    description TEXT COMMENT '文物描述',
    image_url VARCHAR(500) COMMENT '图片URL',
    total_amount INT DEFAULT 1 COMMENT '总数量',
    available_amount INT DEFAULT 1 COMMENT '可展示数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 展览表
CREATE TABLE exhibitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exhibition_code VARCHAR(50) UNIQUE NOT NULL COMMENT '展览编号',
    title VARCHAR(200) NOT NULL COMMENT '展览标题',
    theme VARCHAR(100) COMMENT '展览主题',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    location VARCHAR(100) NOT NULL COMMENT '展览地点',
    curator VARCHAR(100) COMMENT '策展人',
    description TEXT COMMENT '展览描述',
    status ENUM('筹备中', '进行中', '已结束', '暂停') DEFAULT '筹备中' COMMENT '展览状态',
    visitor_count INT DEFAULT 0 COMMENT '参观人数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 展览文物关联表
CREATE TABLE exhibition_artifacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exhibition_id INT NOT NULL,
    artifact_id INT NOT NULL,
    display_order INT COMMENT '展示顺序',
    display_location VARCHAR(100) COMMENT '在展览中的具体位置',
    notes TEXT COMMENT '备注',
    FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_exhibition_artifact (exhibition_id, artifact_id)
);

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    department VARCHAR(100) COMMENT '部门',
    position VARCHAR(100) COMMENT '职位',
    role ENUM('admin', 'curator', 'researcher', 'visitor') DEFAULT 'curator' COMMENT '角色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 借展/出借记录表
CREATE TABLE loan_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artifact_id INT NOT NULL,
    borrower VARCHAR(200) NOT NULL COMMENT '借展方',
    loan_date DATE NOT NULL COMMENT '借出日期',
    return_date DATE COMMENT '应归还日期',
    actual_return_date DATE COMMENT '实际归还日期',
    purpose TEXT COMMENT '借展目的',
    contact_person VARCHAR(100) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    status ENUM('申请中', '已批准', '已借出', '已归还', '逾期', '取消') DEFAULT '申请中',
    created_by INT COMMENT '创建人',
    notes TEXT COMMENT '备注',
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 修复记录表
CREATE TABLE restoration_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artifact_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    restorer VARCHAR(100) COMMENT '修复师',
    restoration_method TEXT COMMENT '修复方法',
    materials_used TEXT COMMENT '使用材料',
    cost DECIMAL(10, 2) COMMENT '修复费用',
    before_images TEXT COMMENT '修复前图片',
    after_images TEXT COMMENT '修复后图片',
    notes TEXT COMMENT '修复记录',
    status ENUM('进行中', '已完成', '暂停') DEFAULT '进行中',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE
);

-- 插入测试数据
INSERT INTO artifacts (artifact_code, name, era, category, material, size, weight, discovery_place, value_level, preservation_status, location, description, total_amount, available_amount) VALUES
('MW001', '青铜鼎', '商代', '青铜器', '青铜', '高58cm，口径50cm', 35000, '河南安阳', '一级', '完好', '一楼展厅A区01', '商代晚期青铜礼器，造型庄重，纹饰精美，具有重要历史价值。', 1, 1),
('MW002', '青花瓷瓶', '明代', '陶瓷', '瓷', '高45cm，口径12cm', 2800, '江西景德镇', '二级', '完好', '二楼陶瓷馆03', '明代宣德年间青花瓷，釉色莹润，纹饰为缠枝莲花纹。', 1, 1),
('MW003', '清明上河图（复制品）', '宋代', '书画', '绢本', '长528cm，宽24.8cm', 1500, '北京', '三级', '完好', '三楼书画厅05', '北宋张择端《清明上河图》精良复制品，展现了汴京繁荣景象。', 1, 1),
('MW004', '玉琮', '良渚文化', '玉器', '玉石', '高8.7cm，射径17.6cm', 6500, '浙江良渚', '一级', '轻度损坏', '修复室01', '新石器时代良渚文化玉琮，有轻微裂纹，正在进行修复。', 1, 0),
('MW005', '甲骨文', '商代', '骨器', '龟甲', '长12cm，宽8cm', 350, '河南安阳', '一级', '完好', '一楼展厅B区02', '刻有商代甲骨文的龟甲，文字清晰，具有重要文字学价值。', 10, 8);

-- 注意：密码是经过bcrypt加密的，默认密码都是 user123
INSERT INTO users (username, password, email, full_name, department, position, role) VALUES
('admin', '$2a$10$YbW3X5SJYjZ6v6kFqY8Q7eYvJN9mBcDfGhJkLpQrStUvWxYzAbCdEf', 'admin@museum.com', '系统管理员', '信息技术部', '系统管理员', 'admin'),
('curator1', '$2a$10$YbW3X5SJYjZ6v6kFqY8Q7eYvJN9mBcDfGhJkLpQrStUvWxYzAbCdEf', 'curator1@museum.com', '张策展', '展览部', '首席策展人', 'curator'),
('researcher1', '$2a$10$YbW3X5SJYjZ6v6kFqY8Q7eYvJN9mBcDfGhJkLpQrStUvWxYzAbCdEf', 'researcher1@museum.com', '李研究', '研究部', '研究员', 'researcher');

INSERT INTO exhibitions (exhibition_code, title, theme, start_date, end_date, location, curator, description, status) VALUES
('EX2024001', '青铜文明展', '青铜器', '2024-01-15', '2024-06-15', '一楼展厅A区', '张策展', '展示商周时期青铜器的制作工艺和文化内涵。', '进行中'),
('EX2024002', '明清瓷器精品展', '瓷器', '2024-03-01', '2024-09-01', '二楼陶瓷馆', '王策展', '集中展示明清两代的瓷器精品。', '筹备中');

-- 插入展览文物关联
INSERT INTO exhibition_artifacts (exhibition_id, artifact_id, display_order, display_location) VALUES
(1, 1, 1, '展厅入口主展台'),
(2, 2, 1, '陶瓷馆中央展柜');

