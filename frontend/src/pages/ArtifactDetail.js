import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { 
  Card, 
  Descriptions, 
  Tag, 
  Button, 
  Space, 
  message, 
  Typography, 
  Row, 
  Col, 
  Divider,
  Spin,
  Image
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  BankOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TagOutlined,
  ExperimentOutlined,
  ArrowsAltOutlined,
  PoundOutlined,
  SafetyCertificateOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { artifactService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ArtifactForm from '../components/ArtifactForm';  // 修改为正确路径

const { Title, Text, Paragraph } = Typography;

const ArtifactDetail = () => {
  const { id } = useParams();
  // ✅ 这里已经声明了 navigate 变量，这就是“在组件中添加 navigate”的核心
  const navigate = useNavigate(); 
  const { user, canEditArtifacts } = useAuth();
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchArtifactDetail();
  }, [id]);

  const fetchArtifactDetail = async () => {
    setLoading(true);
    try {
      const response = await artifactService.getArtifactById(id);
      setArtifact(response.data);
    } catch (error) {
      message.error('获取文物详情失败');
      navigate('/artifacts');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 修改后的 handleEdit 函数，使用已声明的 navigate 跳转到编辑页
  const handleEdit = () => {
    navigate(`/artifacts/edit/${id}`); // 跳转到带文物 ID 的编辑页面
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await artifactService.deleteArtifact(id);
      message.success('删除成功');
      navigate('/artifacts');
    } catch (error) {
      message.error('删除失败');
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate('/artifacts');
  };

  // 以下代码保持不变...
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="加载文物信息..." />
      </div>
    );
  }

  if (!artifact) return null;

  const getValueLevelColor = (level) => {
    const colors = {
      '一级': 'red',
      '二级': 'orange',
      '三级': 'green',
      '一般': 'blue'
    };
    return colors[level] || 'default';
  };

  const getPreservationColor = (status) => {
    const colors = {
      '完好': 'success',
      '轻度损坏': 'warning',
      '中度损坏': 'orange',
      '严重损坏': 'error',
      '修复中': 'processing'
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
        {canEditArtifacts() && (
          <>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              编辑
            </Button>
            {user?.role === 'admin' && (
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleDelete}
                loading={deleting}
              >
                删除
              </Button>
            )}
          </>
        )}
      </Space>

      <Card loading={loading}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: 350,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                marginBottom: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                {artifact.image_url ? (
                  <Image
                    src={artifact.image_url}
                    alt={artifact.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    preview={false}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <BankOutlined style={{ fontSize: 64, color: '#999', marginBottom: 16 }} />
                    <Text type="secondary" style={{ display: 'block' }}>暂无图片</Text>
                  </div>
                )}
              </div>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Tag 
                  color={artifact.available_amount > 0 ? 'success' : 'error'} 
                  style={{ 
                    fontSize: 16, 
                    padding: '8px 20px',
                    borderRadius: 20
                  }}
                >
                  {artifact.available_amount > 0 ? '可展示' : '不可展示'}
                </Tag>
                
                <div style={{ 
                  background: '#f6f6f6', 
                  padding: 16, 
                  borderRadius: 8,
                  textAlign: 'left'
                }}>
                  <Space direction="vertical" size={4}>
                    <Text strong>库存信息</Text>
                    <Text type="secondary">
                      总数量: <Text strong style={{ fontSize: 16, marginLeft: 8 }}>{artifact.total_amount}</Text>
                    </Text>
                    <Text type="secondary">
                      可展示数量: 
                      <Text 
                        strong 
                        style={{ 
                          fontSize: 16, 
                          marginLeft: 8,
                          color: artifact.available_amount > 0 ? '#52c41a' : '#ff4d4f'
                        }}
                      >
                        {artifact.available_amount}
                      </Text>
                    </Text>
                    <Text type="secondary">
                      借展/修复中: 
                      <Text strong style={{ fontSize: 16, marginLeft: 8 }}>{artifact.total_amount - artifact.available_amount}</Text>
                    </Text>
                  </Space>
                </div>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <div style={{ marginBottom: 24 }}>
              <Title level={2} style={{ marginBottom: 8 }}>{artifact.name}</Title>
              <Space size="middle" style={{ marginBottom: 16 }}>
                <Tag color="blue" icon={<TagOutlined />}>
                  {artifact.artifact_code}
                </Tag>
                <Tag color="purple" icon={<CalendarOutlined />}>
                  {artifact.era}
                </Tag>
                <Tag color={getValueLevelColor(artifact.value_level)} icon={<SafetyCertificateOutlined />}>
                  {artifact.value_level}文物
                </Tag>
              </Space>
            </div>
            
            <Divider />
            
            <Descriptions 
              column={2} 
              bordered 
              size="middle"
              style={{ marginBottom: 24 }}
              labelStyle={{ 
                background: '#fafafa', 
                fontWeight: 'bold',
                width: '25%'
              }}
            >
              <Descriptions.Item 
                label={
                  <Space>
                    <BankOutlined />
                    <span>文物类别</span>
                  </Space>
                }
              >
                {artifact.category || '未分类'}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <ExperimentOutlined />
                    <span>材质</span>
                  </Space>
                }
              >
                {artifact.material || '未知'}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <ArrowsAltOutlined />
                    <span>尺寸</span>
                  </Space>
                }
              >
                {artifact.size || '未记录'}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <PoundOutlined />
                    <span>重量</span>
                  </Space>
                }
              >
                {artifact.weight ? `${artifact.weight} 克` : '未记录'}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>发现地点</span>
                  </Space>
                }
                span={2}
              >
                {artifact.discovery_place || '未知'}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>发现日期</span>
                  </Space>
                }
              >
                {artifact.discovery_date ? new Date(artifact.discovery_date).toLocaleDateString('zh-CN') : '未知'}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <EyeOutlined />
                    <span>保存状况</span>
                  </Space>
                }
              >
                <Tag color={getPreservationColor(artifact.preservation_status)}>
                  {artifact.preservation_status}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>存放位置</span>
                  </Space>
                }
              >
                <Tag color="green">{artifact.location}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={
                  <Space>
                    <TagOutlined />
                    <span>来源</span>
                  </Space>
                }
              >
                {artifact.source || '未知'}
              </Descriptions.Item>
            </Descriptions>
            
            {artifact.description && (
              <>
                <Divider orientation="left">
                  <Title level={5} style={{ margin: 0 }}>文物描述</Title>
                </Divider>
                <Paragraph style={{ 
                  lineHeight: 1.8, 
                  whiteSpace: 'pre-line',
                  fontSize: 15,
                  padding: '16px 24px',
                  background: '#fafafa',
                  borderRadius: 8
                }}>
                  {artifact.description}
                </Paragraph>
              </>
            )}
            
            <Divider orientation="left">
              <Title level={5} style={{ margin: 0 }}>其他信息</Title>
            </Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">
                入库时间: {new Date(artifact.created_at).toLocaleString('zh-CN')}
              </Text>
              <Text type="secondary">
                最后更新: {new Date(artifact.updated_at).toLocaleString('zh-CN')}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ArtifactDetail;