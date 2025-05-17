import {
  Box,
  Flex,
  Text,
  IconButton,
  Image,
  useColorModeValue,
  useColorMode,
  HStack,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import TrippaLogo from '../assets/Trippa.svg';

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't show navbar on login page
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }
  
  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Trippa';
    if (path === '/profile') return 'My Profile';
    if (path === '/orders') return 'My Orders';
    if (path.includes('/order-tracking')) return 'Order Tracking';
    if (path.includes('/delivery/')) {
      const type = path.split('/').pop();
      return `${type?.charAt(0).toUpperCase()}${type?.slice(1)} Delivery`;
    }
    if (path.includes('/coming-soon')) {
      const feature = path.split('/').pop();
      return `${feature?.charAt(0).toUpperCase()}${feature?.slice(1)} - Coming Soon`;
    }
    
    return 'Trippa';
  };
  
  return (
    <Box 
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      bg={useColorModeValue('white', 'gray.800')}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        align={'center'}
        justify={'space-between'}
      >
        <Flex
          flex={{ base: 1 }}
          justify="center"
          align="center"
          position="relative"
        >
          <HStack spacing={2} justify="center" w="100%">
            <Image src={TrippaLogo} alt="Trippa Logo" w={8} h={8} />
            <Text
              textAlign="center"
              fontWeight="bold"
              fontSize="xl"
              color={useColorModeValue('brand.primary', 'brand.secondary')}
            >
              {getPageTitle()}
            </Text>
          </HStack>
          
          {/* Color mode switch positioned absolutely on the right */}
          <IconButton
            position="absolute"
            right={0}
            size={'sm'}
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            aria-label={'Toggle Color Mode'}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>
      </Flex>
    </Box>
  );
} 