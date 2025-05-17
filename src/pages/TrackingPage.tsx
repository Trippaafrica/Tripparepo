import React, { useState, useEffect } from 'react';
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
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Progress,
  useSteps,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  FaBox,
  FaCheck,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaTruck,
  FaShuttleVan,
  FaUser,
  FaPhoneAlt,
} from 'react-icons/fa';

interface DeliveryRequest {
  id: string;
  status: string;
  delivery_status: string;
  order_status: string;
  payment_status: string;
  delivery_type: string;
  pickup_address: string;
  dropoff_address: string;
  item_description: string;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  dropoff_contact_name: string;
  dropoff_contact_phone: string;
}

const steps = [
  { title: 'Order Placed', description: 'Your delivery request has been submitted' },
  { title: 'Payment Completed', description: 'Your payment has been processed' },
  { title: 'Rider Assigned', description: 'A rider has been assigned to your delivery' },
  { title: 'Pickup', description: 'Item picked up from the origin' },
  { title: 'In Transit', description: 'Your delivery is on the way' },
  { title: 'Delivered', description: 'Your item has been delivered' },
];

const TrackingPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryRequest, setDeliveryRequest] = useState<DeliveryRequest | null>(null);
  const [riderInfo, setRiderInfo] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1); // Default to Order Placed step

  useEffect(() => {
    if (requestId) {
      fetchDeliveryDetails();
    }
  }, [requestId]);

  const fetchDeliveryDetails = async () => {
    try {
      setIsLoading(true);

      // Fetch delivery request details
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (deliveryError) {
        throw new Error('Failed to fetch delivery details');
      }

      setDeliveryRequest(deliveryData);

      // Determine current step based on statuses
      determineCurrentStep(deliveryData);

    } catch (error: any) {
      console.error('Error fetching tracking details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tracking details',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const determineCurrentStep = (deliveryData: DeliveryRequest) => {
    // This will determine the current tracking step based on various statuses
    if (deliveryData.status === 'completed') {
      setActiveStep(6); // Delivered
    } else if (deliveryData.delivery_status === 'in_transit') {
      setActiveStep(5); // In Transit
    } else if (deliveryData.delivery_status === 'pickup_complete') {
      setActiveStep(4); // Pickup
    } else if (deliveryData.delivery_status === 'rider_assigned') {
      setActiveStep(3); // Rider Assigned
    } else if (deliveryData.payment_status === 'paid') {
      setActiveStep(2); // Payment Completed
    } else {
      setActiveStep(1); // Order Placed
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.secondary" />
          <Text>Loading tracking information...</Text>
        </VStack>
      </Container>
    );
  }

  if (!deliveryRequest) {
    return (
      <Container maxW="container.md" py={8}>
        <Card bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
          <CardBody>
            <VStack spacing={4}>
              <Heading size="md" color="red.400">Tracking Information Not Found</Heading>
              <Text color="white">The delivery tracking details could not be found.</Text>
              <Button colorScheme="brand" onClick={() => navigate('/orders')}>
                View All Orders
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  // For demo purposes, calculate a progress percentage 
  const progressPercent = (activeStep / steps.length) * 100;

  return (
    <Container maxW="container.md" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={6}>
          <Card width="100%" bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="center">
                  <Icon as={FaMotorcycle} w={8} h={8} color="brand.secondary" />
                  <Heading size="lg" color="brand.secondary">
                    Tracking Your Delivery
                  </Heading>
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <Text color="gray.300">Order ID:</Text>
                  <Text color="white" fontWeight="medium">{deliveryRequest.id.slice(0, 8)}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="gray.300">Status:</Text>
                  <Badge colorScheme={
                    activeStep === 6 ? "green" :
                    activeStep > 2 ? "yellow" : "purple"
                  } fontSize="md" px={2} py={1}>
                    {steps[activeStep - 1].title}
                  </Badge>
                </HStack>

                <Box my={6}>
                  <Progress value={progressPercent} colorScheme="brand" size="sm" borderRadius="full" />
                  
                  <Stepper index={activeStep - 1} orientation="vertical" height="400px" gap="0" colorScheme="brand" mt={6}>
                    {steps.map((step, index) => (
                      <Step key={index}>
                        <StepIndicator>
                          <StepStatus 
                            complete={<StepIcon />} 
                            incomplete={<StepNumber />} 
                            active={<StepNumber />}
                          />
                        </StepIndicator>
                        
                        <Box flexShrink="0">
                          <StepTitle color={index < activeStep ? "brand.secondary" : "gray.400"}>
                            {step.title}
                          </StepTitle>
                          <StepDescription color={index < activeStep ? "white" : "gray.500"}>
                            {step.description}
                          </StepDescription>
                        </Box>
                        
                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Divider />

                <Heading size="sm" color="brand.secondary">Delivery Details</Heading>

                <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
                  <Box flex={1}>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="green.400" />
                      <Text color="gray.200" fontWeight="bold">Pickup:</Text>
                    </HStack>
                    <Text color="white" ml={6}>{deliveryRequest.pickup_address}</Text>
                    <Text color="gray.300" ml={6} fontSize="sm">
                      Contact: {deliveryRequest.pickup_contact_name}, {deliveryRequest.pickup_contact_phone}
                    </Text>
                  </Box>
                  <Box flex={1}>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="red.400" />
                      <Text color="gray.200" fontWeight="bold">Dropoff:</Text>
                    </HStack>
                    <Text color="white" ml={6}>{deliveryRequest.dropoff_address}</Text>
                    <Text color="gray.300" ml={6} fontSize="sm">
                      Contact: {deliveryRequest.dropoff_contact_name}, {deliveryRequest.dropoff_contact_phone}
                    </Text>
                  </Box>
                </Stack>

                <Divider />

                {activeStep >= 3 && riderInfo && (
                  <>
                    <Heading size="sm" color="brand.secondary">Rider Information</Heading>
                    <HStack spacing={4}>
                      <Icon as={FaUser} w={6} h={6} color="brand.secondary" />
                      <Box>
                        <Text color="white" fontWeight="bold">{riderInfo.name || "Rider Name"}</Text>
                        <Text color="gray.300" fontSize="sm">{riderInfo.phone || "Phone Number"}</Text>
                      </Box>
                      <Button
                        size="sm"
                        leftIcon={<FaPhoneAlt />}
                        colorScheme="green"
                        variant="solid"
                        ml="auto"
                      >
                        Call Rider
                      </Button>
                    </HStack>
                    <Divider />
                  </>
                )}

                <Button
                  onClick={() => navigate('/orders')}
                  colorScheme="brand"
                  variant="outline"
                  size="md"
                  mt={4}
                >
                  View All Orders
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </ScaleFade>
    </Container>
  );
};

export default TrackingPage; 