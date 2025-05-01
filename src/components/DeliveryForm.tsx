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
import { FaTruck, FaMapMarkerAlt, FaBox, FaWeightHanging, FaRuler, FaStar, FaClock, FaShieldAlt } from 'react-icons/fa';

interface DeliveryFormProps {
  deliveryType: DeliveryType;
}

interface FormData {
  pickup_location: string;
  dropoff_location: string;
  item_description: string;
  weight?: number;
  dimensions?: string;
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

    if (formData.weight !== undefined && formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
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

      const { data, error } = await supabase
        .from('delivery_requests')
        .insert([
          {
            user_id: user.id,
            delivery_type: deliveryType,
            pickup_location: formData.pickup_location.trim(),
            dropoff_location: formData.dropoff_location.trim(),
            item_description: formData.item_description.trim(),
            weight: formData.weight || null,
            dimensions: formData.dimensions?.trim() || null,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Delivery request created',
        description: 'Redirecting to bidding page...',
        status: 'success',
        duration: 3000,
      });

      navigate(`/bidding/${data.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create delivery request',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
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
    <Container maxW="container.md" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack spacing={8}>
          <Card width="100%">
            <CardBody>
              <VStack spacing={8}>
                <VStack spacing={2}>
                  <Icon as={FaTruck} w={10} h={10} color="brand.secondary" />
                  <Heading size="lg" textAlign="center" bgGradient="linear(to-r, brand.secondary, brand.primary)" bgClip="text">
                    Book {deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)} Delivery
                  </Heading>
                </VStack>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={6}>
                    <FormControl isRequired isInvalid={!!errors.pickup_location}>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        <Icon as={FaMapMarkerAlt} color="brand.secondary" />
                        Pickup Location
                      </FormLabel>
                      <Input
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleChange}
                        placeholder="Enter pickup address"
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage>{errors.pickup_location}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.dropoff_location}>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        <Icon as={FaMapMarkerAlt} color="brand.secondary" />
                        Dropoff Location
                      </FormLabel>
                      <Input
                        name="dropoff_location"
                        value={formData.dropoff_location}
                        onChange={handleChange}
                        placeholder="Enter dropoff address"
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage>{errors.dropoff_location}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.item_description}>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        <Icon as={FaBox} color="brand.secondary" />
                        Item Description
                      </FormLabel>
                      <Textarea
                        name="item_description"
                        value={formData.item_description}
                        onChange={handleChange}
                        placeholder="Describe your items"
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage>{errors.item_description}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.weight}>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        <Icon as={FaWeightHanging} color="brand.secondary" />
                        Weight (kg)
                      </FormLabel>
                      <NumberInput min={0} value={formData.weight || ''} onChange={handleWeightChange}>
                        <NumberInputField
                          placeholder="Enter weight"
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </NumberInput>
                      <FormErrorMessage>{errors.weight}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.dimensions}>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        <Icon as={FaRuler} color="brand.secondary" />
                        Dimensions
                      </FormLabel>
                      <Input
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        placeholder="e.g., 30x20x15 cm"
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <FormErrorMessage>{errors.dimensions}</FormErrorMessage>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      width="full"
                      isLoading={isLoading}
                      mt={4}
                      leftIcon={<Icon as={FaTruck} />}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(57, 255, 20, 0.3)',
                      }}
                    >
                      Submit Request
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>

          {/* Delivery Image Section */}
          <Card width="100%">
            <CardBody>
              <VStack spacing={6}>
                <Heading size="md" textAlign="center" color="brand.secondary">
                  Why Choose Trippa?
                </Heading>
                <Image
                  src={`/images/${deliveryType}-delivery.jpg`}
                  alt={`${deliveryType} delivery service`}
                  borderRadius="lg"
                  fallbackSrc="https://via.placeholder.com/800x400?text=Delivery+Service"
                  objectFit="cover"
                  width="100%"
                  height="300px"
                />
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} width="100%">
                  {deliveryStories.map((story, index) => (
                    <Card key={index} bg="rgba(26, 26, 46, 0.8)" border="1px solid" borderColor="rgba(157, 78, 221, 0.2)">
                      <CardBody>
                        <VStack spacing={3} align="start">
                          <Icon as={story.icon} w={6} h={6} color={`${story.color}.400`} />
                          <Heading size="sm" color="brand.secondary">
                            {story.title}
                          </Heading>
                          <Text fontSize="sm" color="gray.400">
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

          {/* Trust Badges */}
          <Flex wrap="wrap" gap={4} justify="center" width="100%">
            <Badge colorScheme="green" px={3} py={1} borderRadius="full">
              <Flex align="center" gap={2}>
                <Icon as={FaShieldAlt} />
                <Text>Secure Delivery</Text>
              </Flex>
            </Badge>
            <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
              <Flex align="center" gap={2}>
                <Icon as={FaClock} />
                <Text>24/7 Support</Text>
              </Flex>
            </Badge>
            <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
              <Flex align="center" gap={2}>
                <Icon as={FaStar} />
                <Text>Rated 4.8/5</Text>
              </Flex>
            </Badge>
          </Flex>
        </VStack>
      </ScaleFade>
    </Container>
  );
};

export default DeliveryForm; 