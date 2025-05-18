import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Badge,
  Avatar,
  HStack,
  Progress,
  Divider,
  Button,
  useToast,
  Card,
  CardBody,
  Icon,
  Link,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaStar, FaMotorcycle, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRoute, FaMoneyBillWave } from 'react-icons/fa';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OrderDetails {
  id: string;
  delivery_type: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  package_weight?: number;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  dropoff_contact_name?: string;
  dropoff_contact_phone?: string;
  item_description?: string;
  pickup_code: string;
  dropoff_code: string;
  created_at: string;
  distance_km: number;
  estimated_time: string;
  amount: number;
}

interface Rider {
  id: string;
  full_name: string;
  phone_number: string;
  rating: number;
  avatar_url?: string;
  vehicle_type: string;
  vehicle_number: string;
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      if (!orderId) return;

      setLoading(true);
      console.log('Fetching order details for order ID:', orderId);

      // First try to get from delivery_orders
      const { data: orderData, error: orderError } = await supabase
        .from('delivery_orders')
        .select(`
          *,
          delivery_requests(*),
          bids(*),
          riders(*)
        `)
        .eq('id', orderId)
        .single();

      if (!orderError && orderData) {
        console.log('Found order in delivery_orders:', orderData);
        
        // Get the associated request for additional details
        const deliveryRequest = orderData.delivery_requests;
        const bidData = orderData.bids;
        const riderData = orderData.riders;
        
        // Transform data for our component
        const transformedOrder: OrderDetails = {
          id: orderData.id,
          delivery_type: deliveryRequest?.delivery_type || 'standard',
          pickup_address: orderData.pickup_location,
          dropoff_address: orderData.delivery_location,
          status: orderData.status,
          package_weight: deliveryRequest?.package_weight,
          pickup_contact_name: deliveryRequest?.pickup_contact_name,
          pickup_contact_phone: deliveryRequest?.pickup_contact_phone,
          dropoff_contact_name: deliveryRequest?.dropoff_contact_name,
          dropoff_contact_phone: deliveryRequest?.dropoff_contact_phone,
          item_description: deliveryRequest?.item_description,
          pickup_code: orderData.pickup_code || 'PU1234', // Fallback for demo
          dropoff_code: orderData.dropoff_code || 'DO5678', // Fallback for demo
          created_at: orderData.created_at,
          distance_km: deliveryRequest?.estimated_distance_km || 5.3,
          estimated_time: bidData?.estimated_time || '30-45 mins',
          amount: orderData.amount,
        };

        setOrder(transformedOrder);

        // Set rider details if available
        if (riderData) {
          setRider({
            id: riderData.id,
            full_name: riderData.full_name || 'Unknown Rider',
            phone_number: riderData.phone_number || '+2349012345678',
            rating: riderData.rating || 4.5,
            avatar_url: riderData.avatar_url,
            vehicle_type: riderData.vehicle_type || 'Motorcycle',
            vehicle_number: riderData.vehicle_number || 'LG-234-KJA',
          });
        }
      } else {
        console.log('Order not found in delivery_orders, checking delivery_requests');
        
        // Fallback to checking delivery_requests directly
        const { data: requestData, error: requestError } = await supabase
          .from('delivery_requests')
          .select(`
            *,
            bids(*)
          `)
          .eq('id', orderId)
          .eq('user_id', user?.id)
          .single();

        if (requestError) throw requestError;
        
        if (!requestData) {
          toast({
            title: 'Order not found',
            status: 'error',
            duration: 3000,
          });
          navigate('/orders');
          return;
        }

        console.log('Found order in delivery_requests:', requestData);
        
        // Find the accepted bid if any
        const acceptedBid = requestData.bids?.find(bid => bid.status === 'accepted');
        
        // Transform data for our component
        const transformedOrder: OrderDetails = {
          id: requestData.id,
          delivery_type: requestData.delivery_type,
          pickup_address: requestData.pickup_address,
          dropoff_address: requestData.dropoff_address,
          status: requestData.status,
          package_weight: requestData.package_weight,
          pickup_contact_name: requestData.pickup_contact_name,
          pickup_contact_phone: requestData.pickup_contact_phone,
          dropoff_contact_name: requestData.dropoff_contact_name,
          dropoff_contact_phone: requestData.dropoff_contact_phone,
          item_description: requestData.item_description,
          pickup_code: requestData.pickup_code || 'PU1234', // Fallback for demo
          dropoff_code: requestData.dropoff_code || 'DO5678', // Fallback for demo
          created_at: requestData.created_at,
          distance_km: requestData.estimated_distance_km || 5.3,
          estimated_time: acceptedBid?.estimated_time || '30-45 mins',
          amount: acceptedBid?.amount || 0,
        };

        setOrder(transformedOrder);

        // Fetch rider details if assigned
        if (acceptedBid?.rider_id) {
          const { data: riderData, error: riderError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', acceptedBid.rider_id)
            .single();

          if (!riderError && riderData) {
            setRider({
              id: riderData.id,
              full_name: riderData.full_name || 'Unknown Rider',
              phone_number: riderData.phone_number || '+2349012345678',
              rating: riderData.rating || 4.5,
              avatar_url: riderData.avatar_url,
              vehicle_type: riderData.vehicle_type || 'Motorcycle',
              vehicle_number: riderData.vehicle_number || 'LG-234-KJA',
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { label: 'Order Placed', value: 'pending', completed: true },
      { label: 'Bid Accepted', value: 'accepted', completed: ['accepted', 'assigned', 'in_progress', 'pickup_ready', 'delivering', 'completed'].includes(order?.status || '') },
      { label: 'Rider Assigned', value: 'assigned', completed: ['assigned', 'in_progress', 'pickup_ready', 'delivering', 'completed'].includes(order?.status || '') },
      { label: 'Pickup Ready', value: 'pickup_ready', completed: ['pickup_ready', 'delivering', 'completed'].includes(order?.status || '') },
      { label: 'Delivering', value: 'delivering', completed: ['delivering', 'completed'].includes(order?.status || '') },
      { label: 'Delivered', value: 'completed', completed: order?.status === 'completed' },
    ];
    return steps;
  };

  const getProgressValue = () => {
    const status = order?.status || '';
    switch (status) {
      case 'pending': return 16;
      case 'accepted': return 32;
      case 'assigned': return 48;
      case 'pickup_ready': return 64;
      case 'delivering': return 82;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusColor = () => {
    const status = order?.status || '';
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'blue';
      case 'assigned': return 'blue';
      case 'pickup_ready': return 'teal';
      case 'delivering': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const callRider = () => {
    if (rider?.phone_number) {
      window.location.href = `tel:${rider.phone_number}`;
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={8} mb={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.secondary" />
          <Text>Loading order details...</Text>
        </VStack>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxW="container.md" py={8} mb={20}>
        <VStack spacing={4}>
          <Text>Order not found</Text>
          <Button onClick={() => navigate('/orders')} colorScheme="brand">
            Back to Orders
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8} mb={20}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => navigate('/orders')}
            mb={4}
          >
            ← Back to Orders
          </Button>
          <HStack justify="space-between" wrap="wrap">
            <Heading size="lg" color="brand.secondary">Order #{order.id.slice(0, 8)}</Heading>
            <Badge 
              colorScheme={getStatusColor()} 
              fontSize="md" 
              px={3} 
              py={1}
              borderRadius="full"
            >
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            <Icon as={FaCalendarAlt} mr={1} />
            {new Date(order.created_at).toLocaleString()}
          </Text>
        </Box>

        {/* Progress Bar */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody p={4}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Progress 
                  value={getProgressValue()} 
                  colorScheme={getStatusColor()}
                  size="md" 
                  borderRadius="full"
                  bg={progressBg}
                  hasStripe
                  isAnimated
                  mb={3}
                />
                <Grid templateColumns="repeat(5, 1fr)" gap={1}>
                  {getStatusSteps().map((step, index) => (
                    <GridItem key={index} colSpan={1}>
                      <VStack spacing={1} align="center">
                        <Box 
                          h={3} 
                          w={3} 
                          borderRadius="full" 
                          bg={step.completed ? `${getStatusColor()}.500` : 'gray.300'}
                        />
                        <Text 
                          fontSize="xs" 
                          textAlign="center"
                          color={step.completed ? `${getStatusColor()}.500` : 'gray.500'}
                          fontWeight={step.completed ? 'bold' : 'normal'}
                        >
                          {step.label}
                        </Text>
                      </VStack>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Rider Details */}
        {rider && (
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody p={4}>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Icon as={FaMotorcycle} color="brand.secondary" />
                  <Heading size="sm">Rider Details</Heading>
                </HStack>
                <Divider />
                <HStack spacing={4} align="center">
                  <Avatar
                    size="lg"
                    name={rider.full_name}
                    src={rider.avatar_url}
                    bg="brand.secondary"
                    color="white"
                  />
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Text fontWeight="bold">{rider.full_name}</Text>
                      <Badge colorScheme="yellow">
                        <HStack spacing={1}>
                          <Icon as={FaStar} />
                          <Text>{rider.rating}</Text>
                        </HStack>
                      </Badge>
                    </HStack>
                    <Text fontSize="sm">{rider.vehicle_type} • {rider.vehicle_number}</Text>
                    <Button
                      leftIcon={<FaPhone />}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={callRider}
                      mt={2}
                    >
                      Call Rider
                    </Button>
                  </VStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Order Details */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody p={4}>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FaRoute} color="brand.secondary" />
                <Heading size="sm">Delivery Details</Heading>
              </HStack>
              <Divider />
              
              {/* Journey Info */}
              <Flex justify="space-between" wrap="wrap" gap={4}>
                <Stat>
                  <StatLabel>Distance</StatLabel>
                  <StatNumber>{order.distance_km} km</StatNumber>
                  <StatHelpText>Estimated</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Time</StatLabel>
                  <StatNumber>{order.estimated_time}</StatNumber>
                  <StatHelpText>Estimated</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Amount</StatLabel>
                  <StatNumber>₦{order.amount.toLocaleString()}</StatNumber>
                  <StatHelpText>Delivery fee</StatHelpText>
                </Stat>
              </Flex>
              
              <Divider />
              
              {/* Pickup Details */}
              <Box>
                <HStack spacing={2} mb={2} align="center">
                  <Icon as={FaMapMarkerAlt} color="green.500" />
                  <Text fontWeight="bold">Pickup Location</Text>
                </HStack>
                <Text ml={6} mb={2}>{order.pickup_address}</Text>
                <VStack spacing={1} align="start" ml={6}>
                  <Text fontSize="sm"><b>Contact:</b> {order.pickup_contact_name}</Text>
                  <Text fontSize="sm"><b>Phone:</b> {order.pickup_contact_phone}</Text>
                  <HStack mt={2} bg="green.50" p={2} borderRadius="md">
                    <Text color="green.700" fontWeight="bold">Pickup Code:</Text>
                    <Text color="green.700" fontSize="lg" fontWeight="bold">{order.pickup_code}</Text>
                  </HStack>
                </VStack>
              </Box>
              
              <Divider />
              
              {/* Dropoff Details */}
              <Box>
                <HStack spacing={2} mb={2} align="center">
                  <Icon as={FaMapMarkerAlt} color="red.500" />
                  <Text fontWeight="bold">Dropoff Location</Text>
                </HStack>
                <Text ml={6} mb={2}>{order.dropoff_address}</Text>
                <VStack spacing={1} align="start" ml={6}>
                  <Text fontSize="sm"><b>Contact:</b> {order.dropoff_contact_name}</Text>
                  <Text fontSize="sm"><b>Phone:</b> {order.dropoff_contact_phone}</Text>
                  <HStack mt={2} bg="red.50" p={2} borderRadius="md">
                    <Text color="red.700" fontWeight="bold">Dropoff Code:</Text>
                    <Text color="red.700" fontSize="lg" fontWeight="bold">{order.dropoff_code}</Text>
                  </HStack>
                </VStack>
              </Box>
              
              {/* Package Details */}
              <Box>
                <HStack spacing={2} mb={2} align="center">
                  <Icon as={FaMoneyBillWave} color="blue.500" />
                  <Text fontWeight="bold">Package Details</Text>
                </HStack>
                {order.item_description && (
                  <Text ml={6} mb={2}><b>Description:</b> {order.item_description}</Text>
                )}
                {order.package_weight && (
                  <Text ml={6} mb={2}><b>Weight:</b> {order.package_weight}kg</Text>
                )}
              </Box>
              
              <Divider />
            </VStack>
          </CardBody>
        </Card>
        
        {/* Action Buttons */}
        <Flex gap={4} wrap="wrap">
          <Button
            leftIcon={<FaPhone />}
            colorScheme="brand"
            flex={1}
            onClick={callRider}
            isDisabled={!rider}
          >
            Contact Rider
          </Button>
          <Button
            colorScheme="red"
            variant="outline"
            flex={1}
            isDisabled={['completed', 'cancelled'].includes(order.status)}
          >
            Cancel Order
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

export default OrderDetails; 