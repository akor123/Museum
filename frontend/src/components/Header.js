import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Typography, Button, Space, Badge } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DownOutlined, 
  BellOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ onLogout }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleName = (role) => {
    const roles = {
      'admin': '系统管理员',
      'curator': '策展人',
      'researcher': '研究员',
      'visitor': '访客'
    };
    return roles[role] || role;
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/profile')}>
        <UserOutlined /> 个人资料
      </Menu.Item>
      <Menu.Item key="settings" onClick={() => navigate('/settings')}>
        <SettingOutlined /> 系统设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={onLogout}>
        <LogoutOutlined /> 退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader 
      style={{ 
        background: '#fff', 
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px #f0f1f2',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        lineHeight: '64px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ 
          width: 36, 
          height: 36, 
          background: 'linear-gradient(135deg, #1a2a6c 0%, #3a7bd5 100%)', 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          boxShadow: '0 4px 6px rgba(26, 42, 108, 0.2)',
          flexShrink: 0
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>🏛️</span>
        </div>
        <Space direction="vertical" size={0} style={{ lineHeight: 'normal' }}>
          <Text strong style={{ fontSize: 18, lineHeight: '1.2' }}>博物馆管理系统</Text>
          <Text type="secondary" style={{ fontSize: 12, lineHeight: '1.2' }}>
            {getRoleName(user?.role)}工作台
          </Text>
        </Space>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Space size="large" style={{ alignItems: 'center' }}>
          <Badge count={3} size="small" style={{ marginRight: 8 }}>
            <Button 
              type="text" 
              icon={<BellOutlined />}
              shape="circle"
              onClick={() => console.log('点击通知')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '16px'
              }}
            />
          </Badge>
          
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Button 
              type="text" 
              style={{ 
                height: '100%',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Space style={{ alignItems: 'center', height: '100%' }}>
                <Avatar 
                  size="default" 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: user?.role === 'admin' ? '#f56a00' : 
                                   user?.role === 'curator' ? '#1890ff' : 
                                   user?.role === 'researcher' ? '#52c41a' : '#722ed1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    flexShrink: 0
                  }}
                />
                <div style={{ 
                  textAlign: 'left', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <Text strong style={{ 
                    display: 'block', 
                    lineHeight: '1.2',
                    fontSize: '14px'
                  }}>
                    {user?.full_name || user?.username}
                  </Text>
                  <Text type="secondary" style={{ 
                    fontSize: 12, 
                    lineHeight: '1.2',
                    marginTop: '2px'
                  }}>
                    {getRoleName(user?.role)} • {user?.department || '未分配部门'}
                  </Text>
                </div>
                <DownOutlined style={{ 
                  fontSize: 12, 
                  color: '#999', 
                  flexShrink: 0,
                  marginLeft: '4px'
                }} />
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;