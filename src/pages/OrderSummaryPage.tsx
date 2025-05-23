import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  HStack,
  useToast,
  Icon,
  ScaleFade,
  Spinner,
  Badge,
  Divider,
  Stack,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaMapMarkerAlt, 
  FaMotorcycle, 
  FaTruck, 
  FaShuttleVan, 
  FaGasPump, 
  FaUser, 
  FaCheck, 
  FaCreditCard 
} from 'react-icons/fa';

interface DeliveryRequest {
  id: string;
  status: string;
  delivery_status: string;
  order_status: string;
  delivery_type: string;
  pickup_address: string;
  dropoff_address: string;
  item_description: string;
  package_weight?: number;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  dropoff_contact_name: string;
  dropoff_contact_phone: string;
  accepted_bid_id?: string;
  service_fee?: number;
  total_amount?: number;
}

interface Bid {
  id: string;
  rider_id: string;
  amount: number;
  estimated_time: string;
  status: string;
  created_at: string;
}

interface Rider {
  id: string;
  full_name?: string;
  phone_number?: string;
  rating?: number;
  vehicle_type?: 'bike' | 'truck' | 'van' | 'fuel';
  vehicle_details?: string;
}

const paystackKey = import.meta.env.VITE_PAYSTACK_KEY;

const OrderSummaryPage = () => {
  const { requestId, bidId } = useParams<{ requestId: string; bidId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null);
  const [acceptedBid, setAcceptedBid] = useState<Bid | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);

  useEffect(() => {
    if (requestId && bidId) {
      fetchOrderDetails();
    }
  }, [requestId, bidId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);

      // Fetch the delivery request
      const { data: requestData, error: requestError } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        throw new Error('Failed to fetch delivery request details');
      }

      console.log("Delivery request data:", requestData);
      setDeliveryRequest(requestData);

      // Fetch the accepted bid
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', bidId)
        .eq('delivery_request_id', requestId)
        .eq('status', 'accepted')
        .single();

      if (bidError) {
        throw new Error('Failed to fetch bid details');
      }

      setAcceptedBid(bidData);

      // Fetch rider details
      const { data: riderData, error: riderError } = await supabase
        .from('riders')
        .select(`
          id,
          full_name,
          rating
        `)
        .eq('id', bidData.rider_id)
        .single();

      if (riderError) {
        console.error('Error fetching rider details:', riderError);
        // Continue without rider details rather than failing completely
      } else {
        setRider({
          id: riderData.id,
          full_name: riderData.full_name,
          rating: riderData.rating
        });
      }

    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load order details',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = () => {
    if (!deliveryRequest) return FaMotorcycle;
    
    switch (deliveryRequest.delivery_type) {
      case 'bike': return FaMotorcycle;
      case 'truck': return FaTruck;
      case 'van': return FaShuttleVan;
      case 'fuel': return FaGasPump;
      default: return FaMotorcycle;
    }
  };

  const handlePaymentClick = () => {
    if (deliveryRequest && acceptedBid) {
      try {
        // Calculate total amount
        const totalAmount = acceptedBid.amount + 1200; // Rider fee + service fee
        
        // Generate a unique reference
        const reference = `TRIPPA-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        
        // Store reference and order details in localStorage for verification
        localStorage.setItem('paystack_reference', reference);
        localStorage.setItem('paystack_amount', totalAmount.toString());
        localStorage.setItem('paystack_request_id', requestId || '');
        localStorage.setItem('paystack_bid_id', bidId || '');
        
        // Show loading toast
        toast({
          title: 'Redirecting to payment',
          description: 'Please wait while we redirect you to the payment page...',
          status: 'info',
          duration: 3000,
        });
        
        console.log('Initializing Paystack payment with reference:', reference);
        
        // Redirect to the processed URL with inline checkout
        // This uses the Paystack popup approach which is more reliable
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        
        script.onload = () => {
          // @ts-ignore
          const paystack = window.PaystackPop;
          const handler = paystack.setup({
            key: paystackKey,
            email: user?.email || 'customer@trippa.app',
            amount: totalAmount * 100, // Convert to kobo
            ref: reference,
            callback: function(response: any) {
              // Handle success
              console.log('Payment successful. Reference:', response.reference);
              window.location.href = 'https://trippaafricaapp.com/orders';
            },
            onClose: function() {
              // Handle case when user closes the payment modal
              console.log('Payment window closed');
              toast({
                title: 'Payment Cancelled',
                description: 'You have cancelled the payment process',
                status: 'info',
                duration: 5000,
              });
            }
          });
          
          handler.openIframe();
        };
        
        script.onerror = () => {
          toast({
            title: 'Payment Error',
            description: 'Failed to load payment system. Please try again.',
            status: 'error',
            duration: 5000,
          });
        };
        
        document.head.appendChild(script);
        
      } catch (error) {
        console.error('Error redirecting to payment:', error);
        toast({
          title: 'Payment Error',
          description: 'Failed to initialize payment. Please try again.',
          status: 'error',
          duration: 5000,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.secondary" />
          <Text>Loading order details...</Text>
        </VStack>
      </Container>
    );
  }

  if (!deliveryRequest || !acceptedBid) {
    return (
      <Container maxW="container.md" py={8}>
        <Card bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
          <CardBody>
            <VStack spacing={4}>
              <Heading size="md" color="red.400">Order Not Found</Heading>
              <Text color="white">The order details could not be found.</Text>
              <Button colorScheme="brand" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  // Calculate total amount
  const bidAmount = acceptedBid.amount;
  const serviceFee = 1200; // Fixed service fee of 1200 naira
  const totalAmount = bidAmount + serviceFee; // Calculate as bid amount + service fee

  return (
    <Container maxW="container.md" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={6}>
          <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="center">
                  <Icon as={FaCheck} w={8} h={8} color="green.400" />
                  <Heading size="lg" color="brand.secondary">
                    Order Summary
                  </Heading>
                </HStack>

                <Divider />
                
                <HStack justify="space-between">
                  <Text color="gray.300">Order Status:</Text>
                  <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                    Accepted
                  </Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text color="gray.300">Order ID:</Text>
                  <Text color="white" fontWeight="medium">{deliveryRequest.id.slice(0, 8)}</Text>
                </HStack>

                <Divider />

                <Heading size="sm" color="brand.secondary">Delivery Details</Heading>

                <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
                  <Box flex={1}>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="green.400" />
                      <Text color="gray.200" fontWeight="bold">Pickup:</Text>
                    </HStack>
                    {deliveryRequest.pickup_address ? (
                      <Text color="white" ml={6}>{deliveryRequest.pickup_address}</Text>
                    ) : (
                      <Text color="red.300" ml={6}>No pickup address provided</Text>
                    )}
                    <Text color="gray.300" ml={6} fontSize="sm">
                      Contact: {deliveryRequest.pickup_contact_name}, {deliveryRequest.pickup_contact_phone}
                    </Text>
                  </Box>
                  <Box flex={1}>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="red.400" />
                      <Text color="gray.200" fontWeight="bold">Dropoff:</Text>
                    </HStack>
                    {deliveryRequest.dropoff_address ? (
                      <Text color="white" ml={6}>{deliveryRequest.dropoff_address}</Text>
                    ) : (
                      <Text color="red.300" ml={6}>No dropoff address provided</Text>
                    )}
                    <Text color="gray.300" ml={6} fontSize="sm">
                      Contact: {deliveryRequest.dropoff_contact_name}, {deliveryRequest.dropoff_contact_phone}
                    </Text>
                  </Box>
                </Stack>

                <Divider />

                <HStack align="start" spacing={6}>
                  <Icon as={getVehicleIcon()} w={6} h={6} color="brand.secondary" />
                  <Box>
                    <Text color="gray.200" fontWeight="bold">Item Description:</Text>
                    <Text color="white">{deliveryRequest.item_description}</Text>
                    {deliveryRequest.package_weight && (
                      <Text color="gray.300" fontSize="sm">Weight: {deliveryRequest.package_weight} kg</Text>
                    )}
                  </Box>
                </HStack>

                <Divider />

                <Heading size="sm" color="brand.secondary">Rider Information</Heading>

                <HStack spacing={4}>
                  <Icon as={FaUser} w={6} h={6} color="brand.secondary" />
                  <Box>
                    <Text color="white" fontWeight="bold">
                      {rider?.full_name || `Rider ${acceptedBid.rider_id.slice(0, 6)}`}
                    </Text>
                    {rider?.rating && (
                      <Text color="gray.300" fontSize="sm">Rating: {rider.rating.toFixed(1)} / 5</Text>
                    )}
                  </Box>
                </HStack>

                <Divider />

                <Heading size="sm" color="brand.secondary">Payment Summary</Heading>

                <Card bg="rgba(36, 36, 56, 0.6)" border="1px dashed rgba(157, 78, 221, 0.2)">
                  <CardBody>
                    <Stack spacing={3}>
                      <Flex justify="space-between">
                        <Text color="gray.300">Rider Fee:</Text>
                        <Text color="white">₦{bidAmount.toLocaleString()}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.300">Service Fee:</Text>
                        <Text color="white">₦{serviceFee.toLocaleString()}</Text>
                      </Flex>
                      <Divider />
                      <Flex justify="space-between">
                        <Text color="gray.200" fontWeight="bold">Total:</Text>
                        <Text color="brand.secondary" fontWeight="bold" fontSize="lg">
                          ₦{totalAmount.toLocaleString()}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.300" fontSize="sm">Estimated Delivery Time:</Text>
                        <Text color="white" fontSize="sm">{acceptedBid.estimated_time}</Text>
                      </Flex>
                    </Stack>
                  </CardBody>
                </Card>

                <Button
                  colorScheme="brand"
                  size="lg"
                  mt={4}
                  leftIcon={<FaCreditCard />}
                  onClick={handlePaymentClick}
                >
                  Proceed to Payment
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </ScaleFade>
    </Container>
  );
};

export default OrderSummaryPage; 