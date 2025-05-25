import React, { useEffect, useState } from 'react';
import { Typography, Table, Button, Space, Tag, message, Input, Spin } from 'antd';
import { SearchOutlined, EyeOutlined, LineChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import moment from 'moment';

const { Title } = Typography;
const { Search } = Input;

interface Product {
  id: string;
  name: string;
  batch_number: string;
  production_date: string;
  manufacturer: string;
  created_at: string;
}

interface ProductsPagination {
  total: number;
  pages: number;
  current_page: number;
  products: Product[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.current,
        per_page: pagination.pageSize,
      };

      if (searchTerm) {
        params.name = searchTerm;
      }

      const response = await productsAPI.searchProducts(params) as ProductsPagination;
      setProducts(response.products);
      setPagination({
        ...pagination,
        total: response.total,
      });
    } catch (error) {
      message.error('获取产品列表失败');
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => <Link to={`/products/${record.id}`}>{text}</Link>,
    },
    {
      title: '批次号',
      dataIndex: 'batch_number',
      key: 'batch_number',
    },
    {
      title: '生产日期',
      dataIndex: 'production_date',
      key: 'production_date',
      render: (date: string) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: '生产商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: '上链时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="green">已上链</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="small">
          <Link to={`/products/${record.id}`}>
            <Button type="primary" size="small" icon={<EyeOutlined />}>详情</Button>
          </Link>
          <Link to={`/products/${record.id}/trace`}>
            <Button size="small" icon={<LineChartOutlined />}>溯源</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>产品列表</Title>
        <Search
          placeholder="搜索产品名称"
          onSearch={handleSearch}
          style={{ width: 250 }}
          enterButton={<SearchOutlined />}
          allowClear
        />
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
        />
      </Spin>
    </div>
  );
};

export default ProductList; 