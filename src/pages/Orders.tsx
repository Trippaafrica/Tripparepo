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
} from '@chakra-ui/react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import OrderTracking from '../components/OrderTracking';
import { Link as RouterLink } from 'react-router-dom';

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

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched orders:', data);
      setOrders(data || []);
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
          <Spinner size="xl" color="brand.secondary" />
          <Text>Loading your orders...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8} mb={20}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color="brand.secondary">My Orders</Heading>

        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>All Orders</Tab>
            <Tab>Active</Tab>
            <Tab>Completed</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {orders.length === 0 ? (
                  <Text color="gray.500">No orders found</Text>
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

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {getActiveOrders().length === 0 ? (
                  <Text color="gray.500">No active orders</Text>
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

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {getFilteredOrders('completed').length === 0 ? (
                  <Text color="gray.500">No completed orders</Text>
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
};

export default Orders; 