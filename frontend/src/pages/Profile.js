import React from 'react';
import { Card, Descriptions, Button, Form, Input, message, Typography, Avatar, Space,Tag } from 'antd';
import { UserOutlined, MailOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useAuth();

  const getRoleName = (role) => {
    const roles = {
      'admin': '系统管理员',
      'curator': '策展人',
      'researcher': '研究员',
      'visitor': '访客'
    };
    return roles[role] || role;
  };

  const handleSave = (values) => {
    // 这里应该调用API更新用户信息
    message.success('个人信息已更新');
  };

  return (
    <div>
      <Card title="个人资料">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Avatar 
            size={100} 
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: user?.role === 'admin' ? '#f56a00' : 
                             user?.role === 'curator' ? '#1890ff' : 
                             user?.role === 'researcher' ? '#52c41a' : '#722ed1',
              fontSize: 40,
              marginBottom: 16
            }}
          />
          <Title level={3} style={{ marginBottom: 8 }}>{user?.full_name || user?.username}</Title>
          <Space>
            <Tag color={user?.role === 'admin' ? 'red' : 
                       user?.role === 'curator' ? 'blue' : 
                       user?.role === 'researcher' ? 'green' : 'purple'}
            >
              <CrownOutlined /> {getRoleName(user?.role)}
            </Tag>
            <Tag color="cyan">
              <TeamOutlined /> {user?.department || '未分配部门'}
            </Tag>
          </Space>
        </div>

        <Descriptions column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="邮箱">
            <Space>
              <MailOutlined />
              {user?.email || '-'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="姓名">{user?.full_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="部门">{user?.department || '-'}</Descriptions.Item>
          <Descriptions.Item label="职位">{user?.position || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">{getRoleName(user?.role)}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {user?.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
        </Descriptions>

        <Form
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            email: user?.email,
            full_name: user?.full_name,
            department: user?.department,
            position: user?.position
          }}
        >
          <Form.Item
            name="full_name"
            label="姓名"
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="department"
            label="部门"
          >
            <Input placeholder="请输入部门" />
          </Form.Item>

          <Form.Item
            name="position"
            label="职位"
          >
            <Input placeholder="请输入职位" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存更改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;