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
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FaBicycle, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaStar, FaSortAmountDown, FaSortAmountUp, FaFilter } from 'react-icons/fa';
import CountdownTimer from '../components/CountdownTimer';
import RiderProfileCard from '../components/RiderProfileCard';

interface DeliveryRequest {
  id: string;
  delivery_type: string;
  pickup_address: string;
  dropoff_address: string;
  item_description: string;
  weight?: number;
  dimensions?: string;
  status: string;
}

interface Profile {
  full_name: string;
  rating: number;
  avatar_url?: string;
}

interface Rider {
  id: string;
  rating: number;
  vehicle_image?: string;
  vehicle_type?: 'bike' | 'truck' | 'van' | 'fuel';
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
  rider?: Rider;
  profile?: Profile;
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
  const [waitingStartTime] = useState(new Date());
  const [sortBy, setSortBy] = useState<'amount_asc' | 'amount_desc' | 'time_asc' | 'time_desc'>('amount_asc');

  useEffect(() => {
    fetchDeliveryRequest();
    fetchBids();

    // Subscribe to new bids
    const subscription = supabase
      .channel(`bids-${requestId}`) // Use a unique channel name
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'bids',
          filter: `delivery_request_id=eq.${requestId}`
        }, 
        (payload) => {
          console.log('New bid received:', payload);
          fetchBids();
        }
      )
      .subscribe();

    // Add polling to ensure bids update
    const pollingInterval = setInterval(() => {
      console.log('Polling for new bids...');
      fetchBids();
    }, 10000); // Poll every 10 seconds

