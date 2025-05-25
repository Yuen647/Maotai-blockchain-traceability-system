import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import {
  HomeOutlined,
  DatabaseOutlined,
  BlockOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const onMenuClick = (key: string) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Title level={5} style={{ color: 'white', margin: 0 }}>
            {collapsed ? '茅台溯源' : '茅台酒溯源系统'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          onClick={({ key }) => onMenuClick(key)}
          items={[
            {
              key: '/',
              icon: <HomeOutlined />,
              label: '首页',
            },
            {
              key: '/products',
              icon: <DatabaseOutlined />,
              label: '产品管理',
            },
            {
              key: '/products/search',
              icon: <SearchOutlined />,
              label: '产品搜索',
            },
            {
              key: '/blockchain',
              icon: <BlockOutlined />,
              label: '区块链信息',
            },
            ...(isAuthenticated && user?.role === 'admin' ? [
              {
                key: '/users',
                icon: <UserOutlined />,
                label: '用户管理',
              },
            ] : []),
            ...(isAuthenticated && (user?.role === 'admin' || user?.role === 'manufacturer') ? [
              {
                key: '/products/create',
                icon: <PlusOutlined />,
                label: '创建产品',
              },
            ] : []),
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '16px' }}>
          {!isAuthenticated ? (
            <>
              <Button type="primary" onClick={() => navigate('/login')} icon={<LoginOutlined />} style={{ marginRight: 8 }}>
                登录
              </Button>
              <Button onClick={() => navigate('/register')}>
                注册
              </Button>
            </>
          ) : (
            <>
              <span style={{ marginRight: 16 }}>
                欢迎, {user?.username} ({user?.role})
              </span>
              <Button 
                type="primary" 
                danger 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                icon={<LogoutOutlined />}
              >
                退出登录
              </Button>
            </>
          )}
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 