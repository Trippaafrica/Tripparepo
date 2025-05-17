import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaClipboardList, FaUser } from 'react-icons/fa';

const BottomNavigation = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'rgba(26, 26, 46, 0.9)');
  const borderColor = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');
  const activeColor = useColorModeValue('brand.primary', 'brand.secondary');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/orders', label: 'Orders', icon: FaClipboardList },
    { path: '/profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex={10}
      bg={bgColor}
      borderTop="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      display={{ base: 'block', md: 'none' }} // Show only on mobile
    >
      <Flex justify="space-around" py={2}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Flex
              key={item.path}
              as={Link}
              to={item.path}
              direction="column"
              align="center"
              flex={1}
              py={2}
              color={active ? activeColor : inactiveColor}
              _hover={{ color: activeColor }}
              transition="all 0.2s"
            >
              <Icon as={item.icon} boxSize="24px" mb={1} />
              <Text fontSize="xs" fontWeight={active ? 'bold' : 'normal'}>
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default BottomNavigation; 