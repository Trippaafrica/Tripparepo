import { Box, Container, Heading, SimpleGrid, VStack, Text, Button, Icon, useColorModeValue, Image, Card, CardBody, Avatar, HStack, Flex, Badge, Spinner, Center } from '@chakra-ui/react';
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
  const [activeLocationIndex, setActiveLocationIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchActiveOrders();
    }
  }, [user]);

  const fetchActiveOrders = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        setActiveOrders([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'accepted', 'picked_up', 'in_transit'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched active orders:', data);
      
      // Type-check and transform data to match Order interface
      const typedOrders = data?.map(order => ({
        id: order.id as string,
        status: order.status as string,
        pickup_code: order.pickup_code as string | undefined,
        dropoff_code: order.dropoff_code as string | undefined,
        pickup_location: order.pickup_location as string | undefined,
        dropoff_location: order.dropoff_location as string | undefined,
        pickup_address: order.pickup_address as string | undefined,
        dropoff_address: order.dropoff_address as string | undefined,
        created_at: order.created_at as string
      })) || [];
      
      setActiveOrders(typedOrders);
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
        bgGradient="linear(to-br, brand.dark, #312870)" 
        pt={10} 
        pb={14}
        px={4}
        borderBottomRadius="3xl"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative elements */}
        <Box 
          position="absolute" 
          top="-20%" 
          right="-10%" 
          w="300px" 
          h="300px" 
          bg="rgba(151, 132, 244, 0.1)" 
          borderRadius="full" 
          filter="blur(40px)" 
        />
        <Box 
          position="absolute" 
          bottom="-30%" 
          left="-15%" 
          w="250px" 
          h="250px" 
          bg="rgba(153, 255, 0, 0.1)" 
          borderRadius="full" 
          filter="blur(50px)" 
        />
        
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            {user && (
              <HStack spacing={4}>
                <Avatar 
                  size="md" 
                  name={user?.email || 'User'} 
                  src="" 
                  bg="brand.secondary"
                  color="brand.dark"
                  fontWeight="bold"
                  boxShadow="0 0 0 3px rgba(153, 255, 0, 0.3)"
                />
                <VStack align="start" spacing={0}>
                  <Text color="gray.300" fontSize="sm">Welcome back,</Text>
                  <Heading 
                    size="md" 
                    color="white"
                    bgGradient="linear(to-r, white, brand.secondary)"
                    bgClip="text"
                  >
                    {user?.email?.split('@')[0] || 'User'}
                  </Heading>
                </VStack>
              </HStack>
            )}

            <Card 
              bg="rgba(255, 255, 255, 0.07)" 
              backdropFilter="blur(12px)" 
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              boxShadow="0 8px 32px rgba(31, 38, 135, 0.2)"
            >
              <CardBody p={5}>
                <VStack spacing={5} align="stretch">
                  <Text 
                    color="white" 
                    fontWeight="medium" 
                    fontSize="lg"
                    letterSpacing="wide"
                  >
                    Where are you sending to?
                  </Text>
                  
                  <Button 
                    as={RouterLink} 
                    to="/delivery/bike" 
                    rightIcon={<FaArrowRight />} 
                    colorScheme="brand" 
                    size="lg"
                    justifyContent="space-between"
                    bgGradient="linear(to-r, brand.primary, brand.secondary)"
                    color="brand.dark"
                    fontWeight="bold"
                    borderRadius="xl"
                    py={6}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(153, 255, 0, 0.2)',
                    }}
                  >
                    Choose delivery type
                  </Button>
                  
                  {recentLocations.length > 0 && (
                    <Box>
                      <Text color="gray.300" fontSize="sm" mb={3} fontWeight="medium">Recent locations</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        {recentLocations.map((location, index) => {
                          const isActive = activeLocationIndex === index;
                          return (
                            <HStack 
                              key={index}
                              bg={isActive ? "rgba(153, 255, 0, 0.15)" : "rgba(255, 255, 255, 0.07)"}
                              p={3} 
                              borderRadius="lg"
                              spacing={3}
                              as={Button}
                              variant="ghost"
                              justifyContent="flex-start"
                              color="white"
                              onClick={() => setActiveLocationIndex(index)}
                              _hover={{ 
                                bg: 'rgba(255, 255, 255, 0.15)',
                                borderColor: 'brand.secondary',
                                boxShadow: '0 0 0 1px rgba(153, 255, 0, 0.3)'
                              }}
                              _focus={{
                                outline: "none",
                                boxShadow: "none"
                              }}
                              border={isActive ? "1px solid rgba(153, 255, 0, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)"}
                              boxShadow={isActive ? "0 0 10px rgba(153, 255, 0, 0.2)" : "none"}
                              transform={isActive ? "translateY(-2px)" : "none"}
                              transition="all 0.2s ease"
                            >
                              <Center 
                                bg={isActive ? "rgba(153, 255, 0, 0.3)" : "rgba(153, 255, 0, 0.2)"}
                                w={8} 
                                h={8} 
                                borderRadius="full"
                                flexShrink={0}
                              >
                                <Icon 
                                  as={FaMapMarkerAlt} 
                                  color="brand.secondary" 
                                  boxSize={isActive ? "5" : "4"}
                                  transition="all 0.2s"
                                />
                              </Center>
                              <Text 
                                fontSize="sm" 
                                isTruncated
                                fontWeight={isActive ? "bold" : "normal"}
                              >
                                {location}
                              </Text>
                              {isActive && (
                                <Box
                                  position="absolute"
                                  right={3}
                                  width="3px"
                                  height="70%"
                                  bg="brand.secondary"
                                  borderRadius="full"
                                />
                              )}
                            </HStack>
                          );
                        })}
                      </SimpleGrid>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.md" py={10}>
        <VStack spacing={10}>
          {/* Delivery Types Section */}
          <Box width="100%">
            <Heading 
              size="md" 
              mb={5} 
              color={textColor}
              bgGradient={useColorModeValue(
                'linear(to-r, brand.primary, #6654c0)',
                'linear(to-r, brand.primary, brand.secondary)'
              )}
              bgClip="text"
              position="relative" 
              display="inline-block"
              pb={2}
              _after={{
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '3px',
                bg: 'brand.secondary',
                borderRadius: 'full'
              }}
            >
              Delivery Options
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5} width="100%">
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
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 25px rgba(57, 255, 20, 0.15)',
                    borderColor: 'brand.secondary',
                  }}
                  overflow="hidden"
                  position="relative"
                >
                  <Box
                    position="absolute"
                    top="-20px"
                    right="-20px"
                    width="80px"
                    height="80px"
                    bg={`${color}10`}
                    borderRadius="full"
                    zIndex={0}
                  />
                  <CardBody p={4}>
                    <VStack spacing={3} align="center" position="relative" zIndex={1}>
                      <Flex
                        bg={`${color}20`}
                        color={color}
                        w={14}
                        h={14}
                        borderRadius="full"
                        justify="center"
                        align="center"
                        mb={2}
                        boxShadow={`0 4px 12px ${color}20`}
                      >
                        <Icon as={icon} w={6} h={6} />
                      </Flex>
                      <Heading size="sm" color={textColor} textAlign="center" fontWeight="bold">
                        {title}
                      </Heading>
                      <Text color={descriptionColor} fontSize="xs" textAlign="center">
                        {description}
                      </Text>
                      <Badge 
                        bg={`${color}20`} 
                        color={color} 
                        fontSize="xs" 
                        px={2} 
                        py={1} 
                        borderRadius="full"
                        fontWeight="medium"
                      >
                        {time}
                      </Badge>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Active Orders Section - shown only if user has active orders */}
          {user && (
            <Box width="100%">
              <HStack justifyContent="space-between" mb={5} alignItems="center">
                <Heading 
                  size="md" 
                  color={textColor}
                  bgGradient={useColorModeValue(
                    'linear(to-r, brand.primary, #6654c0)',
                    'linear(to-r, brand.primary, brand.secondary)'
                  )}
                  bgClip="text"
                  position="relative" 
                  display="inline-block"
                  pb={2}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '40px',
                    height: '3px',
                    bg: 'brand.secondary',
                    borderRadius: 'full'
                  }}
                >
                  Active Orders
                </Heading>
                <Button 
                  as={RouterLink} 
                  to="/orders" 
                  variant="ghost" 
                  colorScheme="brand" 
                  size="sm" 
                  rightIcon={<FaArrowRight />}
                  fontWeight="medium"
                  _hover={{
                    bg: 'rgba(151, 132, 244, 0.1)',
                    transform: 'translateX(2px)'
                  }}
                >
                  View All
                </Button>
              </HStack>
              
              {isLoading ? (
                <VStack py={6}>
                  <Spinner size="lg" color="brand.secondary" thickness="3px" speed="0.8s" />
                  <Text mt={3} color={descriptionColor}>Loading orders...</Text>
                </VStack>
              ) : activeOrders.length === 0 ? (
                <Card 
                  bg={useColorModeValue('gray.50', 'rgba(26, 26, 46, 0.6)')} 
                  borderRadius="xl" 
                  p={6} 
                  textAlign="center"
                  borderColor={cardBorder}
                  borderWidth="1px"
                >
                  <VStack spacing={4}>
                    <Icon as={FaTruck} w={12} h={12} color="gray.400" />
                    <Heading size="sm" color={textColor}>No active orders</Heading>
                    <Text color={descriptionColor} fontSize="sm">
                      You don't have any active deliveries right now.
                    </Text>
                    <Button 
                      as={RouterLink} 
                      to="/delivery/bike" 
                      colorScheme="brand" 
                      size="sm"
                      variant="outline"
                      mt={2}
                    >
                      Start a delivery
                    </Button>
                  </VStack>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {activeOrders.map(order => (
                    <Box key={order.id}>
                      <OrderTracking order={order} />
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Home; 