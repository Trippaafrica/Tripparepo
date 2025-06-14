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
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FaBicycle, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaStar, FaSortAmountDown, FaSortAmountUp, FaFilter, FaRoute, FaSync } from 'react-icons/fa';
import CountdownTimer from '../components/CountdownTimer';
import RiderProfileCard from '../components/RiderProfileCard';
import { calculateDistance, estimateDeliveryTime } from '../services/distance';

interface DeliveryRequest {
  id: string;
  delivery_type: string;
  pickup_address: string;
  dropoff_address: string;
  item_description: string;
  package_weight?: number;
  dimensions?: string;
  status: string;
  pickup_coordinates?: {
    lat: number;
    lng: number;
  };
  dropoff_coordinates?: {
    lat: number;
    lng: number;
  };
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  dropoff_contact_name?: string;
  dropoff_contact_phone?: string;
  estimated_distance_km?: number;
  estimated_duration?: string;
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
  const [showRefreshButton, setShowRefreshButton] = useState(false);

  useEffect(() => {
    fetchDeliveryRequest();
    
    // Show refresh button after 10 seconds
    const refreshTimer = setTimeout(() => {
      setShowRefreshButton(true);
    }, 10000); // 10 seconds
    
    return () => clearTimeout(refreshTimer);
  }, [requestId]);

