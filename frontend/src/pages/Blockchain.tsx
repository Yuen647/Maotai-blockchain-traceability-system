import React, { useEffect, useState } from 'react';
import { Typography, Card, Table, Button, Space, Tag, Collapse, Spin, message, Statistic, Row, Col, Modal, Descriptions } from 'antd';
import { BlockOutlined, SyncOutlined, NodeIndexOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { blockchainAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface BlockchainStatus {
  chain_length: number;
  pending_transactions: number;
  is_valid: boolean;
}

interface Block {
  index: number;
  timestamp: number;
  transactions: any[];
  previous_hash: string;
  hash: string;
  nonce: number;
}

const Blockchain: React.FC = () => {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [miningLoading, setMiningLoading] = useState(false);
  const [viewBlockDetail, setViewBlockDetail] = useState<Block | null>(null);
  const [blockDetailVisible, setBlockDetailVisible] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statusResponse = await blockchainAPI.getStatus();
      const blocksResponse = await blockchainAPI.getAllBlocks();
      
      setStatus(statusResponse);
      setBlocks(blocksResponse);
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
      message.error('获取区块链数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMine = async () => {
    try {
      setMiningLoading(true);
      await blockchainAPI.mine();
      message.success('区块挖掘成功');
      fetchData(); // 重新获取区块链数据
    } catch (error) {
      console.error('Failed to mine block:', error);
      message.error('区块挖掘失败');
    } finally {
      setMiningLoading(false);
    }
  };

  const handleViewBlockDetail = (block: Block) => {
    setViewBlockDetail(block);
    setBlockDetailVisible(true);
  };

  const columns = [
    {
      title: '区块高度',
      dataIndex: 'index',
      key: 'index',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString(),
    },
    {
      title: '交易数量',
      dataIndex: 'transactions',
      key: 'transactions',
      render: (transactions: any[]) => transactions.length,
      width: 100,
    },
    {
      title: '前序哈希',
      dataIndex: 'previous_hash',
      key: 'previous_hash',
      render: (hash: string) => hash.substring(0, 10) + '...',
      width: 150,
    },
    {
      title: '当前哈希',
      dataIndex: 'hash',
      key: 'hash',
      render: (hash: string) => hash.substring(0, 10) + '...',
      width: 150,
    },
    {
      title: '工作量证明',
      dataIndex: 'nonce',
      key: 'nonce',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Block) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewBlockDetail(record)}
        >
          详情
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div>
      <Title level={2}>区块链信息</Title>
      <Paragraph>
        查看区块链的状态信息和区块详情，了解茅台酒从生产到销售的全过程。
      </Paragraph>

      <Spin spinning={loading}>
        {status && (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="区块链长度"
                  value={status.chain_length}
                  prefix={<BlockOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="待处理交易"
                  value={status.pending_transactions}
                  prefix={<NodeIndexOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="区块链状态"
                  value={status.is_valid ? '有效' : '无效'}
                  valueStyle={{ color: status.is_valid ? '#3f8600' : '#cf1322' }}
                  prefix={status.is_valid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button type="primary" icon={<SyncOutlined />} onClick={fetchData}>
            刷新数据
          </Button>
          
          {isAuthenticated && user?.role === 'admin' && (
            <Button 
              type="primary" 
              danger
              icon={<BlockOutlined />} 
              loading={miningLoading}
              onClick={handleMine}
            >
              挖掘新区块
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={blocks}
          rowKey="index"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />

        <Modal
          title={`区块 #${viewBlockDetail?.index} 详情`}
          open={blockDetailVisible}
          onCancel={() => setBlockDetailVisible(false)}
          footer={null}
          width={800}
        >
          {viewBlockDetail && (
            <>
              <Descriptions bordered column={1} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="区块高度">{viewBlockDetail.index}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(viewBlockDetail.timestamp * 1000).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="前序哈希">{viewBlockDetail.previous_hash}</Descriptions.Item>
                <Descriptions.Item label="当前哈希">{viewBlockDetail.hash}</Descriptions.Item>
                <Descriptions.Item label="工作量证明">{viewBlockDetail.nonce}</Descriptions.Item>
              </Descriptions>

              <Collapse defaultActiveKey={['1']}>
                <Panel header={`交易记录 (${viewBlockDetail.transactions.length})`} key="1">
                  {viewBlockDetail.transactions.length > 0 ? (
                    <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
                      {JSON.stringify(viewBlockDetail.transactions, null, 2)}
                    </pre>
                  ) : (
                    <Paragraph>该区块没有交易记录</Paragraph>
                  )}
                </Panel>
              </Collapse>
            </>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default Blockchain; 