/// <reference types="@types/google.maps" />
import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Textarea,
  NumberInput,
  NumberInputField,
  Container,
  Card,
  CardBody,
  ScaleFade,
  Icon,
  FormErrorMessage,
  Image,
  SimpleGrid,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { DeliveryType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FaTruck, FaMapMarkerAlt, FaBox, FaWeightHanging, FaRuler, FaStar, FaClock, FaShieldAlt, FaBicycle } from 'react-icons/fa';
import LocationPicker from './LocationPicker';

interface DeliveryFormProps {
  deliveryType: DeliveryType;
}

interface FormData {
  pickup_location: string;
  dropoff_location: string;
  item_description: string;
  weight?: number;
  dimensions?: string;
  pickup_coordinates?: {
    lat: number;
    lng: number;
  };
  dropoff_coordinates?: {
    lat: number;
    lng: number;
  };
}

interface FormErrors {
  pickup_location?: string;
  dropoff_location?: string;
  item_description?: string;
  weight?: string;
  dimensions?: string;
}

const DeliveryForm = ({ deliveryType }: DeliveryFormProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    pickup_location: '',
    dropoff_location: '',
    item_description: '',
    weight: undefined,
    dimensions: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = 'Pickup location is required';
    }

    if (!formData.dropoff_location.trim()) {
      newErrors.dropoff_location = 'Dropoff location is required';
    }

    if (!formData.item_description.trim()) {
      newErrors.item_description = 'Item description is required';
    }

    if (formData.weight !== undefined) {
      if (formData.weight <= 0) {
        newErrors.weight = 'Weight must be greater than 0';
      } else if (deliveryType === 'bike' && formData.weight > 20) {
        newErrors.weight = 'Bike delivery is limited to items under 20kg';
      }
    }

    if (formData.dimensions && !/^\d+x\d+x\d+\s*(cm|m|in|ft)$/i.test(formData.dimensions)) {
      newErrors.dimensions = 'Please use format: length x width x height (e.g., 30x20x15 cm)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to create a delivery request',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      const requestData = {
        user_id: user.id,
        delivery_type: deliveryType,
        pickup_location: formData.pickup_location.trim(),
        dropoff_location: formData.dropoff_location.trim(),
        item_description: formData.item_description.trim(),
        weight: formData.weight || null,
        dimensions: formData.dimensions?.trim() || null,
        pickup_coordinates: formData.pickup_coordinates || null,
        dropoff_coordinates: formData.dropoff_coordinates || null,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('delivery_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        let errorMessage = 'Failed to create delivery request';
        
        if (error.code === '23503') {
          errorMessage = 'User authentication error. Please try logging in again.';
        } else if (error.code === '23514') {
          errorMessage = 'Invalid delivery type or status.';
        } else if (error.code === '23502') {
          errorMessage = 'Please fill in all required fields.';
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
        });
        return;
      }

      toast({
        title: 'Delivery request created',
        description: 'Redirecting to bidding page...',
        status: 'success',
        duration: 3000,
      });

      navigate(`/bidding/${data.id}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create delivery request. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (type: 'pickup' | 'dropoff') => (place: google.maps.places.PlaceResult) => {
    const location = place.geometry?.location;
    if (location) {
      setFormData(prev => ({
        ...prev,
        [`${type}_coordinates`]: {
          lat: location.lat(),
          lng: location.lng(),
        },
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleWeightChange = (value: string) => {
    setFormData((prev) => ({ ...prev, weight: value ? parseFloat(value) : undefined }));
    if (errors.weight) {
      setErrors((prev) => ({ ...prev, weight: undefined }));
    }
  };

  const deliveryStories = [
    {
      title: "Quick & Reliable",
      description: "Our delivery service ensures your packages reach their destination safely and on time.",
      icon: FaClock,
      color: "green",
    },
    {
      title: "Trusted by Thousands",
      description: "Join our community of satisfied customers who rely on our delivery services daily.",
      icon: FaStar,
      color: "yellow",
    },
    {
      title: "Secure Delivery",
      description: "Your items are protected with our comprehensive insurance and tracking system.",
      icon: FaShieldAlt,
      color: "blue",
    },
  ];

  return (
    <Container maxW="container.lg" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <Card bg="rgba(26, 26, 46, 0.8)" backdropFilter="blur(10px)" border="1px solid rgba(157, 78, 221, 0.2)">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <VStack spacing={2} align="center">
                <Icon 
                  as={deliveryType === 'bike' ? FaBicycle : FaTruck} 
                  w={10} 
                  h={10} 
                  color="brand.secondary" 
                />
                <Heading
                  size="lg"
                  color="brand.secondary"
                  textAlign="center"
                >
                  {deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)} Delivery Request
                </Heading>
                {deliveryType === 'bike' && (
                  <Text color="gray.300" fontSize="sm" textAlign="center">
                    Perfect for small packages under 20kg
                  </Text>
                )}
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired isInvalid={!!errors.pickup_location}>
                    <FormLabel color="gray.200">
                      <Icon as={FaMapMarkerAlt} mr={2} />
                      Pickup Location
                    </FormLabel>
                    <Input
                      name="pickup_location"
                      value={formData.pickup_location}
                      onChange={handleChange}
                      placeholder="Enter pickup address"
                      color="white"
                      _placeholder={{ color: 'gray.400' }}
                      bg="rgba(26, 26, 46, 0.6)"
                      borderColor="rgba(157, 78, 221, 0.2)"
                      _hover={{
                        borderColor: 'brand.primary',
                      }}
                      _focus={{
                        borderColor: 'brand.secondary',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
                      }}
                    />
                    <FormErrorMessage>{errors.pickup_location}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.dropoff_location}>
                    <FormLabel color="gray.200">
                      <Icon as={FaMapMarkerAlt} mr={2} />
                      Dropoff Location
                    </FormLabel>
                    <Input
                      name="dropoff_location"
                      value={formData.dropoff_location}
                      onChange={handleChange}
                      placeholder="Enter delivery address"
                      color="white"
                      _placeholder={{ color: 'gray.400' }}
                      bg="rgba(26, 26, 46, 0.6)"
                      borderColor="rgba(157, 78, 221, 0.2)"
                      _hover={{
                        borderColor: 'brand.primary',
                      }}
                      _focus={{
                        borderColor: 'brand.secondary',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
                      }}
                    />
                    <FormErrorMessage>{errors.dropoff_location}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.item_description}>
                    <FormLabel color="gray.200">
                      <Icon as={FaBox} mr={2} />
                      Item Description
                    </FormLabel>
                    <Textarea
                      name="item_description"
                      value={formData.item_description}
                      onChange={handleChange}
                      placeholder="Describe the item(s) to be delivered"
                      color="white"
                      _placeholder={{ color: 'gray.400' }}
                      bg="rgba(26, 26, 46, 0.6)"
                      borderColor="rgba(157, 78, 221, 0.2)"
                      _hover={{
                        borderColor: 'brand.primary',
                      }}
                      _focus={{
                        borderColor: 'brand.secondary',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
                      }}
                    />
                    <FormErrorMessage>{errors.item_description}</FormErrorMessage>
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
                    <FormControl isInvalid={!!errors.weight}>
                      <FormLabel color="gray.200">
                        <Icon as={FaWeightHanging} mr={2} />
                        Weight (kg)
                      </FormLabel>
                      <NumberInput
                        value={formData.weight || ''}
                        onChange={handleWeightChange}
                        min={0}
                      >
                        <NumberInputField
                          placeholder="Enter weight"
                          color="white"
                          _placeholder={{ color: 'gray.400' }}
                          bg="rgba(26, 26, 46, 0.6)"
                          borderColor="rgba(157, 78, 221, 0.2)"
                          _hover={{
                            borderColor: 'brand.primary',
                          }}
                          _focus={{
                            borderColor: 'brand.secondary',
                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
                          }}
                        />
                      </NumberInput>
                      <FormErrorMessage>{errors.weight}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.dimensions}>
                      <FormLabel color="gray.200">
                        <Icon as={FaRuler} mr={2} />
                        Dimensions
                      </FormLabel>
                      <Input
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        placeholder="e.g., 30x20x15 cm"
                        color="white"
                        _placeholder={{ color: 'gray.400' }}
                        bg="rgba(26, 26, 46, 0.6)"
                        borderColor="rgba(157, 78, 221, 0.2)"
                        _hover={{
                          borderColor: 'brand.primary',
                        }}
                        _focus={{
                          borderColor: 'brand.secondary',
                          boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
                        }}
                      />
                      <FormErrorMessage>{errors.dimensions}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                    loadingText="Creating request..."
                  >
                    Create Delivery Request
                  </Button>
                </VStack>
              </form>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={8}>
                {deliveryStories.map((story, index) => (
                  <Card
                    key={index}
                    bg="rgba(26, 26, 46, 0.6)"
                    border="1px solid rgba(157, 78, 221, 0.2)"
                  >
                    <CardBody>
                      <VStack spacing={3}>
                        <Icon as={story.icon} w={6} h={6} color={`${story.color}.400`} />
                        <Text color="white" fontWeight="bold">
                          {story.title}
                        </Text>
                        <Text color="gray.300" fontSize="sm" textAlign="center">
                          {story.description}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </ScaleFade>
    </Container>
  );
};

export default DeliveryForm; 