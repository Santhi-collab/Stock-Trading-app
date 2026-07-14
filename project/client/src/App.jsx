import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ProtectedLayout, AdminLayout } from './components/RouteGuards';

import Landing from './pages/Landing';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import StockChart from './pages/StockChart';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminHome from './pages/AdminHome';
import Users from './pages/Users';
import AllOrders from './pages/AllOrders';
import AllTransactions from './pages/AllTransactions';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing mode="landing" />} />
        <Route path="/login" element={<Landing mode="login" />} />
        <Route path="/register" element={<Landing mode="register" />} />

        <Route
          path="/home"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/stocks/:symbol"
          element={
            <ProtectedLayout>
              <StockChart />
            </ProtectedLayout>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedLayout>
              <Portfolio />
            </ProtectedLayout>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedLayout>
              <History />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          }
        />

        <Route
          path="/admin/home"
          element={
            <AdminLayout>
              <AdminHome />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <AllOrders />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <AdminLayout>
              <AllTransactions />
            </AdminLayout>
          }
        />

        <Route path="*" element={<Landing mode="landing" />} />
      </Routes>

      <ToastContainer position="bottom-right" theme="dark" autoClose={3200} hideProgressBar />
    </>
  );
}
