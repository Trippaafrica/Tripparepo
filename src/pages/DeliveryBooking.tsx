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
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { DeliveryType } from '../types';

const DeliveryBooking = () => {
  const { type } = useParams<{ type: DeliveryType }>();
  const navigate = useNavigate();
  const toast = useToast();
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
      const { data: { user } } = await supabase.auth.getUser();
      
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
            delivery_type: type,
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
    <Box p={8} maxW="600px" mx="auto">
      <VStack spacing={8}>
        <Heading>Book {type?.charAt(0).toUpperCase() + type?.slice(1)} Delivery</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Pickup Location</FormLabel>
              <Input
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                placeholder="Enter pickup address"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Dropoff Location</FormLabel>
              <Input
                name="dropoff_location"
                value={formData.dropoff_location}
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
                placeholder="Describe your items"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Weight (kg)</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter weight"
                />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Dimensions</FormLabel>
              <Input
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="e.g., 30x20x15 cm"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading}
            >
              Submit Request
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default DeliveryBooking; 