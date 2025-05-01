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
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FaTruck, FaMoneyBillWave, FaClock } from 'react-icons/fa';

interface Bid {
  id: string;
  amount: number;
  delivery_time: string;
  created_at: string;
  user_id: string;
}

const BiddingPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [amount, setAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBids();
    const subscription = supabase
      .channel('bids')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, () => {
        fetchBids();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [requestId]);

  const fetchBids = async () => {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bids',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setBids(data || []);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to place a bid',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      const { error } = await supabase.from('bids').insert([
        {
          request_id: requestId,
          user_id: user.id,
          amount: parseFloat(amount),
          delivery_time: deliveryTime,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Bid placed successfully',
        status: 'success',
        duration: 3000,
      });

      setAmount('');
      setDeliveryTime('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place bid',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Icon as={FaTruck} w={10} h={10} color="brand.secondary" />
            <Heading
              size="lg"
              bgGradient="linear(to-r, brand.secondary, brand.primary)"
              bgClip="text"
            >
              Delivery Bids
            </Heading>
          </VStack>

          <Card width="100%">
            <CardBody>
              <form onSubmit={handleSubmitBid}>
                <VStack spacing={4}>
                  <HStack width="100%" spacing={4}>
                    <Box flex={1}>
                      <Text mb={2} display="flex" alignItems="center" gap={2}>
                        <Icon as={FaMoneyBillWave} color="brand.secondary" />
                        Bid Amount
                      </Text>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount in ₦"
                        required
                      />
                    </Box>
                    <Box flex={1}>
                      <Text mb={2} display="flex" alignItems="center" gap={2}>
                        <Icon as={FaClock} color="brand.secondary" />
                        Delivery Time
                      </Text>
                      <Input
                        type="datetime-local"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        required
                      />
                    </Box>
                  </HStack>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={isLoading}
                    leftIcon={<Icon as={FaTruck} />}
                  >
                    Place Bid
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          <VStack spacing={4} width="100%" align="stretch">
            <Heading size="md">Current Bids</Heading>
            {bids.map((bid) => (
              <Card key={bid.id}>
                <CardBody>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">₦{bid.amount}</Text>
                      <Text fontSize="sm" color="gray.400">
                        Delivery by: {new Date(bid.delivery_time).toLocaleString()}
                      </Text>
                    </VStack>
                    <Text fontSize="sm" color="gray.400">
                      {new Date(bid.created_at).toLocaleString()}
                    </Text>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </VStack>
      </ScaleFade>
    </Container>
  );
};

export default BiddingPage; 