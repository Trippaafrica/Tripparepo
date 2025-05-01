import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Container,
  useToast,
  Textarea,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Icon,
  Text,
} from '@chakra-ui/react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone } from 'react-icons/fa';

interface FormData {
  delivery_type: 'bike' | 'truck' | 'van' | 'fuel';
  pickup_address: string;
  dropoff_address: string;
  item_description: string;
  weight: number | null;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  pickup_coordinates: { lat: number; lng: number } | null;
  dropoff_coordinates: { lat: number; lng: number } | null;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
}

interface FormErrors {
  sender_phone?: string;
  receiver_phone?: string;
}

const CreateDeliveryRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    delivery_type: 'bike',
    pickup_address: '',
    dropoff_address: '',
    item_description: '',
    weight: null,
    status: 'pending',
    pickup_coordinates: null,
    dropoff_coordinates: null,
    sender_name: '',
    sender_phone: '',
    receiver_name: '',
    receiver_phone: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate phone numbers
    if (!/^\+?[1-9]\d{9,14}$/.test(formData.sender_phone.trim())) {
      newErrors.sender_phone = 'Please enter a valid phone number';
    }
    
    if (!/^\+?[1-9]\d{9,14}$/.test(formData.receiver_phone.trim())) {
      newErrors.receiver_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors',
        status: 'error',
        duration: 5000,
      });
      return;
    }
    
    setIsLoading(true);

    try {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a delivery request',
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
            ...formData,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to create delivery request',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Delivery request created successfully',
        status: 'success',
        duration: 5000,
      });

      // Navigate to the bidding page for this request
      navigate(`/bidding/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleWeightChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      weight: value ? parseFloat(value) : null,
    }));
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <FormControl isRequired>
            <FormLabel>Delivery Type</FormLabel>
            <Select
              name="delivery_type"
              value={formData.delivery_type}
              onChange={handleChange}
            >
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="fuel">Fuel</option>
            </Select>
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
            <FormControl isRequired>
              <FormLabel>
                <Icon as={FaUser} mr={2} />
                Sender Name
              </FormLabel>
              <Input
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                placeholder="Enter sender name"
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.sender_phone}>
              <FormLabel>
                <Icon as={FaPhone} mr={2} />
                Sender Phone
              </FormLabel>
              <Input
                name="sender_phone"
                value={formData.sender_phone}
                onChange={handleChange}
                placeholder="Enter sender phone"
              />
              {errors.sender_phone && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.sender_phone}
                </Text>
              )}
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
            <FormControl isRequired>
              <FormLabel>
                <Icon as={FaUser} mr={2} />
                Receiver Name
              </FormLabel>
              <Input
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                placeholder="Enter receiver name"
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.receiver_phone}>
              <FormLabel>
                <Icon as={FaPhone} mr={2} />
                Receiver Phone
              </FormLabel>
              <Input
                name="receiver_phone"
                value={formData.receiver_phone}
                onChange={handleChange}
                placeholder="Enter receiver phone"
              />
              {errors.receiver_phone && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.receiver_phone}
                </Text>
              )}
            </FormControl>
          </SimpleGrid>

          <FormControl isRequired>
            <FormLabel>Pickup Address</FormLabel>
            <Input
              name="pickup_address"
              value={formData.pickup_address}
              onChange={handleChange}
              placeholder="Enter pickup address"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Dropoff Address</FormLabel>
            <Input
              name="dropoff_address"
              value={formData.dropoff_address}
              onChange={handleChange}
              placeholder="Enter dropoff address"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Item Description</FormLabel>
            <Textarea
              name="item_description"
              value={formData.item_description}
              onChange={handleChange}
              placeholder="Describe the item(s) to be delivered"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Weight (kg)</FormLabel>
            <NumberInput
              value={formData.weight || ''}
              onChange={handleWeightChange}
              min={0}
            >
              <NumberInputField placeholder="Enter weight in kg" />
            </NumberInput>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            width="full"
            size="lg"
          >
            Create Delivery Request
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default CreateDeliveryRequest; 