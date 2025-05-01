import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Stack,
  StackDivider,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Bid, DeliveryRequest } from '../types';

const BiddingPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    fetchDeliveryRequestAndBids();
  }, [requestId]);

  const fetchDeliveryRequestAndBids = async () => {
    try {
      // Fetch delivery request
      const { data: request, error: requestError } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;
      setDeliveryRequest(request);

      // Fetch bids
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('delivery_request_id', requestId)
        .order('amount', { ascending: true });

      if (bidsError) throw bidsError;
      setBids(bidsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch delivery request and bids',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      if (error) throw error;

      // Update delivery request status
      await supabase
        .from('delivery_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      toast({
        title: 'Bid accepted',
        description: 'Redirecting to payment...',
        status: 'success',
        duration: 3000,
      });

      // Here you would typically redirect to a payment page
      // navigate(`/payment/${bidId}`);
    } catch (error) {
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
      <Box p={8} display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!deliveryRequest) {
    return (
      <Box p={8}>
        <Text>Delivery request not found</Text>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack spacing={8}>
        <Heading>Available Bids</Heading>
        <Text>Select a bid for your delivery request</Text>

        <Stack spacing={4} width="full">
          {bids.map((bid) => (
            <Card key={bid.id} variant="outline">
              <CardBody>
                <Stack divider={<StackDivider />} spacing={4}>
                  <Box>
                    <Text fontSize="lg" fontWeight="bold">
                      ${bid.amount}
                    </Text>
                    <Text color="gray.600">Estimated time: {bid.estimated_time}</Text>
                  </Box>
                  <Button
                    colorScheme="blue"
                    onClick={() => handleAcceptBid(bid.id)}
                    isDisabled={bid.status !== 'pending'}
                  >
                    {bid.status === 'pending' ? 'Accept Bid' : 'Bid Accepted'}
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          ))}

          {bids.length === 0 && (
            <Text textAlign="center" color="gray.600">
              No bids available yet. Please check back later.
            </Text>
          )}
        </Stack>
      </VStack>
    </Box>
  );
};

export default BiddingPage; 