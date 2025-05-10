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
} from '@chakra-ui/react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import OrderTracking from '../components/OrderTracking';

interface Order {
  id: string;
  status: string;
  pickup_code: string;
  dropoff_code: string;
  pickup_location: string;
  dropoff_location: string;
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
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
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

  const getFilteredOrders = (status: string) => {
    return orders.filter(order => order.status === status);
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
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color="brand.secondary">My Orders</Heading>

        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>All Orders</Tab>
            <Tab>In Progress</Tab>
            <Tab>Completed</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {orders.length === 0 ? (
                  <Text color="gray.500">No orders found</Text>
                ) : (
                  orders.map(order => (
                    <OrderTracking key={order.id} order={order} />
                  ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {getFilteredOrders('in_progress').length === 0 ? (
                  <Text color="gray.500">No in-progress orders</Text>
                ) : (
                  getFilteredOrders('in_progress').map(order => (
                    <OrderTracking key={order.id} order={order} />
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
                    <OrderTracking key={order.id} order={order} />
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