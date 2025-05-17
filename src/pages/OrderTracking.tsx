import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Box,
  Heading,
  Text,
  Progress,
  HStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Divider,
  Card,
  CardBody,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaBox, FaCheckCircle, FaTruck, FaMapMarkerAlt, FaUser, FaPhone, FaMotorcycle } from 'react-icons/fa';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [rider, setRider] = useState<any>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('brand.primary', 'brand.secondary');
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();
          
        if (orderError) throw orderError;
        if (!orderData) {
          toast({
            title: 'Order not found',
            status: 'error',
            duration: 3000,
          });
          navigate('/orders');
          return;
        }
        
        setOrder(orderData);
        
        // If there's a rider assigned, fetch their details
        if (orderData.rider_id) {
          const { data: riderData, error: riderError } = await supabase
            .from('riders')
            .select('*')
            .eq('id', orderData.rider_id)
            .single();
            
          if (!riderError) {
            setRider(riderData);
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: 'Failed to load order details',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, user, navigate, toast]);
  
  const getStatusSteps = () => {
    const steps = [
      { label: 'Order Placed', value: 'pending', completed: true },
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
      case 'pending': return 20;
      case 'assigned': return 40;
      case 'pickup_ready': return 60;
      case 'delivering': return 80;
      case 'completed': return 100;
      default: return 0;
    }
  };
  
  const getStatusColor = () => {
    const status = order?.status || '';
    switch (status) {
      case 'pending': return 'yellow';
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
    <Container maxW="container.md" py={4} px={4} mb={16}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => navigate('/orders')}
            mb={2}
          >
            ← Back to Orders
          </Button>
          <Heading size="lg" color={headingColor}>
            Order #{order.id.slice(0, 8)}
          </Heading>
          <HStack mt={2}>
            <Badge 
              colorScheme={getStatusColor()} 
              fontSize="md" 
              px={3} 
              py={1}
              borderRadius="full"
            >
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            <Text color="gray.500" fontSize="sm">
              {new Date(order.created_at).toLocaleString()}
            </Text>
          </HStack>
        </Box>
        
        {/* Progress Tracker */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={5} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>Delivery Progress</Text>
                <Progress 
                  value={getProgressValue()} 
                  size="md" 
                  colorScheme={getStatusColor()}
                  borderRadius="full"
                  mb={4}
                />
                
                <HStack spacing={4} justify="space-between" wrap="wrap">
                  {getStatusSteps().map((step, index) => (
                    <VStack key={index} flex="1" minW="80px" spacing={1}>
                      <Flex
                        w="36px"
                        h="36px"
                        borderRadius="full"
                        bg={step.completed ? `${getStatusColor()}.500` : 'gray.200'}
                        color={step.completed ? 'white' : 'gray.500'}
                        justify="center"
                        align="center"
                      >
                        <Icon as={FaCheckCircle} />
                      </Flex>
                      <Text 
                        fontSize="xs" 
                        fontWeight={step.completed ? 'bold' : 'normal'}
                        color={step.completed ? `${getStatusColor()}.500` : 'gray.500'}
                        textAlign="center"
                      >
                        {step.label}
                      </Text>
                    </VStack>
                  ))}
                </HStack>
              </Box>
              
              <Divider />
              
              {/* Pickup and Dropoff Information */}
              <Box>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FaMapMarkerAlt} color="green.500" />
                      <Text fontWeight="bold">Pickup Location</Text>
                    </HStack>
                    <Text ml={7}>{order.pickup_location}</Text>
                    <HStack ml={7} mt={2}>
                      <Text fontWeight="bold">Pickup Code:</Text>
                      <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                        {order.pickup_code}
                      </Badge>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FaMapMarkerAlt} color="red.500" />
                      <Text fontWeight="bold">Dropoff Location</Text>
                    </HStack>
                    <Text ml={7}>{order.dropoff_location}</Text>
                    <HStack ml={7} mt={2}>
                      <Text fontWeight="bold">Dropoff Code:</Text>
                      <Badge colorScheme="red" fontSize="lg" px={3} py={1}>
                        {order.dropoff_code}
                      </Badge>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
              
              {/* Rider Information */}
              {rider && (
                <>
                  <Divider />
                  <Box>
                    <HStack spacing={2} mb={3}>
                      <Icon as={FaMotorcycle} />
                      <Text fontWeight="bold">Delivery Partner</Text>
                    </HStack>
                    
                    <HStack spacing={4} ml={7}>
                      <VStack spacing={1} align="flex-start">
                        <HStack>
                          <Icon as={FaUser} color="gray.500" />
                          <Text>{rider.name}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaPhone} color="gray.500" />
                          <Text>{rider.phone_number}</Text>
                        </HStack>
                      </VStack>
                      
                      <Button 
                        colorScheme="green" 
                        size="sm"
                        rightIcon={<FaPhone />}
                        onClick={callRider}
                      >
                        Call Rider
                      </Button>
                    </HStack>
                  </Box>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
        
        {/* Order Details */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Order Details</Heading>
              
              <HStack justify="space-between">
                <Text>Item Type:</Text>
                <Text fontWeight="bold">{order.item_type || 'Package'}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text>Weight:</Text>
                <Text fontWeight="bold">{order.weight || 'Standard'}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text>Delivery Fee:</Text>
                <Text fontWeight="bold">${order.delivery_fee || '0.00'}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text>Payment Method:</Text>
                <Text fontWeight="bold">{order.payment_method || 'Card'}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text>Total:</Text>
                <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                  ${order.total || '0.00'}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        
        {/* Support Button */}
        <Button 
          colorScheme="brand" 
          leftIcon={<FaPhone />}
          onClick={() => window.location.href = 'tel:+1234567890'}
          mb={6}
        >
          Contact Support
        </Button>
      </VStack>
    </Container>
  );
};

export default OrderTracking; 