    return () => {
      subscription.unsubscribe();
      clearInterval(pollingInterval);
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

      // Now fetch the bids with all required information - simplified query to debug
      console.log('Fetching bids...');
      
      // First try a simple query to verify basic functionality
      const { data: simpleBidsData, error: simpleBidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('delivery_request_id', requestId);

      if (simpleBidsError) {
        console.error('Error with simple bids query:', simpleBidsError);
        throw new Error(`Simple query error: ${simpleBidsError.message}`);
      }

      console.log('Simple bids query found:', simpleBidsData?.length || 0, 'bids');

      // Now try the full query
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          *,
          profiles:rider_id (
            id,
            full_name,
            rating
          )
        `)
        .eq('delivery_request_id', requestId);

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

      // Filter to only show pending bids
      const pendingBids = bidsData?.filter(bid => bid.status === 'pending') || [];
      console.log('Pending bids:', pendingBids.length);

      const formattedBids = (pendingBids || []).map((bid: any) => ({
        id: bid.id,
        delivery_request_id: bid.delivery_request_id,
        rider_id: bid.rider_id,
        amount: typeof bid.amount === 'number' ? bid.amount : parseFloat(bid.amount) || 0,
        estimated_time: bid.estimated_time || '30 minutes',
        status: bid.status,
        created_at: bid.created_at,
        rider_name: bid.profiles?.full_name || 'Rider ' + bid.rider_id.substring(0, 4),
        rider_rating: bid.profiles?.rating || 4.5, // Fallback to a good rating if none exists
        rider: {
          id: bid.rider_id,
          rating: bid.profiles?.rating || 4.5,
          vehicle_type: bid.vehicle_type || request?.delivery_type || 'bike'
        },
        profile: {
          id: bid.profiles?.id,
          full_name: bid.profiles?.full_name || 'Rider ' + bid.rider_id.substring(0, 4),
          rating: bid.profiles?.rating || 4.5
        }
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

  // Format relative time for bid placement (e.g., "5 minutes ago")
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const bidTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - bidTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const acceptBid = async (bidId: string) => {
    try {
      console.log('Accepting bid:', bidId, 'for request:', requestId);

      // First verify ownership of the delivery request
      const { data: requestData, error: requestError } = await supabase
        .from('delivery_requests')
        .select('user_id, status')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error verifying request ownership:', requestError);
        throw new Error('Could not verify delivery request ownership');
      }

      if (!requestData) {
        throw new Error('Delivery request not found');
      }

      if (requestData.user_id !== user?.id) {
        throw new Error('You do not have permission to accept bids for this delivery request');
      }

      if (requestData.status !== 'pending') {
        throw new Error('This delivery request is no longer pending');
      }

      // Start a transaction to update both the bid and delivery request
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId)
        .eq('delivery_request_id', requestId) // Additional safety check
        .select()
        .single();

      if (bidError) {
        console.error('Error updating bid status:', bidError);
        throw new Error('Failed to accept bid');
      }

      console.log('Successfully updated bid status');

      // Update delivery request status - removed accepted_bid_id which doesn't exist in schema
      const { error: requestUpdateError } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'accepted',
          service_fee: 1200, // Add service fee
          total_amount: bid.amount + 1200 // Calculate total amount
        })
        .eq('id', requestId)
        .eq('user_id', user?.id); // Additional safety check

      if (requestUpdateError) {
        console.error('Error updating delivery request:', requestUpdateError);
        // Try to revert the bid status
        await supabase
          .from('bids')
          .update({ status: 'pending' })
          .eq('id', bidId);
        throw new Error('Failed to update delivery request status');
      }

      console.log('Successfully updated delivery request status');

      // Reject all other bids for this delivery request
      const { error: rejectError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('delivery_request_id', requestId)
        .neq('id', bidId);

      if (rejectError) {
        console.error('Error rejecting other bids:', rejectError);
        // Don't throw here as the main operation succeeded
        console.warn('Failed to reject other bids, but main operation succeeded');
      } else {
        console.log('Successfully rejected other bids');
      }

      toast({
        title: 'Success',
        description: 'Bid accepted successfully',
        status: 'success',
        duration: 5000,
      });

      // Navigate to the order summary page
      navigate(`/order-summary/${requestId}/${bidId}`);
    } catch (error: any) {
      console.error('Full error details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept bid',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Calculate time elapsed since request creation
  const getTimeElapsed = () => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - waitingStartTime.getTime()) / (1000 * 60));
    return diffInMinutes;
  };

  // Refresh bids when the timer completes
  const handleTimerComplete = () => {
    fetchBids();
  };

  // Get sorted bids based on current sort criterion
  const getSortedBids = () => {
    return [...bids].sort((a, b) => {
      switch (sortBy) {
        case 'amount_asc':
          return a.amount - b.amount;
        case 'amount_desc':
          return b.amount - a.amount;
        case 'time_asc':
          return a.estimated_time.localeCompare(b.estimated_time);
        case 'time_desc':
          return b.estimated_time.localeCompare(a.estimated_time);
        default:
          return 0;
      }
    });
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
                        <Text color="white" ml={6}>{request.pickup_address}</Text>
                      </Box>
                      <Box flex={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="red.400" />
                          <Text color="gray.200" fontWeight="bold">Dropoff:</Text>
                        </HStack>
                        <Text color="white" ml={6}>{request.dropoff_address}</Text>
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
                  
                  <HStack>
                    {bids.length > 0 && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          size="sm"
                          aria-label="Sort options"
                          icon={<FaFilter />}
                          variant="outline"
                          colorScheme="brand"
                        />
                        <MenuList bg="rgba(26, 32, 44, 0.9)" borderColor="rgba(157, 78, 221, 0.2)">
                          <MenuItem 
                            icon={<FaSortAmountDown />} 
                            onClick={() => setSortBy('amount_asc')}
                            bg={sortBy === 'amount_asc' ? 'rgba(157, 78, 221, 0.2)' : 'transparent'}
                          >
                            Price: Low to High
                          </MenuItem>
                          <MenuItem 
                            icon={<FaSortAmountUp />} 
                            onClick={() => setSortBy('amount_desc')}
                            bg={sortBy === 'amount_desc' ? 'rgba(157, 78, 221, 0.2)' : 'transparent'}
                          >
                            Price: High to Low
                          </MenuItem>
                          <MenuItem 
                            icon={<FaClock />} 
                            onClick={() => setSortBy('time_asc')}
                            bg={sortBy === 'time_asc' ? 'rgba(157, 78, 221, 0.2)' : 'transparent'}
                          >
                            Time: Shortest First
                          </MenuItem>
                          <MenuItem 
                            icon={<FaClock />} 
                            onClick={() => setSortBy('time_desc')}
                            bg={sortBy === 'time_desc' ? 'rgba(157, 78, 221, 0.2)' : 'transparent'}
                          >
                            Time: Longest First
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                    
                    <Badge colorScheme={bids.length > 0 ? "green" : "yellow"} fontSize="sm">
                      {bids.length} {bids.length === 1 ? 'bid' : 'bids'} available
                    </Badge>
                  </HStack>
                </HStack>

                {bids.length === 0 ? (
                  <VStack py={8} spacing={4} align="center">
                    <CountdownTimer duration={15} onComplete={handleTimerComplete} />
                    <Text color="gray.200" textAlign="center" mt={2}>
                      Waiting for rider bids...
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      Your delivery request has been sent to nearby riders.
                      <br />Bids should start appearing soon.
                    </Text>
                    {getTimeElapsed() > 3 && (
                      <Button 
                        mt={4} 
                        variant="outline" 
                        colorScheme="brand" 
                        size="sm"
                        onClick={() => fetchBids()}
                      >
                        Refresh Bids
                      </Button>
                    )}
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {getSortedBids().map((bid) => (
                      <Box key={bid.id}>
                        <RiderProfileCard
                          riderName={bid.rider_name || ''}
                          rating={bid.rider_rating || 0}
                          vehicleType={bid.rider?.vehicle_type || request?.delivery_type as any || 'bike'}
                          estimatedTime={bid.estimated_time}
                          amount={bid.amount}
                          bidTime={formatRelativeTime(bid.created_at)}
                        />
                        {request?.status === 'pending' && (
                          <Button
                            colorScheme="brand"
                            size="sm"
                            onClick={() => acceptBid(bid.id)}
                            mt={2}
                            width="100%"
                          >
                            Accept Bid
                          </Button>
                        )}
                      </Box>
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