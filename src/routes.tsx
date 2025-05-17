import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import Home from './pages/Home';
import DeliveryBooking from './pages/DeliveryBooking';
import BiddingPage from './pages/BiddingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OrderSummary from './pages/OrderSummary';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import OrderDetails from './pages/OrderDetails';
import ComingSoon from './pages/ComingSoon';

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
      {/* Adjust padding for mobile to account for bottom navigation */}
      <Box pt="16" pb={{ base: '24', md: '0' }}>
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
            path="/coming-soon/fuel"
            element={
              <ProtectedRoute>
                <ComingSoon />
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
          <Route
            path="/order/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Box>
      <BottomNavigation />
    </Box>
  );
} 