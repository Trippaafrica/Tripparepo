import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { Box, useColorModeValue, Icon, Text, VStack, HStack, ChakraProvider } from '@chakra-ui/react';
import { FaHome, FaShoppingCart, FaUser } from 'react-icons/fa';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import ComingSoon from './pages/ComingSoon';
import DeliveryBooking from './pages/DeliveryBooking';
import OrderDetails from './pages/OrderDetails';
import BiddingPage from './pages/BiddingPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import PaymentPage from './pages/PaymentPage';
import TrackingPage from './pages/TrackingPage';

// Components
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show nothing while checking authentication
  if (loading) {
    return null;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Mobile navigation item component
const NavItem = ({ icon, label, to, isActive }: { icon: React.ElementType, label: string, to: string, isActive: boolean }) => {
  const activeColor = useColorModeValue('brand.primary', 'brand.secondary');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <VStack 
      as={RouterLink} 
      to={to} 
      spacing={0.5} 
      color={isActive ? activeColor : inactiveColor}
      flex={1}
      align="center"
      justify="center"
      py={2}
    >
      <Icon as={icon} boxSize={5} />
      <Text fontSize="xs" fontWeight={isActive ? "bold" : "normal"}>{label}</Text>
    </VStack>
  );
};

// Mobile bottom navigation component
const BottomNavigation = () => {
  const { user } = useAuth();
  const pathname = window.location.pathname;
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Don't show navigation on login/register pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <Box 
      position="fixed" 
      bottom={0} 
      left={0} 
      right={0} 
      zIndex={10}
      bg={bg}
      borderTop="1px solid"
      borderColor={borderColor}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
    >
      <HStack justify="space-around" px={1}>
        <NavItem 
          icon={FaHome} 
          label="Home" 
          to="/" 
          isActive={pathname === '/'} 
        />
        <NavItem 
          icon={FaShoppingCart} 
          label="Orders" 
          to="/orders" 
          isActive={pathname === '/orders' || pathname.includes('/order')} 
        />
        <NavItem 
          icon={FaUser} 
          label="Profile" 
          to={user ? "/profile" : "/login"} 
          isActive={pathname === '/profile' || pathname === '/login'} 
        />
      </HStack>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Box 
            minH="100vh" 
            pb="60px" // Space for bottom navigation
            position="relative"
            maxW="1500px" // Mobile app width constraint
            mx="auto"    // Center the app
            boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
          >
            <Navbar />
            <Box as="main" px={4} py={2}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/coming-soon/:serviceType" element={<ComingSoon />} />
                
                {/* Delivery routes */}
                <Route path="/delivery/:type" element={<ProtectedRoute><DeliveryBooking /></ProtectedRoute>} />
                <Route path="/bidding/:requestId" element={<ProtectedRoute><BiddingPage /></ProtectedRoute>} />
                <Route path="/order-summary/:requestId/:bidId" element={<ProtectedRoute><OrderSummaryPage /></ProtectedRoute>} />
                <Route path="/payment/:requestId/:bidId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                <Route path="/tracking/:requestId" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
                
                {/* Protected routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              </Routes>
            </Box>
            <BottomNavigation />
          </Box>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
