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
  Divider,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FaBicycle, FaMoneyBillWave, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { usePaystackPayment } from 'react-paystack';

interface DeliveryRequest {
  id: string;
  delivery_type: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  package_weight?: number;
}

interface Bid {
  id: string;
  amount: number;
  estimated_time: string;
  rider_id: string;
}

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

  const config = {
    reference: `pay_${requestId}_${Date.now()}`,
    email: user?.email || '',
    amount: bid ? bid.amount * 100 : 0, // Convert to kobo
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
                <Icon as={FaBicycle} w={8} h={8} color="brand.secondary" />
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
                      <HStack>
                        <Icon as={FaMapMarkerAlt} color="green.400" />
                        <Text color="white">From: {request.pickup_location}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaMapMarkerAlt} color="red.400" />
                        <Text color="white">To: {request.dropoff_location}</Text>
                      </HStack>
                      {request.package_weight && (
                        <Text color="white">Weight: {request.package_weight}kg</Text>
                      )}
                    </VStack>
                  </Box>

                  <Divider />

                  {bid && (
                    <Box>
                      <Text color="gray.200" fontWeight="bold" mb={2}>Payment Details</Text>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Icon as={FaMoneyBillWave} color="green.400" />
                          <Text color="white">Amount: ₦{bid.amount.toLocaleString()}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaClock} color="blue.400" />
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