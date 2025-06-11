import { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useToast,
  Box,
  Link,
  useColorModeValue,
  Icon,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import OrderTracking from '../components/OrderTracking';
import { Link as RouterLink } from 'react-router-dom';
import { FaListAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';

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

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  
  // Colors for theme mode
  const tabBg = useColorModeValue('white', 'rgba(26, 26, 46, 0.8)');
  const activeBg = useColorModeValue('rgba(51, 14, 237, 0.1)', 'rgba(153, 255, 0, 0.1)');
  const activeColor = useColorModeValue('brand.primary', 'brand.secondary');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');
  const hoverBg = useColorModeValue('gray.50', 'rgba(255, 255, 255, 0.05)');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched orders:', data);
      
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
      
      setOrders(typedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredOrders = (status: string | string[]) => {
    if (Array.isArray(status)) {
      return orders.filter(order => status.includes(order.status.toLowerCase()));
    }
    return orders.filter(order => order.status.toLowerCase() === status.toLowerCase());
  };

  const getActiveOrders = () => {
    return getFilteredOrders(['accepted', 'in_progress']);
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.secondary" thickness="3px" speed="0.8s" />
          <Text>Loading your orders...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8} mb={20}>
      <VStack spacing={8} align="stretch">
        <Heading 
          size="lg" 
          bgGradient={useColorModeValue(
            'linear(to-r, brand.primary, #6654c0)',
            'linear(to-r, brand.primary, brand.secondary)'
          )}
          bgClip="text"
        >
          My Orders
        </Heading>

        <Tabs variant="unstyled">
          <Box 
            bg={tabBg} 
            borderRadius="xl" 
            p={{ base: 1, sm: 1 }}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            width="100%"
          >
            <TabList 
              gap={{ base: 1, sm: 2 }}
              p={{ base: 1, sm: 2 }}
              flexDir={{ base: "column", sm: "row" }}
            >
              <CustomTab icon={FaListAlt}>All Orders</CustomTab>
              <CustomTab icon={FaSpinner}>Active</CustomTab>
              <CustomTab icon={FaCheckCircle}>Completed</CustomTab>
          </TabList>
          </Box>

          <TabPanels mt={6}>
            <TabPanel p={0}>
              <VStack spacing={4} align="stretch">
                {orders.length === 0 ? (
                  <EmptyOrdersMessage message="No orders found" />
                ) : (
                  orders.map(order => (
                    <Box 
                      key={order.id} 
                      as={RouterLink} 
                      to={`/order/${order.id}`} 
                      _hover={{ textDecoration: 'none' }}
                    >
                      <OrderTracking order={order} />
                    </Box>
                  ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={0}>
              <VStack spacing={4} align="stretch">
                {getActiveOrders().length === 0 ? (
                  <EmptyOrdersMessage message="No active orders" />
                ) : (
                  getActiveOrders().map(order => (
                    <Box 
                      key={order.id} 
                      as={RouterLink} 
                      to={`/order/${order.id}`}
                      _hover={{ textDecoration: 'none' }}
                    >
                      <OrderTracking order={order} />
                    </Box>
                  ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={0}>
              <VStack spacing={4} align="stretch">
                {getFilteredOrders('completed').length === 0 ? (
                  <EmptyOrdersMessage message="No completed orders" />
                ) : (
                  getFilteredOrders('completed').map(order => (
                    <Box 
                      key={order.id} 
                      as={RouterLink} 
                      to={`/order/${order.id}`}
                      _hover={{ textDecoration: 'none' }}
                    >
                      <OrderTracking order={order} />
                    </Box>
                  ))
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
  
  // Custom Tab component
  function CustomTab({ children, icon }: { children: React.ReactNode, icon: React.ComponentType }) {
    return (
      <Tab
        flex={1}
        py={{ base: 2, sm: 3 }}
        px={{ base: 2, sm: 3 }}
        borderRadius="lg"
        fontWeight="medium"
        transition="all 0.3s ease"
        color={inactiveColor}
        _selected={{
          bg: activeBg,
          color: activeColor,
          fontWeight: "bold",
          transform: { base: "none", sm: "translateY(-2px)" },
          border: "1px solid",
          borderColor: useColorModeValue("rgba(51, 14, 237, 0.3)", "rgba(153, 255, 0, 0.3)"),
          boxShadow: useColorModeValue(
            "0 4px 12px rgba(51, 14, 237, 0.15)",
            "0 4px 12px rgba(153, 255, 0, 0.15)"
          ),
        }}
        _hover={{
          bg: hoverBg,
        }}
        _focus={{
          boxShadow: "none",
          outline: "none",
        }}
        position="relative"
        justifyContent="center"
        mb={{ base: 1, sm: 0 }}
      >
        <HStack spacing={2} justify="center">
          <Icon as={icon} boxSize={{ base: 3.5, sm: 4 }} />
          <Text fontSize={{ base: "sm", sm: "md" }}>{children}</Text>
        </HStack>
        <Box
          position="absolute"
          bottom={0}
          left="50%"
          width="0"
          height="3px"
          borderRadius="full"
          bg={activeColor}
          transform="translateX(-50%)"
          transition="all 0.3s ease"
          _selected={{
            width: "30px",
          }}
          display={{ base: "none", sm: "block" }}
        />
        {/* For mobile, show accent on the left side instead of bottom */}
        <Box
          position="absolute"
          left={0}
          top="50%"
          width="3px"
          height="0"
          borderRadius="full"
          bg={activeColor}
          transform="translateY(-50%)"
          transition="all 0.3s ease"
          _selected={{
            height: "60%",
          }}
          display={{ base: "block", sm: "none" }}
        />
      </Tab>
    );
  }
  
  // Empty orders message component
  function EmptyOrdersMessage({ message }: { message: string }) {
    return (
      <Box
        borderRadius="xl"
        bg={tabBg}
        p={6}
        textAlign="center"
        border="1px dashed"
        borderColor={borderColor}
      >
        <VStack spacing={4}>
          <Icon as={FaListAlt} boxSize={12} color="gray.400" />
          <Text fontSize="lg" fontWeight="medium" color={inactiveColor}>
            {message}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Place a delivery order to see it here
          </Text>
          <Box
            as={RouterLink}
            to="/"
            py={2}
            px={4}
            borderRadius="md"
            bg={activeBg}
            color={activeColor}
            fontWeight="medium"
            _hover={{
              bg: useColorModeValue("rgba(51, 14, 237, 0.2)", "rgba(153, 255, 0, 0.2)"),
            }}
          >
            Start a delivery
          </Box>
        </VStack>
      </Box>
    );
  }
};

export default Orders; 