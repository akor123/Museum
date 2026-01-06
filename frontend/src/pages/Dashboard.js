import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Space, Tag, Progress, Button } from 'antd';
import { 
  BankOutlined,  // 博物馆图标
  EyeOutlined,   // 展示图标
  ClockCircleOutlined, 
  CheckCircleOutlined,
  TeamOutlined,
  FileDoneOutlined,
  SettingOutlined,
  TrophyOutlined,  // 价值等级图标
  UserOutlined,
  ToolOutlined,    // 修复图标
  ArrowRightOutlined  // 添加箭头图标
} from '@ant-design/icons';
import { artifactService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    onLoan: 0,      // 借展中
    underRestoration: 0, // 修复中
    categories: 0,
    valueLevels: []
  });
  
  const [recentArtifacts, setRecentArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取统计数据
      const statsResponse = await artifactService.getStats();
      
      // ✅ 直接使用API返回的数据
      const apiStats = statsResponse.data;
      
      // 更新统计数据
      setStats({
        total: apiStats.total || 0,
        available: apiStats.available || 0,
        onLoan: apiStats.onLoan || 0,
        underRestoration: apiStats.underRestoration || 0,
        categories: apiStats.categories || 0,
        valueLevels: apiStats.valueLevels || []
      });
      
      // 获取最近添加的文物
      const artifactsResponse = await artifactService.getAllArtifacts({ limit: 100 });
      const artifacts = artifactsResponse.data.artifacts || [];
      
      // 获取最近添加的文物（按创建时间排序，取前5条）
      const sortedArtifacts = [...artifacts]
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentArtifacts(sortedArtifacts);
      
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      // 出错时重置统计数据
      setStats({
        total: 0,
        available: 0,
        onLoan: 0,
        underRestoration: 0,
        categories: 0,
        valueLevels: []
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '文物编号',
      dataIndex: 'artifact_code',
      key: 'artifact_code',
      render: (text) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {text}
        </Tag>
      )
    },
    {
      title: '文物名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Button 
            type="link" 
            onClick={() => navigate(`/artifacts/${record.id}`)}
            style={{ padding: 0, textAlign: 'left', fontWeight: 'bold' }}
          >
            {text}
          </Button>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.era} • {record.category}</Text>
        </Space>
      )
    },
    {
      title: '价值等级',
      dataIndex: 'value_level',
      key: 'value_level',
      render: (level) => {
        const colors = {
          '一级': 'red',
          '二级': 'orange',
          '三级': 'green',
          '一般': 'blue'
        };
        return <Tag color={colors[level] || 'default'}>{level}</Tag>;
      }
    },
    {
      title: '保存状况',
      dataIndex: 'preservation_status',
      key: 'preservation_status',
      render: (status) => {
        const colors = {
          '完好': 'success',
          '轻度损坏': 'warning',
          '中度损坏': 'orange',
          '严重损坏': 'error',
          '修复中': 'processing'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: '库存状态',
      key: 'status',
      render: (_, record) => {
        const total = Number(record.total_amount) || 0;
        const available = Number(record.available_amount) || 0;
        const percentage = total > 0 ? (available / total) * 100 : 0;
        
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Progress 
              percent={percentage.toFixed(0)} 
              size="small" 
              status={available > 0 ? 'success' : 'exception'}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {available}/{total} 件
            </Text>
          </Space>
        );
      }
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  // 处理点击统计卡片
  const handleStatisticClick = (type, filter = {}) => {
    let queryString = '';
    if (Object.keys(filter).length > 0) {
      const params = new URLSearchParams(filter);
      queryString = `?${params.toString()}`;
    }
    navigate(`/artifacts${queryString}`);
  };

  // 处理点击价值等级卡片 - 修复：正确传递value_level参数
  const handleValueLevelClick = (level) => {
    navigate(`/artifacts?value_level=${encodeURIComponent(level)}`);
  };

  // 可点击的统计卡片组件
  const ClickableStatisticCard = ({ title, value, icon, color, onClick, extra }) => {
    return (
      <Card 
        hoverable 
        onClick={onClick}
        style={{ 
          cursor: 'pointer',
          transition: 'all 0.3s',
          height: '100%'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: color, marginRight: 8 }}>{value}</span>
              {icon && React.createElement(icon, { style: { color: color, fontSize: 20 } })}
            </div>
            {extra && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{extra}</div>}
          </div>
          <ArrowRightOutlined style={{ color: '#d9d9d9', fontSize: 14 }} />
        </div>
      </Card>
    );
  };

  // 可点击的价值等级卡片
  const ClickableValueLevelCard = ({ level, count, color }) => {
    const levelText = level === '一级' ? '一级文物' : 
                     level === '二级' ? '二级文物' : 
                     level === '三级' ? '三级文物' : '一般文物';
    
    return (
      <Card 
        size="small"
        hoverable 
        onClick={() => handleValueLevelClick(level)}
        style={{ 
          cursor: 'pointer',
          transition: 'all 0.3s',
          height: '100%'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{levelText}</div>
            <div style={{ display: '-flex', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 'bold', color: color, marginRight: 8 }}>{count}</span>
              <TrophyOutlined style={{ color: color, fontSize: 16 }} />
            </div>
          </div>
          <ArrowRightOutlined style={{ color: '#d9d9d9', fontSize: 12 }} />
        </div>
      </Card>
    );
  };

  // 价值等级统计卡片
  const renderValueLevelCards = () => {
    return stats.valueLevels.map((item, index) => {
      const color = item.value_level === '一级' ? '#f5222d' : 
                    item.value_level === '二级' ? '#fa8c16' : 
                    item.value_level === '三级' ? '#52c41a' : '#1890ff';
      
      return (
        <Col xs={24} sm={12} md={6} key={index}>
          <ClickableValueLevelCard 
            level={item.value_level}
            count={item.count}
            color={color}
          />
        </Col>
      );
    });
  };

  // 计算借展中文物数量
  const calculateOnLoan = () => {
    return stats.total - stats.available;
  };

  // 计算修复中文物数量（从保存状况为"修复中"的文物统计）
  const calculateUnderRestoration = () => {
    return stats.underRestoration;
  };

  return (
    <div>
      <Title level={2}>博物馆管理仪表板</Title>
      <Text type="secondary">欢迎使用博物馆藏品管理系统</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <ClickableStatisticCard
            title="藏品总数"
            value={stats.total}
            icon={BankOutlined}
            color="#1890ff"
            onClick={() => handleStatisticClick('total')}
            extra="查看所有文物"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ClickableStatisticCard
            title="可展示藏品"
            value={stats.available}
            icon={EyeOutlined}
            color="#52c41a"
            onClick={() => handleStatisticClick('available', { available_min: 1 })}
            extra="可立即展示的文物"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ClickableStatisticCard
            title="借展中"
            value={calculateOnLoan()}
            icon={ClockCircleOutlined}
            color="#fa8c16"
            onClick={() => handleStatisticClick('onLoan', { available_amount: 0 })}
            extra="当前借出的文物"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ClickableStatisticCard
            title="修复中"
            value={calculateUnderRestoration()}
            icon={ToolOutlined}
            color="#722ed1"
            onClick={() => handleStatisticClick('restoration', { preservation_status: '修复中' })}
            extra="正在修复的文物"
          />
        </Col>
      </Row>
      
      {stats.valueLevels.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {renderValueLevelCards()}
        </Row>
      )}
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <span>最近入库文物</span>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => navigate('/artifacts')}
                  style={{ padding: 0 }}
                >
                  查看全部 <ArrowRightOutlined />
                </Button>
              </Space>
            } 
            loading={loading}
          >
            <Table
              columns={columns}
              dataSource={recentArtifacts}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="系统概览" loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>藏品展示率</Text>
                <Progress 
                  percent={stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0} 
                  status="active"
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  展示率: {stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(1) : 0}%
                </Text>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <Text strong>库存状态</Text>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  <Col span={8}>
                    <Card 
                      size="small" 
                      hoverable
                      onClick={() => navigate('/artifacts?available_min=1')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Statistic
                        title="可展示"
                        value={stats.available}
                        valueStyle={{ fontSize: 18, color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card 
                      size="small" 
                      hoverable
                      onClick={() => navigate('/artifacts?available_amount=0')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Statistic
                        title="借展中"
                        value={calculateOnLoan()}
                        valueStyle={{ fontSize: 18, color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card 
                      size="small" 
                      hoverable
                      onClick={() => navigate('/artifacts?preservation_status=修复中')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Statistic
                        title="修复中"
                        value={calculateUnderRestoration()}
                        valueStyle={{ fontSize: 18, color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <Text strong>今日提醒</Text>
                <div style={{ 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: 6,
                  padding: 12,
                  marginTop: 8
                }}>
                  <Space direction="vertical" size={4}>
                    <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />系统运行正常</Text>
                    <Text><FileDoneOutlined style={{ color: '#1890ff', marginRight: 8 }} />所有功能可用</Text>
                    <Text><TeamOutlined style={{ color: '#722ed1', marginRight: 8 }} />当前在线用户: 1</Text>
                  </Space>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      <Card title="快速操作" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card 
              hoverable 
              onClick={() => handleNavigate('/artifacts')} 
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <BankOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 12 }} />
              <Title level={5}>文物管理</Title>
              <Text type="secondary">管理博物馆藏品</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card 
              hoverable 
              onClick={() => handleNavigate('/profile')} 
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <UserOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 12 }} />
              <Title level={5}>个人资料</Title>
              <Text type="secondary">查看个人信息</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card 
              hoverable 
              onClick={() => handleNavigate('/settings')} 
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <SettingOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 12 }} />
              <Title level={5}>系统设置</Title>
              <Text type="secondary">配置系统参数</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card 
              hoverable 
              onClick={fetchDashboardData} 
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <CheckCircleOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 12 }} />
              <Title level={5}>刷新数据</Title>
              <Text type="secondary">更新仪表板信息</Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;