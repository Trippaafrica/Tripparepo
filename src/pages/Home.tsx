import { Box, Container, Heading, SimpleGrid, VStack, Text, Button, Icon, useColorModeValue, Image, Card, CardBody, Avatar, HStack, Flex, Badge, Spinner } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMotorcycle, FaTruck, FaTruckMoving, FaGasPump, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import OrderTracking from '../components/OrderTracking';

const deliveryTypes = [
  {
    type: 'bike',
    title: 'Bike Delivery',
    description: 'Fast for small packages',
    icon: FaMotorcycle,
    color: 'green.400',
    time: '30-60 mins',
    link: '/delivery/bike'
  },
  {
    type: 'truck',
    title: 'Truck Delivery',
    description: 'For large items',
    icon: FaTruck,
    color: 'blue.400',
    time: '2-4 hours',
    link: '/delivery/truck'
  },
  {
    type: 'van',
    title: 'Van Delivery',
    description: 'Medium-sized deliveries',
    icon: FaTruckMoving,
    color: 'purple.400',
    time: '1-2 hours',
    link: '/delivery/van'
  },
  {
    type: 'fuel',
    title: 'Fuel Delivery',
    description: 'Emergency fuel service',
    icon: FaGasPump,
    color: 'orange.400',
    time: '30-45 mins',
    link: '/coming-soon/fuel'
  },
];

const recentLocations = [
  '123 Main Street, Lagos',
  'Victoria Island, Lagos',
  'Ikeja City Mall, Lagos',
  'Lekki Phase 1, Lagos',
];

interface Order {
  id: string;
  status: string;
  pickup_code?: string;
  dropoff_code?: string;
  pickup_location?: string;
  dropoff_location?: string;
  pickup_address?: string;
  dropoff_address?: string;
  created_at: string;
}

const Home = () => {
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'rgba(26, 26, 46, 0.8)');
  const cardBorder = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchActiveOrders();
    }
  }, [user]);

  const fetchActiveOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['pending', 'accepted', 'picked_up', 'in_transit'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched active orders:', data);
      setActiveOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching active orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box mb={20}>
      {/* Welcome Section */}
      <Box 
        bgGradient="linear(to-r, brand.dark, brand.primary)" 
        pt={8} 
        pb={12}
        px={4}
        borderBottomRadius="3xl"
      >
        <Container maxW="container.md">
          <VStack spacing={6} align="stretch">
            {user && (
              <HStack>
                <Avatar 
                  size="md" 
                  name={user?.email || 'User'} 
                  src="" 
                  bg="brand.secondary"
                  color="white"
                />
                <VStack align="start" spacing={0}>
                  <Text color="white" fontSize="sm">Welcome back,</Text>
                  <Heading size="md" color="white">{user?.email?.split('@')[0] || 'User'}</Heading>
                </VStack>
              </HStack>
            )}

            <Card bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(8px)" border="1px solid rgba(255, 255, 255, 0.2)">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Text color="white" fontWeight="medium">Where are you sending to?</Text>
                  <Button 
                    as={RouterLink} 
                    to="/delivery/bike" 
                    rightIcon={<FaArrowRight />} 
                    colorScheme="brand" 
                    size="lg"
                    justifyContent="space-between"
                  >
                    Choose delivery type
                  </Button>
                  
                  {recentLocations.length > 0 && (
                    <Box>
                      <Text color="gray.200" fontSize="sm" mb={2}>Recent locations</Text>
                      <VStack spacing={2} align="stretch">
                        {recentLocations.map((location, index) => (
                          <HStack 
                            key={index}
                            bg="rgba(255, 255, 255, 0.1)" 
                            p={2} 
                            borderRadius="md"
                            spacing={3}
                            as={Button}
                            variant="ghost"
                            justifyContent="flex-start"
                            color="white"
                            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                          >
                            <Icon as={FaMapMarkerAlt} color="brand.secondary" />
                            <Text fontSize="sm" isTruncated>{location}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          {/* Delivery Types Section */}
          <Box width="100%">
            <Heading size="md" mb={4} color={textColor}>Delivery Options</Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} width="100%">
              {deliveryTypes.map(({ type, title, description, icon, color, time, link }) => (
                <Card
                  key={type}
                  as={RouterLink}
                  to={link}
                  bg={cardBg}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={cardBorder}
                  transition="all 0.3s"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(57, 255, 20, 0.1)',
                    borderColor: 'brand.secondary',
                  }}
                  overflow="hidden"
                >
                  <CardBody p={4}>
                    <VStack spacing={2} align="center">
                      <Flex
                        bg={`${color}20`}
                        color={color}
                        w={12}
                        h={12}
                        borderRadius="full"
                        justify="center"
                        align="center"
                        mb={2}
                      >
                        <Icon as={icon} w={6} h={6} />
                      </Flex>
                      <Heading size="sm" color={textColor} textAlign="center">
                        {title}
                      </Heading>
                      <Text color={descriptionColor} fontSize="xs" textAlign="center">
                        {description}
                      </Text>
                      <Badge colorScheme="green" fontSize="xs">{time}</Badge>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Active Orders Section - shown only if user has active orders */}
          {user && (
            <Box width="100%">
              <HStack justifyContent="space-between" mb={4}>
                <Heading size="md" color={textColor}>Active Orders</Heading>
                <Button 
                  as={RouterLink} 
                  to="/orders" 
                  variant="ghost" 
                  colorScheme="brand" 
                  size="sm" 
                  rightIcon={<FaArrowRight />}
                >
                  View All
                </Button>
              </HStack>
              
              {isLoading ? (
                <VStack py={4}>
                  <Spinner size="lg" color="brand.secondary" />
                  <Text>Loading orders...</Text>
                </VStack>
              ) : activeOrders.length === 0 ? (
                <Card bg={cardBg} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
                  <CardBody p={4}>
                    <VStack spacing={4} align="center">
                      <Text color={descriptionColor}>No active orders found</Text>
                      <Button 
                        as={RouterLink} 
                        to="/delivery/bike" 
                        size="sm" 
                        colorScheme="brand"
                      >
                        Start a Delivery
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <VStack spacing={4} align="stretch">
                  {activeOrders.slice(0, 3).map(order => (
                    <Box 
                      key={order.id} 
                      as={RouterLink} 
                      to={`/order/${order.id}`}
                      _hover={{ textDecoration: 'none' }}
                    >
                      <OrderTracking order={order} />
                    </Box>
                  ))}
                  {activeOrders.length > 3 && (
                    <Button 
                      as={RouterLink} 
                      to="/orders" 
                      size="sm" 
                      colorScheme="brand"
                      variant="outline"
                      alignSelf="center"
                    >
                      View {activeOrders.length - 3} more active orders
                    </Button>
                  )}
                </VStack>
              )}
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Home; 