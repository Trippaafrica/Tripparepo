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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { DeliveryType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FaTruck, FaMapMarkerAlt, FaBox, FaWeightHanging, FaRuler } from 'react-icons/fa';

interface DeliveryFormProps {
  deliveryType: DeliveryType;
}

const DeliveryForm = ({ deliveryType }: DeliveryFormProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    pickup_location: '',
    dropoff_location: '',
    item_description: '',
    weight: '',
    dimensions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            ...formData,
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
  };

  return (
    <Container maxW="container.md" py={8}>
      <ScaleFade initialScale={0.9} in={true}>
        <Card>
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
                  <FormControl isRequired>
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
                  </FormControl>

                  <FormControl isRequired>
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
                  </FormControl>

                  <FormControl isRequired>
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
                  </FormControl>

                  <FormControl>
                    <FormLabel display="flex" alignItems="center" gap={2}>
                      <Icon as={FaWeightHanging} color="brand.secondary" />
                      Weight (kg)
                    </FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Enter weight"
                        _placeholder={{ color: 'gray.400' }}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
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
      </ScaleFade>
    </Container>
  );
};

export default DeliveryForm; 