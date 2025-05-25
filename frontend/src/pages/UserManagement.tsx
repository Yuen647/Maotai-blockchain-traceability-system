import React, { useEffect, useState } from 'react';
import { Typography, Table, Button, Space, Tag, message, Spin, Modal, Form, Input, Select, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { userAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface User {
  user_id: number;
  username: string;
  role: string;
  organization: string;
  created_at: string;
  is_active?: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      message.error('只有管理员可以访问用户管理页面');
    }
  }, [user, navigate]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    form.resetFields();
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
      organization: user.organization,
      is_active: user.is_active,
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      if (user?.user_id === userId) {
        message.error('不能删除自己的账号！');
        return;
      }
      
      await userAPI.deleteUser(userId);
      message.success('删除用户成功');
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      message.error(error.response?.data?.message || '删除用户失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (editingUser) {
        // Update existing user
        await userAPI.updateUser(editingUser.user_id, {
          role: values.role,
          organization: values.organization,
          password: values.password,
          is_active: values.is_active,
        });
        message.success('更新用户成功');
      } else {
        // Create new user
        await authAPI.register(values);
        message.success('创建用户成功');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.error(`Failed to ${editingUser ? 'update' : 'create'} user:`, error);
      message.error(error.response?.data?.message || `${editingUser ? '更新' : '创建'}用户失败`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'default';
        if (role === 'admin') color = 'red';
        if (role === 'manufacturer') color = 'green';
        if (role === 'logistics') color = 'blue';
        if (role === 'retailer') color = 'purple';
        
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: '组织',
      dataIndex: 'organization',
      key: 'organization',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '激活' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.user_id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              disabled={user?.user_id === record.user_id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>用户管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddUser}
        >
          添加用户
        </Button>
      </div>
      
      <Paragraph>
        管理系统用户，包括管理员、制造商、物流方和零售商。
      </Paragraph>

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="user_id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={editingUser ? "编辑用户" : "添加用户"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              disabled={!!editingUser}
            />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password placeholder="密码" />
            </Form.Item>
          )}

          {editingUser && (
            <Form.Item
              name="password"
              label="新密码"
              help="如果不需要修改密码，请留空"
            >
              <Input.Password placeholder="新密码（可选）" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色!' }]}
          >
            <Select placeholder="选择角色">
              <Option value="admin">管理员</Option>
              <Option value="manufacturer">制造商</Option>
              <Option value="logistics">物流方</Option>
              <Option value="retailer">零售商</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="organization"
            label="组织"
          >
            <Input placeholder="所属组织（可选）" />
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="is_active"
              label="账号状态"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>激活</Option>
                <Option value={false}>禁用</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {editingUser ? "更新用户" : "创建用户"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 