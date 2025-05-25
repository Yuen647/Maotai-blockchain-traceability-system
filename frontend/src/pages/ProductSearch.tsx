import React, { useState } from 'react';
import { Typography, Form, Input, Button, Table, Space, Tag, DatePicker, message, Card, Spin } from 'antd';
import { SearchOutlined, EyeOutlined, LineChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;

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

const ProductSearch: React.FC = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (values: any) => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.current,
        per_page: pagination.pageSize,
      };

      if (values.name) {
        params.name = values.name;
      }

      if (values.batch_number) {
        params.batch_number = values.batch_number;
      }

      if (values.production_date && values.production_date[0] && values.production_date[1]) {
        params.production_date_from = values.production_date[0].format('YYYY-MM-DD');
        params.production_date_to = values.production_date[1].format('YYYY-MM-DD');
      }

      const response = await productsAPI.searchProducts(params) as ProductsPagination;
      setProducts(response.products);
      setPagination({
        ...pagination,
        total: response.total,
      });
    } catch (error) {
      message.error('搜索产品失败');
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setProducts([]);
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
    form.submit();
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
      <Title level={2}>产品搜索</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
        >
          <Form.Item name="name" style={{ minWidth: '200px', flexGrow: 1 }}>
            <Input placeholder="产品名称" prefix={<SearchOutlined />} allowClear />
          </Form.Item>
          
          <Form.Item name="batch_number" style={{ minWidth: '200px', flexGrow: 1 }}>
            <Input placeholder="批次号" allowClear />
          </Form.Item>
          
          <Form.Item name="production_date" style={{ minWidth: '260px', flexGrow: 1 }}>
            <RangePicker 
              placeholder={['生产日期(起)', '生产日期(止)']}
              format="YYYY-MM-DD"
            />
          </Form.Item>
          
          <Form.Item style={{ marginRight: 0 }}>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Button onClick={handleReset}>重置</Button>
          </Form.Item>
        </Form>
      </Card>

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
          locale={{ emptyText: '暂无数据，请进行搜索' }}
        />
      </Spin>
    </div>
  );
};

export default ProductSearch; 