  useEffect(() => {
    if (request) {
      // Initial fetch of bids
      fetchBids();
      calculateRouteInfo();

      console.log('Setting up realtime subscription for bid updates on request:', requestId);
      
      // Setup Supabase realtime subscription with improved logging
      const subscription = supabase
        .channel(`public:bids:delivery_request_id=eq.${requestId}`)
        .on('postgres_changes', 
          { 
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public', 
            table: 'bids',
            filter: `delivery_request_id=eq.${requestId}`
          }, 
          (payload) => {
            console.log('🔔 Realtime notification received:', payload);
            // Force refresh bids when we get a notification
            fetchBids();
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for bids channel:`, status);
        });

      // Also subscribe to delivery_requests table for this request
      const requestSubscription = supabase
        .channel(`public:delivery_requests:id=eq.${requestId}`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_requests',
            filter: `id=eq.${requestId}`
          },
          (payload) => {
            console.log('🔄 Delivery request update received:', payload);
            fetchDeliveryRequest();
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for delivery request channel:`, status);
        });

      // Remove the automatic polling - keep only the realtime subscriptions
      // and manual refresh button

      return () => {
        console.log('Cleaning up bid subscriptions');
        subscription.unsubscribe();
        requestSubscription.unsubscribe();
      };
    }
  }, [request, requestId]);

  const calculateRouteInfo = async () => {
    // Only calculate if we don't already have the values
    if (request && !request.estimated_distance_km) {
      if (request?.pickup_coordinates && request?.dropoff_coordinates) {
        try {
          // Calculate distance and duration between pickup and dropoff
          const result = await calculateDistance(
            request.pickup_coordinates,
            request.dropoff_coordinates
          );
          
          // Update request with distance and duration info
          setRequest(prev => prev ? {
            ...prev,
            estimated_distance_km: result.distance,
            estimated_duration: result.duration
          } : null);
          
        } catch (error) {
          console.error('Error calculating route info:', error);
          // Set fallback values
          setRequest(prev => prev ? {
            ...prev,
            estimated_distance_km: 5.3,
            estimated_duration: '25-35 minutes'
          } : null);
        }
      } else {
        // Fallback values if coordinates are not available
        setRequest(prev => prev ? {
          ...prev,
          estimated_distance_km: 5.3,
          estimated_duration: '25-35 minutes'
        } : null);
      }
    }
  };

  const fetchDeliveryRequest = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('delivery_requests')
        .select(`
          *,
          pickup_contact_name,
          pickup_contact_phone,
          dropoff_contact_name,
          dropoff_contact_phone
        `)
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
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random estimated time based on distance and vehicle type
  const generateEstimatedTime = (vehicleType: string) => {
    // Get the distance if available, or use a default
    const distance = request?.estimated_distance_km || 5.3;
    
    // Base minutes per kilometer based on vehicle type
    let baseMinutesPerKm = 0;
    switch(vehicleType) {
      case 'bike': baseMinutesPerKm = 2.5; break;   // 24km/h
      case 'truck': baseMinutesPerKm = 2.8; break;  // 21km/h
      case 'van': baseMinutesPerKm = 2.2; break;    // 27km/h
      case 'fuel': baseMinutesPerKm = 2.4; break;   // 25km/h
      default: baseMinutesPerKm = 2.5;              // Default
    }
    
    // Calculate base time in minutes based on distance
    const baseMinutes = Math.round(distance * baseMinutesPerKm);
    
    // Add randomness - between -10% and +30% of base time
    const randomFactor = 0.9 + (Math.random() * 0.4); // 0.9 to 1.3
    const minutes = Math.round(baseMinutes * randomFactor);
    
    // Add fixed time for pickup and dropoff - with randomness
    const logisticsTime = 15 + Math.floor(Math.random() * 10); // 15-24 minutes
    const totalMinutes = minutes + logisticsTime;
    
    // Format differently based on total time
    if (totalMinutes <= 30) {
      return `${totalMinutes} minutes`;
    } else if (totalMinutes <= 60) {
      // Range format for medium trips
      const lowerBound = Math.floor(totalMinutes / 5) * 5; // Round down to nearest 5
      const upperBound = lowerBound + 10;
      return `${lowerBound}-${upperBound} minutes`;
    } else {
      // Hours format for longer trips
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      
      if (remainingMinutes < 15) {
        return `About ${hours} hour${hours > 1 ? 's' : ''}`;
      } else if (remainingMinutes >= 45) {
        return `About ${hours + 1} hour${hours > 0 ? 's' : ''}`;
      } else {
        return `${hours}.5 hour${hours > 1 ? 's' : ''}`;
      }
    }
  };

  const fetchBids = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching bids for request:', requestId);
      
      // First, verify the request ID
      if (!requestId) {
        throw new Error('No request ID provided');
      }

      // Simple diagnostic query - log all bids in the system
      console.log('Checking for all bids in system...');
      const { data: allBidsData, error: allBidsError } = await supabase
        .from('bids')
        .select('*')
        .limit(20);
      
      if (allBidsError) {
        console.error('Error querying all bids:', allBidsError);
      } else {
        console.log('Latest bids in system:', allBidsData);
      }

      // Direct query for this specific request, without filtering by status
      console.log(`Looking for ALL bids specifically for request ${requestId}`);
      const { data: requestBids, error: requestBidsError } = await supabase
        .from('bids')
        .select(`
          id,
          delivery_request_id,
          rider_id,
          amount,
          status,
          created_at
        `)
        .eq('delivery_request_id', requestId);

      if (requestBidsError) {
        console.error('Error finding bids for this specific request:', requestBidsError);
      } else {
        console.log(`Found ${requestBids?.length || 0} bids for this request:`, requestBids);
      }

      // Final query - get all the data we need with joins
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          delivery_request_id,
          rider_id,
          amount,
          status,
          created_at,
          profiles:rider_id (
            id,
            full_name,
            rating
          )
        `)
        .eq('delivery_request_id', requestId);
        // Removed .eq('status', 'pending') to see ALL bids

      if (bidsError) {
        console.error('Error fetching bids with profile data:', bidsError);
        throw new Error(`Database error: ${bidsError.message}`);
      }

      console.log('Received bids data with profile information:', bidsData);

      // Filter to only pending bids for display
      const pendingBids = bidsData?.filter(bid => bid.status === 'pending') || [];
      console.log('Filtered to pending bids only:', pendingBids);

      const formattedBids = (pendingBids || []).map((bid: any) => {
        // Determine vehicle type based on request type or generate randomly
        const vehicleType = request?.delivery_type || ['bike', 'truck', 'van', 'fuel'][Math.floor(Math.random() * 4)] as 'bike' | 'truck' | 'van' | 'fuel';
        
        // Generate a random estimated time for this bid based on vehicle type and distance
        const estimatedTime = generateEstimatedTime(vehicleType);
        
        // Format the bid data
        const formattedBid = {
          id: bid.id,
          delivery_request_id: bid.delivery_request_id,
          rider_id: bid.rider_id,
          amount: typeof bid.amount === 'number' ? bid.amount : parseFloat(bid.amount) || 0,
          estimated_time: estimatedTime,
          status: bid.status,
          created_at: bid.created_at,
          rider_name: bid.profiles?.full_name || 'Rider ' + bid.rider_id.substring(0, 4),
          rider_rating: bid.profiles?.rating || 4.5, // Fallback to a good rating if none exists
          rider: {
            id: bid.rider_id,
            rating: bid.profiles?.rating || 4.5,
            vehicle_type: vehicleType
          },
          profile: {
            full_name: bid.profiles?.full_name || 'Rider ' + bid.rider_id.substring(0, 4),
            rating: bid.profiles?.rating || 4.5
          }
        };
        console.log('Formatted bid:', formattedBid);
        return formattedBid;
      }) as Bid[];

      console.log('Final formatted bids array:', formattedBids);
      setBids(formattedBids);
    } catch (error: any) {
      console.error('Full error details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch bids',
        status: 'error',
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
        .select('user_id, status, pickup_address, dropoff_address, delivery_type, item_description')
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
        .select() // Simple select without profiles join
        .single();

      if (bidError) {
        console.error('Error updating bid status:', bidError);
        throw new Error('Failed to accept bid');
      }

      console.log('Successfully updated bid status, bid data:', bid);

      // Get the bid amount for order creation
      const bidAmount = typeof bid.amount === 'number' ? bid.amount : parseFloat(bid.amount) || 0;

      // Update delivery request status to accepted
      const { data: requestUpdateData, error: requestUpdateError } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'accepted'
        })
        .eq('id', requestId)
        .eq('user_id', user?.id) // Additional safety check
        .select();

      if (requestUpdateError) {
        console.error('Error updating delivery request:', requestUpdateError);
        console.error('Error details:', requestUpdateError.message, requestUpdateError.details, requestUpdateError.hint);
        // Try to revert the bid status
        await supabase
          .from('bids')
          .update({ status: 'pending' })
          .eq('id', bidId);
        throw new Error('Failed to update delivery request status');
      }

      console.log('Successfully updated delivery request status');

      // Create a delivery order record
      try {
        // Create an order record
        const { data: orderData, error: orderError } = await supabase
          .from('delivery_orders') // Using delivery_orders table
          .insert({
            delivery_request_id: requestId,
            rider_id: bid.rider_id,
            bid_id: bidId,
            amount: bidAmount,
            status: 'accepted',
            pickup_location: requestData.pickup_address,
            delivery_location: requestData.dropoff_address,
            delivery_status: 'pending'
            // Removed non-existent fields: service_fee, total_amount, pickup_code, dropoff_code, 
            // estimated_time, item_description, rider_name
          })
          .select()
          .single();
          
        if (orderError) {
          console.error('Error creating delivery order:', orderError);
          console.error('Order creation error details:', orderError.message, orderError.details, orderError.hint);
          // Don't throw here, as the main operation has succeeded
          // Silent failure - don't show error toast to user
        } else {
          console.log('Successfully created delivery order record:', orderData);
        }
      } catch (orderCreationError: any) {
        console.error('Exception in order creation:', orderCreationError);
        // Don't throw here, as the main operation has succeeded
      }

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

  // Add manual refresh function
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    setIsLoading(true);
    fetchBids();
    // Visual feedback by hiding the button briefly
    setShowRefreshButton(false);
    setTimeout(() => setShowRefreshButton(true), 2000);
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
                    
                    {/* Location information */}
                    <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
                      <Box flex={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="green.400" />
                          <Text color="gray.200" fontWeight="bold">Pickup:</Text>
                        </HStack>
                        <Text color="white" ml={6}>{request.pickup_address}</Text>
                        {request.pickup_contact_name && (
                          <Text color="gray.300" fontSize="sm" ml={6}>
                            Contact: {request.pickup_contact_name} ({request.pickup_contact_phone})
                          </Text>
                        )}
                      </Box>
                      <Box flex={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="red.400" />
                          <Text color="gray.200" fontWeight="bold">Dropoff:</Text>
                        </HStack>
                        <Text color="white" ml={6}>{request.dropoff_address}</Text>
                        {request.dropoff_contact_name && (
                          <Text color="gray.300" fontSize="sm" ml={6}>
                            Contact: {request.dropoff_contact_name} ({request.dropoff_contact_phone})
                          </Text>
                        )}
                      </Box>
                    </Stack>
                    
                    {/* Item information */}
                    <Text color="gray.200">
                      <strong>Item:</strong> {request.item_description}
                    </Text>
                    {request.package_weight && (
                      <Text color="gray.200">
                        <strong>Weight:</strong> {request.package_weight}kg
                      </Text>
                    )}
                    {request.dimensions && (
                      <Text color="gray.200">
                        <strong>Dimensions:</strong> {request.dimensions}
                      </Text>
                    )}
                    
                    {/* Route information */}
                    <Divider />
                    <HStack spacing={8} justify="space-between" flexWrap="wrap">
                      <Stat flex="1" minW="120px">
                        <StatLabel color="gray.400">
                          <Icon as={FaRoute} mr={1} />
                          Distance
                        </StatLabel>
                        <StatNumber color="white">
                          {request.estimated_distance_km?.toFixed(1) || "Calculating..."} km
                        </StatNumber>
                      </Stat>
                      
                      <Stat flex="1" minW="120px">
                        <StatLabel color="gray.400">
                          <Icon as={FaClock} mr={1} />
                          Estimated Time
                        </StatLabel>
                        <StatNumber color="white">
                          {request.estimated_duration || "Calculating..."}
                        </StatNumber>
                      </Stat>
                    </HStack>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Stack 
                  direction={{ base: "column", md: "row" }}
                  spacing={{ base: 3, md: 4 }}
                  justify="space-between"
                  align={{ base: "start", md: "center" }}
                  width="100%"
                >
                  <Heading 
                    size="md" 
                    color="brand.secondary"
                    bgGradient="linear(to-r, brand.primary, brand.secondary)"
                    bgClip="text"
                  >
                    Available Bids
                  </Heading>
                  
                  <Flex 
                    flexWrap="wrap" 
                    gap={2} 
                    align="center"
                    justify={{ base: "flex-start", md: "flex-end" }}
                    width={{ base: "100%", md: "auto" }}
                  >
                    {showRefreshButton && (
                      <Button
                        size={{ base: "xs", sm: "sm" }}
                        leftIcon={<FaSync />}
                        variant="solid"
                        colorScheme="brand"
                        onClick={handleManualRefresh}
                        isLoading={isLoading}
                        loadingText="Refreshing"
                        rounded="full"
                        px={4}
                        shadow="md"
                        _hover={{
                          transform: 'translateY(-2px)',
                          shadow: 'lg',
                        }}
                        transition="all 0.2s"
                      >
                        Refresh Bids
                      </Button>
                    )}
                    
                    {bids.length > 0 && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          size={{ base: "xs", sm: "sm" }}
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
                    
                    <Badge 
                      colorScheme={bids.length > 0 ? "green" : "yellow"} 
                      fontSize={{ base: "xs", sm: "sm" }}
                      py={1}
                      px={2}
                      borderRadius="full"
                    >
                      {bids.length} {bids.length === 1 ? 'bid' : 'bids'} available
                    </Badge>
                  </Flex>
                </Stack>

                {bids.length === 0 ? (
                  <VStack py={{ base: 6, md: 8 }} spacing={4} align="center">
                    <CountdownTimer duration={15} onComplete={handleTimerComplete} />
                    <Text color="gray.200" textAlign="center" mt={2}>
                      Waiting for rider bids...
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      Your delivery request has been sent to nearby riders.
                      <br />Bids should start appearing soon.
                    </Text>
                    
                    {showRefreshButton && (
                      <Button 
                        mt={4} 
                        size={{ base: "md", md: "md" }}
                        leftIcon={<FaSync />}
                        variant="solid"
                        colorScheme="brand"
                        onClick={handleManualRefresh}
                        isLoading={isLoading}
                        loadingText="Refreshing"
                        rounded="full"
                        px={{ base: 4, md: 6 }}
                        py={{ base: 4, md: 5 }}
                        shadow="md"
                        _hover={{
                          transform: 'translateY(-2px)',
                          shadow: 'lg',
                        }}
                        transition="all 0.2s"
                        width={{ base: "full", md: "auto" }}
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