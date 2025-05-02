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
  Icon,
  ScaleFade,
  Spinner,
  Badge,
  Divider,
  Stack,
  Avatar,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FaBicycle, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

interface DeliveryRequest {
  id: string;
  delivery_type: string;
  pickup_location: string;
  dropoff_location: string;
  item_description: string;
  weight?: number;
  dimensions?: string;
  status: string;
}

interface Profile {
  full_name: string;
  rating: number;
}

interface Bid {
  id: string;
  delivery_request_id: string;
  rider_id: string;
  amount: number;
  estimated_time: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  rider_name?: string;
  rider_rating?: number;
  rider?: Profile;
}

interface SupabaseBid extends Omit<Bid, 'profiles'> {
  profiles: Profile;
}

const BiddingPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryRequest();
    fetchBids();

    // Subscribe to new bids
    const subscription = supabase
      .channel('bids')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'bids',
          filter: `request_id=eq.${requestId}`
        }, 
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [requestId]);

  const fetchDeliveryRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;
      setRequest(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch delivery request details',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const fetchBids = async () => {
    try {
      console.log('Fetching bids for request:', requestId);
      
      // First, verify the request ID
      if (!requestId) {
        throw new Error('No request ID provided');
      }

      // First verify that the user has access to this delivery request
      const { data: requestData, error: requestError } = await supabase
        .from('delivery_requests')
        .select('id, user_id')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching delivery request:', requestError);
        throw new Error('Could not verify access to delivery request');
      }

      if (!requestData) {
        throw new Error('Delivery request not found');
      }

      if (requestData.user_id !== user?.id) {
        throw new Error('You do not have permission to view these bids');
      }

      // Now fetch the bids
      console.log('Fetching bids...');
      
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          riders:rider_id (
            rating
          )
        `)
        .eq('delivery_request_id', requestId)
        .eq('status', 'pending')
        .order('amount', { ascending: true })
        .order('created_at', { ascending: true });

      if (bidsError) {
        console.error('Supabase error details:', {
          message: bidsError.message,
          details: bidsError.details,
          hint: bidsError.hint,
          code: bidsError.code
        });
        throw new Error(`Database error: ${bidsError.message}${bidsError.details ? ` - ${bidsError.details}` : ''}`);
      }

      console.log('Received bids data:', bidsData);

      const formattedBids = (bidsData || []).map((bid: any) => ({
        id: bid.id,
        delivery_request_id: bid.delivery_request_id,
        rider_id: bid.rider_id,
        amount: bid.amount,
        estimated_time: bid.estimated_time,
        status: bid.status,
        created_at: bid.created_at,
        rider_name: 'Rider ' + bid.rider_id.substring(0, 4),
        rider_rating: bid.riders?.rating || 0,
        rider: bid.riders
      })) as Bid[];

      console.log('Formatted bids:', formattedBids);
      setBids(formattedBids);
    } catch (error: any) {
      console.error('Full error details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch bids',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const acceptBid = async (bidId: string) => {
    try {
      // Start a transaction to update both the bid and delivery request
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId)
        .select()
        .single();

      if (bidError) throw bidError;

      // Update delivery request status
      const { error: requestError } = await supabase
        .from('delivery_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Reject all other bids for this delivery request
      const { error: rejectError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('delivery_request_id', requestId)
        .neq('id', bidId);

      if (rejectError) throw rejectError;

      toast({
        title: 'Success',
        description: 'Bid accepted successfully',
        status: 'success',
        duration: 5000,
      });

      // Navigate to the order summary page
      navigate(`/order-summary/${requestId}/${bidId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to accept bid',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.secondary" />
          <Text>Loading delivery request...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={8}>
          <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="center">
                  <Icon as={FaBicycle} w={8} h={8} color="brand.secondary" />
                  <Heading size="lg" color="brand.secondary">
                    Delivery Request Details
                  </Heading>
                </HStack>

                {request && (
                  <>
                    <Divider />
                    <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
                      <Box flex={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="green.400" />
                          <Text color="gray.200" fontWeight="bold">Pickup:</Text>
                        </HStack>
                        <Text color="white" ml={6}>{request.pickup_location}</Text>
                      </Box>
                      <Box flex={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="red.400" />
                          <Text color="gray.200" fontWeight="bold">Dropoff:</Text>
                        </HStack>
                        <Text color="white" ml={6}>{request.dropoff_location}</Text>
                      </Box>
                    </Stack>
                    <Text color="gray.200">
                      <strong>Item:</strong> {request.item_description}
                    </Text>
                    {request.weight && (
                      <Text color="gray.200">
                        <strong>Weight:</strong> {request.weight}kg
                      </Text>
                    )}
                    {request.dimensions && (
                      <Text color="gray.200">
                        <strong>Dimensions:</strong> {request.dimensions}
                      </Text>
                    )}
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="space-between">
                  <Heading size="md" color="brand.secondary">Available Bids</Heading>
                  <Badge colorScheme={bids.length > 0 ? "green" : "yellow"}>
                    {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
                  </Badge>
                </HStack>

                {bids.length === 0 ? (
                  <VStack py={8} spacing={4}>
                    <Spinner size="lg" color="brand.secondary" />
                    <Text color="gray.200" textAlign="center">
                      Waiting for rider bids...
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      Riders will be notified of your delivery request and start placing their bids soon.
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {bids.map((bid) => (
                      <Card key={bid.id} bg="rgba(26, 26, 46, 0.6)">
                        <CardBody>
                          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="space-between" align="center">
                            <HStack spacing={4}>
                              <Avatar size="md" name={bid.rider_name} />
                              <Box>
                                <Text color="white" fontWeight="bold">{bid.rider_name}</Text>
                                <HStack spacing={1}>
                                  <Icon as={FaStar} color="yellow.400" />
                                  <Text color="gray.300" fontSize="sm">
                                    {bid.rider_rating?.toFixed(1)}
                                  </Text>
                                </HStack>
                                <Text color="gray.300" fontSize="sm">
                                  {formatDate(bid.created_at)}
                                </Text>
                              </Box>
                            </HStack>
                            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} align="center">
                              <VStack spacing={2}>
                                <HStack>
                                  <Icon as={FaMoneyBillWave} color="green.400" />
                                  <Text color="white" fontWeight="bold">
                                    ₦{bid.amount.toLocaleString()}
                                  </Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaClock} color="blue.400" />
                                  <Text color="white" fontWeight="bold">
                                    {bid.estimated_time}
                                  </Text>
                                </HStack>
                              </VStack>
                              {request?.status === 'pending' && (
                                <Button
                                  colorScheme="brand"
                                  size="sm"
                                  onClick={() => acceptBid(bid.id)}
                                >
                                  Accept Bid
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </ScaleFade>
    </Container>
  );
};

export default BiddingPage; 