import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, message, Typography, Spin, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, BankOutlined, EditOutlined } from '@ant-design/icons';
import { artifactService } from '../services/api';
import ArtifactForm from '../components/ArtifactForm';

const { Title } = Typography;

const EditArtifact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtifact();
  }, [id]);

  const fetchArtifact = async () => {
    setLoading(true);
    try {
      const response = await artifactService.getArtifactById(id);
      setArtifact(response.data);
    } catch (error) {
      message.error('获取文物信息失败');
      navigate('/artifacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    message.success('文物信息更新成功');
    navigate(`/artifacts/${id}`);
  };

  const handleCancel = () => {
    navigate(`/artifacts/${id}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="加载文物信息..." />
      </div>
    );
  }

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
        <Breadcrumb
          items={[
            {
              title: <HomeOutlined />,
              href: '/dashboard'
            },
            {
              title: '文物管理',
              href: '/artifacts'
            },
            {
              title: artifact?.name || '文物详情',
              href: `/artifacts/${id}`
            },
            {
              title: '编辑文物'
            }
          ]}
        />
        
        <Space align="center">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(`/artifacts/${id}`)}
            type="text"
          >
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            <EditOutlined style={{ marginRight: 8 }} />
            编辑文物信息
          </Title>
        </Space>
      </Space>

      <Card>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
          <Title level={5} style={{ margin: 0, color: '#666' }}>
            文物编号：<span style={{ color: '#1890ff', fontWeight: 'bold' }}>{artifact?.artifact_code}</span>
          </Title>
          <Title level={5} style={{ margin: 0, color: '#666' }}>
            文物名称：<span style={{ fontWeight: 'bold' }}>{artifact?.name}</span>
          </Title>
        </Space>
        
        <ArtifactForm
          artifact={artifact}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
};

export default EditArtifact;