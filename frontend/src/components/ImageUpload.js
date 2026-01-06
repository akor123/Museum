import React, { useState } from 'react';
import { Upload, Button, message, Image, Space, Modal, List, Progress } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Dragger } = Upload;

const ImageUpload = ({ value, onChange, maxCount = 1, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // 自定义上传
  const customUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const imageUrl = response.data.url;
      
      if (onChange) {
        if (maxCount === 1) {
          onChange(imageUrl);
        } else {
          onChange([...(value || []), imageUrl]);
        }
      }
      
      onSuccess(response.data, file);
      message.success('图片上传成功');
      
      // 重置进度条
      setTimeout(() => setUploadProgress(0), 1000);
      
    } catch (error) {
      onError(error);
      message.error('上传失败: ' + (error.message || '未知错误'));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // 上传配置
  const uploadProps = {
    name: 'image',
    multiple: maxCount > 1,
    accept: 'image/*',
    showUploadList: false,
    customRequest: customUpload,
    disabled: uploading || disabled,
    beforeUpload: (file) => {
      // 文件大小检查（5MB）
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB');
        return Upload.LIST_IGNORE;
      }
      
      // 文件类型检查
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return Upload.LIST_IGNORE;
      }
      
      return true;
    }
  };

  // 处理预览
  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  // 处理删除
  const handleDelete = (imageUrl) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      onOk: async () => {
        try {
          // 从服务器删除
          const filename = imageUrl.split('/').pop();
          await api.delete(`/upload/image/${filename}`);
          
          // 更新本地状态
          if (onChange) {
            if (maxCount === 1) {
              onChange('');
            } else {
              onChange((value || []).filter(url => url !== imageUrl));
            }
          }
          
          message.success('图片删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 渲染上传区域
  const renderUploadArea = () => {
    if (maxCount === 1 && value) {
      return null; // 单张图片已上传时隐藏上传区域
    }
    
    if (maxCount > 1 && value && value.length >= maxCount) {
      return null; // 多张图片达到上限时隐藏上传区域
    }
    
    return (
      <Dragger {...uploadProps}>
        <div style={{ padding: '40px 0' }}>
          <PictureOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <p className="ant-upload-text">
            点击或拖拽图片到此区域上传
          </p>
          <p className="ant-upload-hint">
            支持上传单张图片，大小不超过5MB
          </p>
          {uploading && (
            <div style={{ marginTop: 16 }}>
              <Progress percent={uploadProgress} size="small" />
              <p style={{ marginTop: 8, color: '#666' }}>上传中...</p>
            </div>
          )}
        </div>
      </Dragger>
    );
  };

  // 渲染已上传的图片
  const renderUploadedImages = () => {
    if (!value || (maxCount > 1 && value.length === 0)) {
      return null;
    }

    const images = maxCount === 1 ? [value] : value;
    
    return (
      <div style={{ marginTop: 16 }}>
        <h4>已上传图片：</h4>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={images}
          renderItem={(imageUrl, index) => (
            <List.Item>
              <div style={{ position: 'relative' }}>
                <Image
                  src={imageUrl}
                  alt={`上传的图片 ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                  preview={false}
                  onClick={() => handlePreview(imageUrl)}
                />
                <Space 
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '4px 8px',
                    borderRadius: 4
                  }}
                >
                  <Button
                    type="text"
                    icon={<EyeOutlined style={{ color: 'white' }} />}
                    size="small"
                    onClick={() => handlePreview(imageUrl)}
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined style={{ color: 'white' }} />}
                    size="small"
                    onClick={() => handleDelete(imageUrl)}
                  />
                </Space>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <div>
      {renderUploadArea()}
      {renderUploadedImages()}
      
      {/* 图片预览Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ top: 20 }}
      >
        <img
          alt="预览"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
      
      {/* 当单张图片已上传且需要重新上传时显示按钮 */}
      {maxCount === 1 && value && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => {
              // 创建一个隐藏的input来触发文件选择
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const options = {
                    file,
                    onSuccess: (response, file) => {
                      const imageUrl = response.data.url;
                      onChange(imageUrl);
                    },
                    onError: (error) => {
                      message.error('上传失败');
                    }
                  };
                  customUpload(options);
                }
              };
              input.click();
            }}
            disabled={uploading}
          >
            重新上传图片
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(value)}
            style={{ marginLeft: 8 }}
          >
            删除图片
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;