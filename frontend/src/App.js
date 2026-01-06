import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Layout, Spin, message } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ArtifactList from './pages/ArtifactList';
import ArtifactDetail from './pages/ArtifactDetail';
// 1. 导入 EditArtifact 组件
import EditArtifact from './pages/EditArtifact';
// 新增：导入用户管理页面组件
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const { Content } = Layout;

// 私有路由包装器
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// 主布局组件
const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header onLogout={handleLogout} />
      <Layout style={{ marginTop: 64 }}> {/* 给Content添加顶部边距 */}
        <Sidebar />
        <Content style={{ 
          padding: '24px', 
          background: '#f0f2f5', 
          minHeight: 'calc(100vh - 64px)',
          marginLeft: 220 // Sidebar宽度
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 登录页面 */}
      <Route path="/login" element={<Login />} />
      
      {/* 需要认证的页面 */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="artifacts" element={<ArtifactList />} />
        <Route path="artifacts/:id" element={<ArtifactDetail />} />
        {/* 2. 添加编辑路由 */}
        <Route path="artifacts/edit/:id" element={<EditArtifact />} />
        {/* 新增：添加用户管理路由，路径为 /users */}
        <Route path="users" element={<UserManagement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* 404 页面 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;