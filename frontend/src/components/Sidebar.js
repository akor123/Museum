import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  BankOutlined, 
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  TeamOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // 基础菜单项
  const baseMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板'
    },
    {
      key: '/artifacts',
      icon: <BankOutlined />,
      label: '文物管理'
    },
    {
      key: '/exhibitions',
      icon: <CalendarOutlined />,
      label: '展览管理',
      disabled: true
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];
  
  // 管理员专属菜单项
  const adminMenuItems = [
    {
      key: '/users',
      icon: <UsergroupAddOutlined />,
      label: '用户管理',
      disabled: false // 启用用户管理
    }
  ];
  
  // 合并菜单项
  const menuItems = isAdmin() ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  const handleMenuClick = ({ key }) => {
    if (key === '/exhibitions') {
      // 展览管理暂未实现
      return;
    }
    navigate(key);
  };

  return (
  <Sider
    width={220}
    style={{
      background: '#fff',
      borderRight: '1px solid #f0f0f0',
      padding: '16px 0',
      height: 'calc(100vh - 64px)', // 减去Header高度
      overflow: 'auto',
      position: 'fixed',
      left: 0,
      top: 64 // Header高度
    }}
  >
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: '100%', borderRight: 0 }}
      items={menuItems}
      onClick={handleMenuClick}
    />
  </Sider>
);
};

export default Sidebar;