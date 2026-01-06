import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Modal } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [creatingTestUsers, setCreatingTestUsers] = useState(false);
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      
      if (result.success) {
        message.success('登录成功！');
        navigate('/dashboard', { replace: true });
      } else {
        message.error(result.message || '登录失败');
      }
    } catch (error) {
      message.error('登录时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (username, password) => {
    form.setFieldsValue({ username, password });
    handleSubmit({ username, password });
  };

  const handleCreateTestUsers = async () => {
    Modal.confirm({
      title: '创建测试用户',
      content: '确定要创建测试用户吗？这将会在数据库中创建管理员、策展人和研究员账号。',
      onOk: async () => {
        setCreatingTestUsers(true);
        try {
          const response = await authService.createTestUsers();
          if (response.success) {
            message.success('测试用户创建成功！');
            message.info('可以使用以下账号登录：admin/admin123, curator1/user123, researcher1/user123');
          } else {
            message.error('创建测试用户失败');
          }
        } catch (error) {
          message.error('创建测试用户时出错');
        } finally {
          setCreatingTestUsers(false);
        }
      }
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2a6c 0%, #3a7bd5 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 420,
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space direction="vertical" size="middle">
            <div style={{
              width: 60,
              height: 60,
              background: '#1890ff',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <BankOutlined style={{ fontSize: 32, color: 'white' }} />
            </div>
            <Title level={2} style={{ margin: 0 }}>博物馆管理系统</Title>
            <Text type="secondary">请登录您的账户</Text>
          </Space>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            测试账号 (点击快速登录):
          </Text>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              block 
              onClick={() => handleQuickLogin('admin', 'admin123')}
              style={{ textAlign: 'left' }}
            >
              <Space>
                <UserOutlined />
                <div>
                  <div>系统管理员</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>admin / admin123</Text>
                </div>
              </Space>
            </Button>
            
            <Button 
              block 
              onClick={() => handleQuickLogin('curator1', 'user123')}
              style={{ textAlign: 'left' }}
            >
              <Space>
                <UserOutlined />
                <div>
                  <div>策展人员</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>curator1 / user123</Text>
                </div>
              </Space>
            </Button>

            <Button 
              block 
              onClick={() => handleQuickLogin('researcher1', 'user123')}
              style={{ textAlign: 'left' }}
            >
              <Space>
                <UserOutlined />
                <div>
                  <div>研究人员</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>researcher1 / user123</Text>
                </div>
              </Space>
            </Button>
          </Space>
        </div>

        <div style={{ 
          marginTop: 32, 
          paddingTop: 16, 
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center' 
        }}>
          <Button 
            type="dashed" 
            icon={<DatabaseOutlined />}
            loading={creatingTestUsers}
            onClick={handleCreateTestUsers}
            block
          >
            初始化测试数据
          </Button>
          <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
            © 2024 博物馆管理系统 v1.0
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
