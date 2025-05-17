import { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Avatar,
  Divider,
  Button,
  useColorModeValue,
  HStack,
  Icon,
  Switch,
  FormControl,
  FormLabel,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FaUser, FaBell, FaShieldAlt, FaQuestion, FaSignOutAlt, FaMoon } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.900');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: 'Signed out successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error signing out',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const settingsSections = [
    {
      title: 'Appearance',
      icon: FaMoon,
      items: [
        {
          label: 'Dark Mode',
          component: (
            <Switch 
              colorScheme="brand" 
              isChecked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: FaBell,
      items: [
        {
          label: 'Push Notifications',
          component: (
            <Switch 
              colorScheme="brand" 
              isChecked={notifications} 
              onChange={() => setNotifications(!notifications)}
            />
          ),
        },
      ],
    },
    {
      title: 'Security',
      icon: FaShieldAlt,
      items: [
        {
          label: 'Change Password',
          component: (
            <Button size="sm" variant="outline" colorScheme="brand">
              Change
            </Button>
          ),
        },
      ],
    },
    {
      title: 'Support',
      icon: FaQuestion,
      items: [
        {
          label: 'Help Center',
          component: (
            <Button size="sm" variant="outline" colorScheme="brand">
              Visit
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <Container maxW="container.md" py={8} mb={20}>
      <VStack spacing={8} align="stretch">
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="center">
              <Avatar 
                size="xl" 
                name={user?.email || 'User'} 
                src="" 
                bg="brand.secondary"
                color="white"
              />
              <VStack spacing={1}>
                <Heading size="md">{user?.email?.split('@')[0] || 'User'}</Heading>
                <Text color="gray.500">{user?.email}</Text>
              </VStack>
              <Button 
                leftIcon={<FaUser />} 
                colorScheme="brand" 
                variant="outline" 
                size="sm"
              >
                Edit Profile
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {settingsSections.map((section) => (
          <Card key={section.title} bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Icon as={section.icon} color="brand.secondary" />
                  <Heading size="sm">{section.title}</Heading>
                </HStack>
                <Divider />
                {section.items.map((item) => (
                  <HStack key={item.label} justify="space-between">
                    <Text>{item.label}</Text>
                    {item.component}
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        ))}

        <Button
          leftIcon={<FaSignOutAlt />}
          colorScheme="red"
          variant="outline"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </VStack>
    </Container>
  );
};

export default Profile; 