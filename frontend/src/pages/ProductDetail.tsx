import React, { useEffect, useState } from 'react';
import { Typography, Descriptions, Spin, Button, Card, Timeline, Image, Modal, Form, Input, message, Divider, Empty, Alert } from 'antd';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BlockOutlined, EnvironmentOutlined, HistoryOutlined, QrcodeOutlined, ApiOutlined } from '@ant-design/icons';
import { productsAPI } from '../services/api';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;
const { Item } = Descriptions;
const { TextArea } = Input;

interface ProductDetail {
  id: string;
  name: string;
  batch_number: string;
  production_date: string;
  manufacturer: string;
  alcohol_content: number;
  flavor_type: string;
  vintage: number;
  certification: string;
  anti_fake_code: string;
  qr_code: string;
  image_url: string;
}

interface HistoryItem {
  type: string;
  from?: string;
  to?: string;
  timestamp: string;
  block_hash: string;
  transaction_hash: string;
}

interface ProductResponse {
  product: ProductDetail;
  history: HistoryItem[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [productData, setProductData] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferForm] = Form.useForm();
  const [transferLoading, setTransferLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProductDetail(id);
    }
  }, [id]);

  const fetchProductDetail = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productsAPI.getProductById(productId);
      setProductData(response);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      message.error('获取产品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (values: any) => {
    if (!id) return;
    
    try {
      setTransferLoading(true);
      await productsAPI.transferProduct(id, values);
      message.success('产品转移记录添加成功');
      setTransferModalVisible(false);
      transferForm.resetFields();
      // 重新获取产品详情
      fetchProductDetail(id);
    } catch (error) {
      console.error('Failed to transfer product:', error);
      message.error('产品转移记录添加失败');
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!productData || !productData.product) {
    return <Typography.Text>未找到产品信息</Typography.Text>;
  }

  const { product, history } = productData;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>{product.name} - 产品详情</Title>
        <div>
          <Button 
            type="primary" 
            onClick={() => navigate(`/products/${id}/trace`)}
            style={{ marginRight: 8 }}
          >
            查看完整溯源信息
          </Button>
          {isAuthenticated && (user?.role === 'logistics' || user?.role === 'retailer') && (
            <Button 
              type="primary" 
              onClick={() => setTransferModalVisible(true)}
            >
              添加物流记录
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <Descriptions bordered column={1} size="middle" styles={{ label: { fontWeight: 'bold' } }}>
              <Item label="产品ID">{product.id}</Item>
              <Item label="产品名称">{product.name}</Item>
              <Item label="批次号">{product.batch_number}</Item>
              <Item label="生产日期">{moment(product.production_date).format('YYYY-MM-DD')}</Item>
              <Item label="制造商">{product.manufacturer}</Item>
              <Item label="酒精度数">{product.alcohol_content}%</Item>
              <Item label="香型">{product.flavor_type}</Item>
              <Item label="年份">{product.vintage}年</Item>
              <Item label="认证信息">{product.certification}</Item>
              <Item label="防伪码">{product.anti_fake_code}</Item>
            </Descriptions>
          </div>
          
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {product.image_url && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Image
                  src="http://117.72.111.42:9000/safety/maotai.png"
                  alt={product.name}
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                  fallback="https://placehold.co/300x200?text=Maotai+Image+Not+Available"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;