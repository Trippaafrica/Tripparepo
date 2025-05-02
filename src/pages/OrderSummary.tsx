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
  Input,
  useToast,
  Divider,
  Stack,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FaBicycle, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaBox } from 'react-icons/fa';
import { usePaystackPayment } from 'react-paystack';

interface DeliveryRequest {
  id: string;
  delivery_type: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  package_weight?: number;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
}

interface Bid {
  id: string;
  amount: number;
  estimated_time: string;
  rider_id: string;
}

const SERVICE_CHARGE = 1000; // Service charge in Naira

const OrderSummary = () => {
  const { requestId, bidId } = useParams<{ requestId: string; bidId: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [bid, setBid] = useState<Bid | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [requestId, bidId]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch delivery request details
      const { data: requestData, error: requestError } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;
      setRequest(requestData);

      // Fetch bid details
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', bidId)
        .single();

      if (bidError) throw bidError;
      setBid(bidData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalFee = (bidAmount: number) => {
    return bidAmount + SERVICE_CHARGE;
  };

  const config = {
    reference: `pay_${requestId}_${Date.now()}`,
    email: user?.email || '',
    amount: bid ? calculateTotalFee(bid.amount) * 100 : 0, // Convert to kobo
    publicKey: 'pk_live_023a80793215431bdc8c277e9591b024005202a5',
  };

  const onSuccess = async (reference: any) => {
    try {
      // Update payment status in the database
      const { error: updateError } = await supabase
        .from('delivery_requests')
        .update({
          payment_status: 'paid',
          payment_reference: reference.reference,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully',
        status: 'success',
        duration: 5000,
      });

      // Navigate to tracking page or dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const onClose = () => {
    toast({
      title: 'Payment Cancelled',
      description: 'You can try the payment again when ready',
      status: 'warning',
      duration: 5000,
    });
  };

  const initializePayment = usePaystackPayment(config);

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

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8}>
        <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack spacing={4} justify="center">
                <Box as={FaBicycle} fontSize="2em" color="brand.secondary" />
                <Heading size="lg" color="brand.secondary">
                  Order Summary
                </Heading>
              </HStack>

              <Divider />

              {request && (
                <>
                  <Box>
                    <Text color="gray.200" fontWeight="bold" mb={2}>Delivery Details</Text>
                    <VStack align="start" spacing={3}>
                      <Box>
                        <HStack>
                          <Box as={FaMapMarkerAlt} fontSize="1.2em" color="green.400" />
                          <Text color="white" fontWeight="bold">Pickup Location</Text>
                        </HStack>
                        <Text color="white" ml={6}>{request.pickup_location}</Text>
                        <VStack align="start" spacing={1} ml={6} mt={1}>
                          <Text color="gray.300">Contact: {request.sender_name}</Text>
                          <Text color="gray.300">Phone: {request.sender_phone}</Text>
                        </VStack>
                      </Box>

                      <Box>
                        <HStack>
                          <Box as={FaMapMarkerAlt} fontSize="1.2em" color="red.400" />
                          <Text color="white" fontWeight="bold">Dropoff Location</Text>
                        </HStack>
                        <Text color="white" ml={6}>{request.dropoff_location}</Text>
                        <VStack align="start" spacing={1} ml={6} mt={1}>
                          <Text color="gray.300">Contact: {request.receiver_name}</Text>
                          <Text color="gray.300">Phone: {request.receiver_phone}</Text>
                        </VStack>
                      </Box>

                      {request.package_weight && (
                        <HStack>
                          <Box as={FaBox} fontSize="1.2em" color="blue.400" />
                          <Text color="white">Package Weight: {request.package_weight}kg</Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  <Divider />

                  {bid && (
                    <Box>
                      <Text color="gray.200" fontWeight="bold" mb={2}>Payment Details</Text>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Box as={FaMoneyBillWave} fontSize="1.2em" color="green.400" />
                          <Text color="white">Delivery Fee: ₦{bid.amount.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Box as={FaMoneyBillWave} fontSize="1.2em" color="yellow.400" />
                          <Text color="white">Service Charge: ₦{SERVICE_CHARGE.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Box as={FaMoneyBillWave} fontSize="1.2em" color="purple.400" />
                          <Text color="white" fontWeight="bold">Total Amount: ₦{calculateTotalFee(bid.amount).toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Box as={FaClock} fontSize="1.2em" color="blue.400" />
                          <Text color="white">Estimated Time: {bid.estimated_time}</Text>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={() => {
                      initializePayment(onSuccess, onClose);
                    }}
                    isDisabled={!bid}
                  >
                    Pay Now
                  </Button>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default OrderSummary; 