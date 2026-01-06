import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, Space, message, Row, Col, Card } from 'antd';
import { artifactService } from '../services/api';
import ImageUpload from './ImageUpload'; // 导入图片上传组件
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const ArtifactForm = ({ artifact, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [eras, setEras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    fetchFormData();
    if (artifact) {
      const isRepairingStatus = artifact.preservation_status === '修复中';
      setIsRepairing(isRepairingStatus);
      
      const formValues = {
        ...artifact,
        discovery_date: artifact.discovery_date ? moment(artifact.discovery_date, 'YYYY-MM-DD') : null,
        // 如果是修复中状态，确保可展示数量为0
        available_amount: isRepairingStatus ? 0 : artifact.available_amount
      };
      form.setFieldsValue(formValues);
    }
  }, [artifact, form]);

  // 监听保存状况变化
  const handlePreservationChange = (value) => {
    const isNowRepairing = value === '修复中';
    setIsRepairing(isNowRepairing);
    
    if (isNowRepairing) {
      // 如果是修复中状态，自动设置可展示数量为0
      form.setFieldsValue({
        available_amount: 0
      });
    }
  };

  const fetchFormData = async () => {
    try {
      const [categoriesRes, erasRes] = await Promise.all([
        artifactService.getCategories(),
        artifactService.getEras()
      ]);
      setCategories(categoriesRes.data);
      setEras(erasRes.data);
    } catch (error) {
      message.error('加载表单数据失败');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        discovery_date: values.discovery_date ? values.discovery_date.format('YYYY-MM-DD') : null
      };

      // 前端验证逻辑
      if (formData.preservation_status === '修复中' && formData.available_amount > 0) {
        message.warning('修复中的文物可展示数量已自动设置为0');
        formData.available_amount = 0;
      }

      // 确保可展示数量不超过总数量
      if (formData.available_amount > formData.total_amount) {
        message.warning('可展示数量不能超过总数量，已自动调整');
        formData.available_amount = formData.total_amount;
      }

      if (artifact) {
        await artifactService.updateArtifact(artifact.id, formData);
        message.success('文物信息更新成功');
      } else {
        await artifactService.createArtifact(formData);
        message.success('文物添加成功');
      }

      onSubmit();
    } catch (error) {
      message.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const valueLevelOptions = [
    { value: '一级', label: '一级文物' },
    { value: '二级', label: '二级文物' },
    { value: '三级', label: '三级文物' },
    { value: '一般', label: '一般文物' }
  ];

  const preservationOptions = [
    { value: '完好', label: '完好' },
    { value: '轻度损坏', label: '轻度损坏' },
    { value: '中度损坏', label: '中度损坏' },
    { value: '严重损坏', label: '严重损坏' },
    { value: '修复中', label: '修复中' }
  ];

  const categoryOptions = [
    { value: '青铜器', label: '青铜器' },
    { value: '陶瓷', label: '陶瓷' },
    { value: '书画', label: '书画' },
    { value: '玉器', label: '玉器' },
    { value: '骨器', label: '骨器' },
    { value: '金银器', label: '金银器' },
    { value: '漆器', label: '漆器' },
    { value: '纺织品', label: '纺织品' },
    { value: '其他', label: '其他' }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        total_amount: 1,
        available_amount: 1,
        value_level: '一般',
        preservation_status: '完好'
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="artifact_code"
            label="文物编号"
            rules={[
              { required: true, message: '请输入文物编号' },
              { pattern: /^[A-Za-z0-9_-]+$/, message: '编号只能包含字母、数字、下划线和短横线' }
            ]}
          >
            <Input placeholder="如：MW001" disabled={!!artifact} />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="name"
            label="文物名称"
            rules={[{ required: true, message: '请输入文物名称' }]}
          >
            <Input placeholder="请输入文物名称" />
          </Form.Item>
        </Col>
      </Row>

      <Card title="文物图片" size="small" style={{ marginBottom: 24 }}>
        <Form.Item
          name="image_url"
          label=""
        >
          <ImageUpload />
        </Form.Item>
        <div style={{ color: '#666', fontSize: 12 }}>
          <p>• 支持上传 jpg、png、gif、webp、bmp 格式的图片</p>
          <p>• 图片大小不能超过5MB</p>
          <p>• 点击上方区域选择图片，或直接拖拽图片到此处</p>
          <p>• 上传后可以点击预览查看大图，或删除重新上传</p>
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="era"
            label="年代"
            rules={[{ required: true, message: '请输入年代' }]}
          >
            <Select
              placeholder="选择年代"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="">请选择年代</Option>
              {eras.map(era => (
                <Option key={era} value={era}>{era}</Option>
              ))}
              <Option value="新石器时代">新石器时代</Option>
              <Option value="夏代">夏代</Option>
              <Option value="商代">商代</Option>
              <Option value="西周">西周</Option>
              <Option value="东周">东周</Option>
              <Option value="秦代">秦代</Option>
              <Option value="汉代">汉代</Option>
              <Option value="魏晋南北朝">魏晋南北朝</Option>
              <Option value="隋代">隋代</Option>
              <Option value="唐代">唐代</Option>
              <Option value="宋代">宋代</Option>
              <Option value="元代">元代</Option>
              <Option value="明代">明代</Option>
              <Option value="清代">清代</Option>
              <Option value="近代">近代</Option>
              <Option value="现代">现代</Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="category"
            label="文物类别"
            rules={[{ required: true, message: '请选择文物类别' }]}
          >
            <Select
              placeholder="选择文物类别"
              showSearch
            >
              <Option value="">请选择类别</Option>
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="material"
            label="材质"
          >
            <Input placeholder="如：青铜、瓷、玉、绢本等" />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="size"
            label="尺寸"
          >
            <Input placeholder="如：高58cm，口径50cm" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="weight"
            label="重量（克）"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入重量"
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="discovery_date"
            label="发现日期"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="选择发现日期"
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="discovery_place"
        label="发现地点"
      >
        <Input placeholder="如：河南安阳、江西景德镇等" />
      </Form.Item>

      <Form.Item
        name="source"
        label="来源"
      >
        <Select placeholder="选择文物来源">
          <Option value="考古发掘">考古发掘</Option>
          <Option value="捐赠">捐赠</Option>
          <Option value="购买">购买</Option>
          <Option value="调拨">调拨</Option>
          <Option value="其他">其他</Option>
        </Select>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="value_level"
            label="价值等级"
            rules={[{ required: true, message: '请选择价值等级' }]}
          >
            <Select placeholder="选择价值等级">
              {valueLevelOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="preservation_status"
            label="保存状况"
            rules={[{ required: true, message: '请选择保存状况' }]}
          >
            <Select 
              placeholder="选择保存状况"
              onChange={handlePreservationChange}
            >
              {preservationOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="location"
            label="存放位置"
            rules={[{ required: true, message: '请输入存放位置' }]}
          >
            <Input placeholder="如：一楼展厅A区01" />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="image_url"  // 这个字段现在由ImageUpload组件处理
            hidden
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="total_amount"
            label="总数量"
            rules={[{ required: true, message: '请输入总数量' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              integer
              placeholder="请输入总数量"
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="available_amount"
            label="可展示数量"
            rules={[{ required: true, message: '请输入可展示数量' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              integer
              placeholder="请输入可展示数量"
              disabled={isRepairing}
              addonAfter={isRepairing ? "修复中不可展示" : "件"}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="文物描述"
      >
        <TextArea 
          rows={4} 
          placeholder="请输入文物的详细描述，包括历史背景、艺术价值、研究意义等"
          showCount
          maxLength={2000}
        />
      </Form.Item>

      {/* 提示信息 */}
      {isRepairing && (
        <div style={{ 
          background: '#fffbe6', 
          border: '1px solid #ffe58f',
          borderRadius: 6,
          padding: 12,
          marginBottom: 24
        }}>
          <p style={{ margin: 0, color: '#faad14' }}>
            <strong>提示：</strong>文物状态为"修复中"，可展示数量已自动设为0，不可修改。修复完成后请将状态改为其他保存状况。
          </p>
        </div>
      )}

      <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
        <Space>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {artifact ? '更新文物' : '添加文物'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ArtifactForm;