import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Spin, List, Tag, Button } from 'antd';
import { BlockOutlined, DatabaseOutlined, NodeIndexOutlined, ScanOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { productsAPI, blockchainAPI } from '../services/api';

const { Title, Paragraph } = Typography;

interface BlockchainStatus {
  chain_length: number;
  pending_transactions: number;
  is_valid: boolean;
}

interface Product {
  id: string;
  name: string;
  batch_number: string;
  production_date: string;
  manufacturer: string;
  created_at: string;
}

const Home: React.FC = () => {
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await blockchainAPI.getStatus();
        const products = await productsAPI.getAllProducts();
        
        setBlockchainStatus(status);
        setLatestProducts(products.slice(0, 5)); // 只显示最新的5个产品
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Title level={2}>茅台酒区块链溯源系统</Title>
      <Paragraph>
        欢迎使用茅台酒区块链溯源系统，本系统基于区块链技术，实现茅台酒从生产到销售的全链路溯源。
      </Paragraph>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="区块链长度"
                value={blockchainStatus?.chain_length || 0}
                prefix={<BlockOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="待处理交易"
                value={blockchainStatus?.pending_transactions || 0}
                prefix={<NodeIndexOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="区块链状态"
                value={blockchainStatus?.is_valid ? '有效' : '无效'}
                valueStyle={{ color: blockchainStatus?.is_valid ? '#3f8600' : '#cf1322' }}
                prefix={<ScanOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="产品数量"
                value={latestProducts.length}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="最新产品" style={{ marginTop: 24 }}>
          <List
            dataSource={latestProducts}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Link to={`/products/${item.id}`}>
                    <Button type="primary" size="small">查看详情</Button>
                  </Link>,
                  <Link to={`/products/${item.id}/trace`}>
                    <Button size="small">溯源信息</Button>
                  </Link>
                ]}
              >
                <List.Item.Meta
                  title={<Link to={`/products/${item.id}`}>{item.name}</Link>}
                  description={
                    <>
                      <div>批次号: {item.batch_number}</div>
                      <div>生产日期: {new Date(item.production_date).toLocaleDateString()}</div>
                      <div>生产商: {item.manufacturer}</div>
                    </>
                  }
                />
                <Tag color="green">已上链</Tag>
              </List.Item>
            )}
            locale={{ emptyText: '暂无产品数据' }}
          />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/products">
              <Button type="primary">查看全部产品</Button>
            </Link>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default Home; 