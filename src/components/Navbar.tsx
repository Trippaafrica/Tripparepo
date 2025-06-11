import {
  Box,
  Flex,
  Text,
  IconButton,
  Image,
  useColorModeValue,
  useColorMode,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
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
      bgGradient={useColorModeValue(
        'linear(to-r, white, gray.50)',
        'linear(to-r, brand.dark, #242451)'
      )}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'rgba(151, 132, 244, 0.2)')}
      backdropFilter="blur(10px)"
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.05)"
    >
      <Flex
        minH={'70px'}
        py={{ base: 3 }}
        px={{ base: 5 }}
        align={'center'}
        justify={'space-between'}
        maxW="container.lg"
        mx="auto"
      >
        <Flex
          flex={{ base: 1 }}
          justify="center"
          align="center"
          position="relative"
        >
          <HStack spacing={3} justify="center" w="100%">
            <Box 
              p={1.5} 
              borderRadius="full" 
              // bgGradient="linear(to-r, brand.primary, brand.secondary)" 
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image 
                src="/assets/Trippa.svg" 
                alt="Trippa Logo" 
                w={8} 
                h={8} 
                borderRadius="full"
              />
            </Box>
            <Text
              textAlign="center"
              fontWeight="bold"
              fontSize="xl"
              letterSpacing="tight"
              bgGradient={useColorModeValue(
                'linear(to-r, brand.primary, #6654c0)',
                'linear(to-r, brand.primary, brand.secondary)'
              )}
              bgClip="text"
            >
              {getPageTitle()}
            </Text>
          </HStack>
          
          {/* Color mode switch positioned absolutely on the right */}
          <IconButton
            position="absolute"
            right={0}
            size={'md'}
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            aria-label={'Toggle Color Mode'}
            onClick={toggleColorMode}
            variant="ghost"
            color={useColorModeValue('brand.primary', 'brand.secondary')}
            _hover={{
              bg: useColorModeValue('gray.100', 'rgba(151, 132, 244, 0.1)')
            }}
            borderRadius="full"
          />
        </Flex>
      </Flex>
    </Box>
  );
} 