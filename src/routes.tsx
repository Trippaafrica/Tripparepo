import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DeliveryBooking from './pages/DeliveryBooking';
import BiddingPage from './pages/BiddingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OrderSummary from './pages/OrderSummary';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Box minH="100vh">
      <Navbar />
      <Box pt="16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/delivery/:type"
            element={
              <ProtectedRoute>
                <DeliveryBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bidding/:requestId"
            element={
              <ProtectedRoute>
                <BiddingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-summary/:requestId/:bidId"
            element={
              <ProtectedRoute>
                <OrderSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Box>
    </Box>
  );
} 