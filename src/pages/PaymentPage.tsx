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
  useToast,
  Spinner,
  Divider,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Input,
  Icon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Flex,
  ScaleFade,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FaCreditCard, FaShieldAlt, FaLock, FaMapMarkerAlt } from 'react-icons/fa';

interface DeliveryRequest {
  id: string;
  status: string;
  delivery_type: string;
  pickup_address: string;
  dropoff_address: string;
  user_id: string;
  accepted_bid_id?: string;
  service_fee?: number;
  total_amount?: number;
}

interface Bid {
  id: string;
  delivery_request_id: string;
  rider_id: string;
  amount: number;
  status: string;
}

interface PaymentFormData {
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: 'card' | 'bank' | 'ussd' | 'qr';
}

const PaymentPage = () => {
  const { requestId, bidId } = useParams<{ requestId: string; bidId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null);
  const [acceptedBid, setAcceptedBid] = useState<Bid | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    paymentMethod: 'card',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (requestId && bidId) {
      fetchPaymentDetails();
    }
  }, [requestId, bidId]);

  const fetchPaymentDetails = async () => {
    try {
      setIsLoading(true);

      console.log('Fetching payment details for request:', requestId, 'bid:', bidId);

      // First check if we have an order record
      const { data: orderData, error: orderError } = await supabase
        .from('delivery_orders')
        .select('*')
        .eq('delivery_request_id', requestId)
        .eq('bid_id', bidId)
        .single();

      if (!orderError && orderData) {
        console.log('Found existing order record:', orderData);
        // Use the order data to set up payment
        setDeliveryRequest({
          id: orderData.delivery_request_id,
          status: orderData.status,
          delivery_type: orderData.delivery_type,
          pickup_address: orderData.pickup_address,
          dropoff_address: orderData.dropoff_address,
          user_id: orderData.user_id,
          service_fee: orderData.service_fee || 1200,
          total_amount: orderData.total_amount || (orderData.amount + 1200)
        });

        setAcceptedBid({
          id: orderData.bid_id,
          delivery_request_id: orderData.delivery_request_id,
          rider_id: orderData.rider_id,
          amount: orderData.amount,
          status: 'accepted'
        });

        setIsLoading(false);
        return;
      }

      console.log('No order record found, falling back to delivery request and bid');

      // Fetch the delivery request
      const { data: requestData, error: requestError } = await supabase
        .from('delivery_requests')
        .select('id, status, delivery_type, pickup_address, dropoff_address, user_id, accepted_bid_id, service_fee, total_amount')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching delivery request:', requestError);
        throw new Error('Failed to fetch delivery request details');
      }

      // Verify this is the user's own request
      if (requestData.user_id !== user?.id) {
        throw new Error('You are not authorized to view this payment page');
      }

      setDeliveryRequest(requestData);

      // Fetch the accepted bid
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select('id, delivery_request_id, rider_id, amount, status')
        .eq('id', bidId)
        .eq('delivery_request_id', requestId)
        .eq('status', 'accepted')
        .single();

      if (bidError) {
        console.error('Error fetching bid:', bidError);
        throw new Error('Failed to fetch bid details');
      }

      setAcceptedBid(bidData);

    } catch (error: any) {
      console.error('Error fetching payment details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load payment details',
        status: 'error',
        duration: 5000,
      });
      // Redirect on error
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value as 'card' | 'bank' | 'ussd' | 'qr' });
  };

  const initializePaystack = async () => {
    if (!deliveryRequest || !acceptedBid) return;
    
    try {
      setIsProcessing(true);
      
      // Use a Paystack test public key
      const paystackPublicKey = "pk_test_b1c4c2a2b8d6b581b7b2b4f2b3c0c1c2b8d6b581";
      const totalAmount = deliveryRequest.total_amount || (acceptedBid.amount + (deliveryRequest.service_fee || 1200));
      
      console.log('Initializing payment for amount:', totalAmount);
      
      // For testing purposes, we'll just simulate a successful payment
      // In a real implementation, we would use the Paystack library
      setTimeout(() => {
        // Set redirect URL for callback after payment
        localStorage.setItem('paystack_callback_url', 'https://newtrippaf.netlify.app/payment/success');
        
        // Generate a random reference number for the transaction
        const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        console.log('Payment reference:', reference);
        
        // Call the success handler with the reference
        handlePaymentSuccess(reference);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      setIsProcessing(false);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initialize payment',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      if (!deliveryRequest || !acceptedBid) return;
      
      // Update the delivery request with payment information
      const { error: updateError } = await supabase
        .from('delivery_requests')
        .update({
          payment_status: 'paid',
          payment_reference: reference,
          paid_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (updateError) {
        throw new Error('Failed to update payment status');
      }

      setIsProcessing(false);
      
      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully',
        status: 'success',
        duration: 5000,
      });

      // Navigate to the tracking page
      navigate(`/tracking/${requestId}`);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process payment',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsProcessing(true);
    initializePaystack();
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.secondary" />
          <Text>Loading payment details...</Text>
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
              <Heading size="md" color="red.400">Payment Information Not Found</Heading>
              <Text color="white">The payment details could not be loaded.</Text>
              <Button colorScheme="brand" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  // Calculate total amount if not already set
  const bidAmount = acceptedBid.amount;
  const serviceFee = deliveryRequest.service_fee || 1200;
  const totalAmount = deliveryRequest.total_amount || (bidAmount + serviceFee);

  return (
    <Container maxW="container.md" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={6}>
          <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="center">
                  <Icon as={FaCreditCard} w={8} h={8} color="brand.secondary" />
                  <Heading size="lg" color="brand.secondary">
                    Payment
                  </Heading>
                </HStack>

                <Divider />

                {/* Delivery Location Summary */}
                {deliveryRequest && (
                  <Box>
                    <Heading size="sm" color="brand.secondary" mb={2}>Delivery Details</Heading>
                    <Stack spacing={3} direction={{ base: 'column', md: 'row' }}>
                      <Box flex={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="green.400" />
                          <Text color="gray.200" fontWeight="bold">Pickup:</Text>
                        </HStack>
                        {deliveryRequest.pickup_address ? (
                          <Text color="white" ml={6} fontSize="sm">{deliveryRequest.pickup_address}</Text>
                        ) : (
                          <Text color="red.300" ml={6} fontSize="sm">No pickup address provided</Text>
                        )}
                      </Box>
                      <Box flex={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="red.400" />
                          <Text color="gray.200" fontWeight="bold">Dropoff:</Text>
                        </HStack>
                        {deliveryRequest.dropoff_address ? (
                          <Text color="white" ml={6} fontSize="sm">{deliveryRequest.dropoff_address}</Text>
                        ) : (
                          <Text color="red.300" ml={6} fontSize="sm">No dropoff address provided</Text>
                        )}
                      </Box>
                    </Stack>
                    <Divider my={3} />
                  </Box>
                )}

                {/* Payment amount summary */}
                {deliveryRequest && acceptedBid && (
                  <Box p={4} bg="rgba(26, 32, 44, 0.4)" borderRadius="md">
                    <VStack align="stretch" spacing={2}>
                      <Flex justify="space-between">
                        <Text color="gray.300">Rider Fee:</Text>
                        <Text color="white">₦{acceptedBid.amount.toLocaleString()}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.300">Service Fee:</Text>
                        <Text color="white">₦{(deliveryRequest.service_fee || 1200).toLocaleString()}</Text>
                      </Flex>
                      <Divider my={1} />
                      <Flex justify="space-between">
                        <Text color="white" fontWeight="bold">Total:</Text>
                        <Text color="brand.secondary" fontWeight="bold">
                          ₦{((deliveryRequest.total_amount || 0) || (acceptedBid.amount + (deliveryRequest.service_fee || 1200))).toLocaleString()}
                        </Text>
                      </Flex>
                    </VStack>
                  </Box>
                )}

                <Heading size="sm" color="brand.secondary">Payment Method</Heading>

                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired isInvalid={!!formErrors.fullName}>
                      <FormLabel color="gray.300">Full Name</FormLabel>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        bg="whiteAlpha.100"
                        color="white"
                        borderColor="whiteAlpha.300"
                      />
                      {formErrors.fullName && (
                        <FormErrorMessage>{formErrors.fullName}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isRequired isInvalid={!!formErrors.email}>
                      <FormLabel color="gray.300">Email Address</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        bg="whiteAlpha.100"
                        color="white"
                        borderColor="whiteAlpha.300"
                      />
                      {formErrors.email && (
                        <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isRequired isInvalid={!!formErrors.phone}>
                      <FormLabel color="gray.300">Phone Number</FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        bg="whiteAlpha.100"
                        color="white"
                        borderColor="whiteAlpha.300"
                      />
                      {formErrors.phone && (
                        <FormErrorMessage>{formErrors.phone}</FormErrorMessage>
                      )}
                    </FormControl>

                    <RadioGroup
                      onChange={handlePaymentMethodChange}
                      value={formData.paymentMethod}
                      colorScheme="brand"
                    >
                      <Stack direction="column" spacing={3}>
                        <Radio value="card">
                          <Text color="white">Credit/Debit Card</Text>
                        </Radio>
                        <Radio value="bank">
                          <Text color="white">Bank Transfer</Text>
                        </Radio>
                        <Radio value="ussd">
                          <Text color="white">USSD</Text>
                        </Radio>
                        <Radio value="qr">
                          <Text color="white">QR Code</Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>

                    <HStack mt={2} color="gray.400" fontSize="sm" justify="center">
                      <Icon as={FaShieldAlt} />
                      <Text>Your payment information is secure</Text>
                      <Icon as={FaLock} />
                    </HStack>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      mt={4}
                      isLoading={isProcessing}
                      loadingText="Processing..."
                      leftIcon={<FaCreditCard />}
                    >
                      Pay ₦{totalAmount.toLocaleString()}
                    </Button>

                    <Text color="gray.400" fontSize="xs" textAlign="center">
                      By clicking Pay, you agree to our terms of service and payment processing policies.
                    </Text>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </ScaleFade>
    </Container>
  );
};

export default PaymentPage; 