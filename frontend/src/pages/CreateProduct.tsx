import React, { useState } from 'react';
import { Typography, Form, Input, Button, Card, message, DatePicker, InputNumber, Upload, Select } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productsAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateProduct: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [qrCodeFileList, setQrCodeFileList] = useState<UploadFile[]>([]);

  const handleUpload = async (file: RcFile, fileType: 'image' | 'qrcode'): Promise<string> => {
    try {
      const response = await uploadAPI.uploadImage(file);
      message.success(`${fileType === 'image' ? '产品图片' : '二维码'}上传成功`);
      return response.url;
    } catch (error) {
      message.error(`${fileType === 'image' ? '产品图片' : '二维码'}上传失败`);
      console.error('Upload failed:', error);
      return '';
    }
  };

  const imageProps: UploadProps = {
    onRemove: () => {
      setImageUrl('');
      setImageFileList([]);
    },
    beforeUpload: async (file) => {
      const url = await handleUpload(file, 'image');
      if (url) {
        setImageUrl(url);
        setImageFileList([
          {
            uid: '-1',
            name: file.name,
            status: 'done',
            url: `http://localhost:15000${url}`,
          },
        ]);
      }
      return false;
    },
    fileList: imageFileList,
  };

  const qrCodeProps: UploadProps = {
    onRemove: () => {
      setQrCodeUrl('');
      setQrCodeFileList([]);
    },
    beforeUpload: async (file) => {
      const url = await handleUpload(file, 'qrcode');
      if (url) {
        setQrCodeUrl(url);
        setQrCodeFileList([
          {
            uid: '-1',
            name: file.name,
            status: 'done',
            url: `http://localhost:15000${url}`,
          },
        ]);
      }
      return false;
    },
    fileList: qrCodeFileList,
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // 格式化日期
      if (values.production_date) {
        values.production_date = values.production_date.format('YYYY-MM-DD');
      }
      
      // 添加图片和二维码URL
      if (imageUrl) {
        values.image_url = imageUrl;
      }
      
      if (qrCodeUrl) {
        values.qr_code = qrCodeUrl;
      }
      
      const response = await productsAPI.createProduct(values);
      message.success('产品创建成功，已上链');
      navigate(`/products/${response.product_id}`);
    } catch (error) {
      message.error('产品创建失败');
      console.error('Failed to create product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>创建新产品</Title>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            manufacturer: user?.organization || '',
            vintage: new Date().getFullYear(),
            alcohol_content: 53,
            flavor_type: '酱香型',
          }}
        >
          <Form.Item
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="如：贵州茅台酒" />
          </Form.Item>
          
          <Form.Item
            name="batch_number"
            label="批次号"
            rules={[{ required: true, message: '请输入批次号' }]}
          >
            <Input placeholder="如：MT2024001" />
          </Form.Item>
          
          <Form.Item
            name="production_date"
            label="生产日期"
            rules={[{ required: true, message: '请选择生产日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="manufacturer"
            label="制造商"
            rules={[{ required: true, message: '请输入制造商名称' }]}
          >
            <Input placeholder="如：贵州茅台酒股份有限公司" />
          </Form.Item>
          
          <Form.Item
            name="alcohol_content"
            label="酒精度数 (%)"
            rules={[{ required: true, message: '请输入酒精度数' }]}
          >
            <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="flavor_type"
            label="香型"
            rules={[{ required: true, message: '请选择香型' }]}
          >
            <Select>
              <Option value="酱香型">酱香型</Option>
              <Option value="浓香型">浓香型</Option>
              <Option value="清香型">清香型</Option>
              <Option value="米香型">米香型</Option>
              <Option value="凤香型">凤香型</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="vintage"
            label="年份"
            rules={[{ required: true, message: '请输入年份' }]}
          >
            <InputNumber min={1900} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="certification"
            label="认证信息"
          >
            <Input placeholder="如：国酒认证" />
          </Form.Item>
          
          <Form.Item
            name="anti_fake_code"
            label="防伪码"
            rules={[{ required: true, message: '请输入防伪码' }]}
          >
            <Input placeholder="如：MT2024001ABC123" />
          </Form.Item>
          
          <Form.Item
            label="产品图片"
            name="image"
          >
            <Upload {...imageProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            label="产品二维码"
            name="qrcode"
          >
            <Upload {...qrCodeProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>上传二维码</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              block
            >
              创建产品并上链
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateProduct; 