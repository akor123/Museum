import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Switch, Button, message, Space, Select, Tag } from 'antd';
import { 
  SaveOutlined, 
  SettingOutlined, 
  BellOutlined, 
  SafetyOutlined,  // 使用 SafetyOutlined 代替 SecurityOutlined
  LockOutlined,    // 用于安全设置
  DatabaseOutlined // 用于基本设置
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const handleSave = (values) => {
    setLoading(true);
    // 模拟保存
    setTimeout(() => {
      message.success('设置已保存');
      setLoading(false);
    }, 1000);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Card title="系统设置">
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab={<span><SettingOutlined /> 基本设置</span>} key="1">
          <Form layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="系统名称"
              name="systemName"
              initialValue="博物馆管理系统"
              rules={[{ required: true, message: '请输入系统名称' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              label="每页显示数量"
              name="pageSize"
              initialValue="10"
              rules={[{ required: true, message: '请输入每页显示数量' }]}
            >
              <Input type="number" min="5" max="100" />
            </Form.Item>
            
            <Form.Item
              label="默认语言"
              name="language"
              initialValue="zh_CN"
            >
              <Select>
                <Option value="zh_CN">简体中文</Option>
                <Option value="en_US">English</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label="启用数据备份"
              name="enableBackup"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane tab={<span><BellOutlined /> 通知设置</span>} key="2">
          <Form layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="启用邮件通知"
              name="enableEmailNotifications"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              label="启用站内通知"
              name="enableInAppNotifications"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              label="文物借阅提醒"
              name="artifactLoanReminder"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              label="修复完成提醒"
              name="restorationCompleteReminder"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane tab={<span><LockOutlined /> 安全设置</span>} key="3">
          <Form layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="强制密码复杂度"
              name="passwordComplexity"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              label="密码过期时间（天）"
              name="passwordExpiryDays"
              initialValue="90"
            >
              <Input type="number" min="30" max="365" />
            </Form.Item>
            
            <Form.Item
              label="最大登录失败次数"
              name="maxLoginAttempts"
              initialValue="5"
            >
              <Input type="number" min="3" max="10" />
            </Form.Item>
            
            <Form.Item
              label="启用双重认证"
              name="enableTwoFactorAuth"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane tab="关于" key="4">
          <div style={{ padding: '20px 0' }}>
            <h3>博物馆管理系统 v1.0</h3>
            <p>这是一个基于React + Node.js + MySQL的博物馆管理系统</p>
            
            <div style={{ marginTop: 20 }}>
              <h4>系统功能</h4>
              <ul>
                <li>文物/藏品信息管理</li>
                <li>展览策划与管理</li>
                <li>借展与修复记录</li>
                <li>多角色权限管理</li>
                <li>数据统计与分析</li>
              </ul>
            </div>
            
            <div style={{ marginTop: 20 }}>
              <h4>技术栈</h4>
              <Space wrap>
                <Tag color="blue">React 18</Tag>
                <Tag color="green">Node.js</Tag>
                <Tag color="orange">Express</Tag>
                <Tag color="purple">MySQL</Tag>
                <Tag color="red">Ant Design</Tag>
              </Space>
            </div>
            
            <div style={{ marginTop: 20 }}>
              <h4>开发团队</h4>
              <p>博物馆信息技术部</p>
              <p>版本：1.0.0</p>
              <p>发布日期：2024年</p>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default Settings;