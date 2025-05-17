import { useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaMapMarkedAlt } from 'react-icons/fa';
import { supabase } from '../services/supabase';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Get the reference and request ID from URL parameters
  const reference = searchParams.get('reference');
  const requestId = searchParams.get('requestId');

  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (!reference || !requestId) {
        toast({
          title: 'Error',
          description: 'Missing payment information',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      try {
        const { error } = await supabase
          .from('delivery_requests')
          .update({
            payment_status: 'paid',
            payment_reference: reference,
          })
          .eq('id', requestId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Payment status updated successfully',
          status: 'success',
          duration: 5000,
        });

        // Check if there's a callback URL stored in localStorage
        const callbackUrl = localStorage.getItem('paystack_callback_url');
        if (callbackUrl) {
          // Clear the stored URL
          localStorage.removeItem('paystack_callback_url');
          // Redirect to the callback URL after a short delay
          setTimeout(() => {
            window.location.href = callbackUrl;
          }, 3000);
        }
      } catch (error: any) {
        console.error('Error updating payment status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update payment status',
          status: 'error',
          duration: 5000,
        });
      }
    };

    updatePaymentStatus();
  }, [reference, requestId, toast, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleTrackOrder = () => {
    if (requestId) {
      navigate(`/track/${requestId}`);
    } else {
      toast({
        title: 'Error',
        description: 'Order tracking information not found',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8}>
        <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
          <CardBody>
            <VStack spacing={6} align="center">
              <Box fontSize="5em" color="green.400">
                <FaCheckCircle />
              </Box>
              
              <Heading size="lg" color="brand.secondary" textAlign="center">
                Payment Successful!
              </Heading>

              <Text color="gray.200" textAlign="center">
                Your payment has been processed successfully.
                {reference && (
                  <Text as="span" display="block" fontSize="sm" mt={2}>
                    Reference: {reference}
                  </Text>
                )}
              </Text>
              
              <Text color="gray.300" fontSize="sm" textAlign="center">
                You will be redirected to the orders page shortly...
              </Text>

              <HStack spacing={4} pt={4}>
                <Button
                  leftIcon={<Box as={FaHome} />}
                  colorScheme="gray"
                  onClick={handleGoHome}
                >
                  Go Home
                </Button>
                <Button
                  leftIcon={<Box as={FaMapMarkedAlt} />}
                  colorScheme="brand"
                  onClick={handleTrackOrder}
                >
                  Track Order
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default PaymentSuccess; 