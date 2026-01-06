import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Select, Space, Card, Tag, Pagination, 
  Modal, message, Row, Col, Form, Popconfirm, Tooltip, Avatar, Spin 
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, LockOutlined, MailOutlined,
  TeamOutlined, CrownOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      message.error('权限不足，只有管理员可以访问用户管理');
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1, search = searchText, role = roleFilter) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        search,
        role
      };
      
      const response = await userService.getAllUsers(params);
      console.log('获取用户列表响应:', response);
      
      setUsers(response.data.users);
      setPagination({
        ...pagination,
        current: response.data.page,
        total: response.data.total
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchUsers(1, value, roleFilter);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    fetchUsers(1, searchText, value);
  };

  const handlePageChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
    fetchUsers(page, searchText, roleFilter);
  };

  const handleAddUser = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      ...user,
      password: '' // 不显示密码
    });
    setEditModalVisible(true);
  };

  const handleDeleteUser = async (id, username) => {
    if (username === 'admin') {
      message.error('不能删除系统管理员账号');
      return;
    }
    
    if (user.username === username) {
      message.error('不能删除自己的账户');
      return;
    }
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${username} 吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await userService.deleteUser(id);
          message.success('用户删除成功');
          fetchUsers(pagination.current, searchText, roleFilter);
        } catch (error) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  const handleAddSubmit = async (values) => {
    setSubmitting(true);
    try {
      console.log('创建用户数据:', values);
      await userService.createUser(values);
      message.success('用户添加成功');
      setModalVisible(false);
      fetchUsers(pagination.current, searchText, roleFilter);
    } catch (error) {
      message.error('添加失败: ' + (error.message || '未知错误'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (values) => {
    setSubmitting(true);
    try {
      console.log('更新用户数据:', selectedUser.id, values);
      await userService.updateUser(selectedUser.id, values);
      message.success('用户信息更新成功');
      setEditModalVisible(false);
      fetchUsers(pagination.current, searchText, roleFilter);
    } catch (error) {
      message.error('更新失败: ' + (error.message || '未知错误'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (id, username) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 ${username} 的密码吗？`,
      okText: '确认重置',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await userService.resetPassword(id);
          message.success(response.message || '密码重置成功');
        } catch (error) {
          message.error('重置失败: ' + (error.message || '未知错误'));
        }
      }
    });
  };

  const getRoleName = (role) => {
    const roles = {
      'admin': '系统管理员',
      'curator': '策展人',
      'researcher': '研究员',
      'visitor': '访客'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'red',
      'curator': 'blue',
      'researcher': 'green',
      'visitor': 'purple'
    };
    return colors[role] || 'default';
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: getRoleColor(record.role)
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.full_name}</div>
          </div>
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          {email || '-'}
        </Space>
      )
    },
    {
      title: '部门/职位',
      key: 'department',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.department || '-'}</span>
          <span style={{ fontSize: 12, color: '#666' }}>{record.position || '-'}</span>
        </Space>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={<CrownOutlined />}>
          {getRoleName(role)}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="重置密码">
            <Button 
              type="link" 
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record.id, record.username)}
            />
          </Tooltip>
          {record.username !== 'admin' && user.username !== record.username && (
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除"
                description={`确定要删除用户 ${record.username} 吗？`}
                onConfirm={() => handleDeleteUser(record.id, record.username)}
                okText="确认"
                cancelText="取消"
              >
                <Button 
                  type="link" 
                  danger 
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  if (!isAdmin()) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>权限不足</h2>
        <p>只有管理员可以访问用户管理功能</p>
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          返回仪表板
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>用户管理</span>
            <Tag color="blue">{pagination.total} 个用户</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            添加用户
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索用户名、姓名或邮箱"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="按角色筛选"
              allowClear
              style={{ width: '100%' }}
              size="large"
              onChange={handleRoleFilterChange}
            >
              <Option value="">所有角色</Option>
              <Option value="admin">系统管理员</Option>
              <Option value="curator">策展人</Option>
              <Option value="researcher">研究员</Option>
              <Option value="visitor">访客</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={false}
        />

        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
          style={{ marginTop: 24, textAlign: 'right' }}
        />
      </Card>

      {/* 添加用户模态框 */}
      <Modal
        title="添加用户"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSubmit}
          initialValues={{
            role: 'curator'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="full_name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
              >
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="职位"
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="curator">策展人</Option>
              <Option value="researcher">研究员</Option>
              <Option value="visitor">访客</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                添加用户
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="full_name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">系统管理员</Option>
                  <Option value="curator">策展人</Option>
                  <Option value="researcher">研究员</Option>
                  <Option value="visitor">访客</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
              >
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="职位"
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="重置密码"
            extra="留空表示不修改密码，填写新密码将重置密码"
          >
            <Input.Password placeholder="留空表示不修改密码" />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                更新信息
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;