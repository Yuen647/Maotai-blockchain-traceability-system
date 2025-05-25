import React, { useEffect, useState } from 'react';
import { Typography, Timeline, Card, Spin, Button, Descriptions, Steps, Divider, Empty, Pagination } from 'antd';
import { BlockOutlined, EnvironmentOutlined, HistoryOutlined, ApiOutlined, RollbackOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;
const { Item } = Descriptions;
const { Step } = Steps;

interface ProductDetail {
  id: string;
  name: string;
  batch_number: string;
  production_date: string;
  manufacturer: string;
}

interface HistoryItem {
  type: string;
  from?: string;
  to?: string;
  timestamp: string;
  block_hash: string;
  transaction_hash: string;
}

interface TraceResponse {
  product: ProductDetail;
  history: HistoryItem[];
  total?: number;
  pages?: number;
  current_page?: number;
}

const ProductTrace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPaginated, setIsPaginated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchTraceData(id, isPaginated);
    }
  }, [id, currentPage, pageSize, isPaginated]);

  const fetchTraceData = async (productId: string, usePagination = false) => {
    try {
      setLoading(true);
      let response;
      if (usePagination) {
        response = await productsAPI.getProductTracePaginated(productId, currentPage, pageSize);
      } else {
        response = await productsAPI.getProductTrace(productId);
      }
      setTraceData(response);
    } catch (error) {
      console.error('Failed to fetch trace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
    if (!isPaginated) setIsPaginated(true);
  };

  const togglePagination = () => {
    setIsPaginated(!isPaginated);
    setCurrentPage(1);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!traceData || !traceData.product) {
    return <Typography.Text>未找到产品溯源信息</Typography.Text>;
  }

  const { product, history } = traceData;
  const sortedHistory = [...(history || [])].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>{product.name} - 溯源信息</Title>
        <div>
          <Button
            type="primary"
            onClick={() => navigate(`/products/${id}`)}
            icon={<RollbackOutlined />}
            style={{ marginRight: 8 }}
          >
            返回产品详情
          </Button>
          <Button onClick={togglePagination}>
            {isPaginated ? '查看完整溯源链' : '分页查看'}
          </Button>
        </div>
      </div>

      <Card>
        <Descriptions title="产品基本信息" bordered>
          <Item label="产品ID">{product.id}</Item>
          <Item label="产品名称">{product.name}</Item>
          <Item label="批次号">{product.batch_number}</Item>
          <Item label="生产日期">{moment(product.production_date).format('YYYY-MM-DD')}</Item>
          <Item label="生产商">{product.manufacturer}</Item>
        </Descriptions>

        <Divider orientation="left">溯源链信息</Divider>

        {sortedHistory && sortedHistory.length > 0 ? (
          <>
            <Steps 
              direction="vertical" 
              current={sortedHistory.length - 1}
              progressDot
              items={sortedHistory.map((item, index) => ({
                title: item.type === 'transfer' ? '物流转移' : '产品创建',
                description: (
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Paragraph>
                      <Text strong>时间：</Text> {moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </Paragraph>
                    {item.type === 'transfer' && (
                      <Paragraph>
                        <EnvironmentOutlined /> <Text strong>位置转移：</Text> {item.from} → {item.to}
                      </Paragraph>
                    )}
                    <Paragraph>
                      <BlockOutlined /> <Text strong>区块哈希：</Text> {item.block_hash}
                    </Paragraph>
                    <Paragraph>
                      <ApiOutlined /> <Text strong>交易哈希：</Text> {item.transaction_hash}
                    </Paragraph>
                  </Card>
                ),
                icon: item.type === 'transfer' ? <EnvironmentOutlined /> : <HistoryOutlined />,
              }))}
            />
            {isPaginated && traceData.total && traceData.total > pageSize && (
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={traceData.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条记录`}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="暂无溯源记录" />
        )}
      </Card>
    </div>
  );
};

export default ProductTrace; 