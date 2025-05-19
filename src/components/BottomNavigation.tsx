import { Box, Flex, Icon, Text, useColorModeValue, Center } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaClipboardList, FaUser } from 'react-icons/fa';

const BottomNavigation = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 26, 46, 0.95)');
  const borderColor = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');
  const activeColor = useColorModeValue('brand.primary', 'brand.secondary');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const activeBg = useColorModeValue('rgba(151, 132, 244, 0.1)', 'rgba(153, 255, 0, 0.1)');

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
      backdropFilter="blur(16px)"
      display={{ base: 'block', md: 'none' }} // Show only on mobile
      boxShadow="0 -4px 20px rgba(0, 0, 0, 0.05)"
      borderRadius="20px 20px 0 0"
      overflow="hidden"
      pb="env(safe-area-inset-bottom)"
    >
      <Flex justify="space-around" py={2} px={2}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Flex
              key={item.path}
              as={Link}
              to={item.path}
              direction="column"
              align="center"
              justify="center"
              flex={1}
              py={2}
              mx={1}
              color={active ? activeColor : inactiveColor}
              bg={active ? activeBg : 'transparent'}
              borderRadius="xl"
              _hover={{ color: activeColor, bg: activeBg }}
              transition="all 0.3s"
              height="60px"
              position="relative"
            >
              <Center 
                position="relative"
                mb={active ? 1 : 0}
                transform={active ? 'translateY(-2px)' : 'none'}
                transition="transform 0.3s"
              >
                <Icon 
                  as={item.icon} 
                  boxSize={active ? "24px" : "20px"} 
                  transition="all 0.3s"
                />
                {active && (
                  <Box
                    position="absolute"
                    bottom="-8px"
                    left="50%"
                    transform="translateX(-50%)"
                    width="4px"
                    height="4px"
                    borderRadius="full"
                    bg={activeColor}
                  />
                )}
              </Center>
              <Text 
                fontSize="xs" 
                fontWeight={active ? 'bold' : 'medium'}
                transform={active ? 'translateY(-2px)' : 'none'}
                transition="transform 0.3s"
                opacity={active ? 1 : 0.8}
              >
                {item.label}
              </Text>
              {active && (
                <Box
                  position="absolute"
                  bottom="0"
                  left="50%"
                  width="20px"
                  height="3px"
                  borderRadius="full"
                  bg={activeColor}
                  transform="translateX(-50%)"
                />
              )}
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default BottomNavigation; 