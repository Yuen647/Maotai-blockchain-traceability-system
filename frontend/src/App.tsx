import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ProductTrace from './pages/ProductTrace';
import ProductSearch from './pages/ProductSearch';
import CreateProduct from './pages/CreateProduct';
import Blockchain from './pages/Blockchain';
import UserManagement from './pages/UserManagement';

// 保护需要登录的路由
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 检查角色权限
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/search" element={<ProductSearch />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/:id/trace" element={<ProductTrace />} />
              <Route 
                path="products/create" 
                element={
                  <ProtectedRoute roles={['admin', 'manufacturer']}>
                    <CreateProduct />
                  </ProtectedRoute>
                } 
              />
              <Route path="blockchain" element={<Blockchain />} />
              <Route 
                path="users" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
