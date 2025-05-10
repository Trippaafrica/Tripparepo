import {
  Box,
  Button,
  Container,
  HStack,
  Icon,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaTruck, FaUser, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'rgba(26, 26, 46, 0.8)');
  const borderColor = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Box
      as="nav"
      position="fixed"
      w="100%"
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <HStack justify="space-between" h="16">
          <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <HStack spacing={2}>
              <Icon as={FaTruck} w={6} h={6} color="brand.secondary" />
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, brand.secondary, brand.primary)"
                bgClip="text"
              >
                Trippa
              </Text>
            </HStack>
          </ChakraLink>

          <HStack spacing={4}>
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  leftIcon={<Icon as={FaUser} />}
                  _hover={{
                    bg: 'rgba(57, 255, 20, 0.1)',
                  }}
                >
                  {user.email}
                </MenuButton>
                <MenuList bg={bgColor} borderColor={borderColor}>
                  <MenuItem
                    as={RouterLink}
                    to="/orders"
                    icon={<Icon as={FaClipboardList} />}
                    _hover={{
                      bg: 'rgba(57, 255, 20, 0.1)',
                    }}
                  >
                    My Orders
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={FaSignOutAlt} />}
                    onClick={handleSignOut}
                    _hover={{
                      bg: 'rgba(57, 255, 20, 0.1)',
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  _hover={{
                    bg: 'rgba(57, 255, 20, 0.1)',
                  }}
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/signup"
                  colorScheme="brand"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(57, 255, 20, 0.3)',
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
};

export default Navbar; 