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
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Icon,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaBox, FaMapMarkerAlt, FaWeight, FaRuler, FaTruck, FaInfoCircle } from 'react-icons/fa';
import AddressAutocomplete from './AddressAutocomplete';

interface FormData {
  delivery_type: string;
  item_description: string;
  pickupAddress: string;
  dropoffAddress: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
}

interface FormErrors {
  pickupAddress?: string;
  dropoffAddress?: string;
  item_description?: string;
  senderPhone?: string;
  recipientPhone?: string;
}

const DeliveryRequestForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    delivery_type: 'bike',
    item_description: '',
    pickupAddress: '',
    dropoffAddress: '',
    senderName: '',
    senderPhone: '',
    recipientName: '',
    recipientPhone: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup address is required';
    }
    
    if (!formData.dropoffAddress.trim()) {
      newErrors.dropoffAddress = 'Dropoff address is required';
    }
    
    if (!formData.item_description.trim()) {
      newErrors.item_description = 'Item description is required';
    }
    
    if (!/^\+?[1-9]\d{9,14}$/.test(formData.senderPhone.trim())) {
      newErrors.senderPhone = 'Please enter a valid phone number';
    }
    
    if (!/^\+?[1-9]\d{9,14}$/.test(formData.recipientPhone.trim())) {
      newErrors.recipientPhone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const requestData = {
        user_id: user?.id,
        pickup_address: formData.pickupAddress,
        dropoff_address: formData.dropoffAddress,
        item_description: formData.item_description,
        delivery_type: formData.delivery_type,
        pickup_contact_name: formData.senderName,
        pickup_contact_phone: formData.senderPhone,
        dropoff_contact_name: formData.recipientName,
        dropoff_contact_phone: formData.recipientPhone,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('delivery_requests')
        .insert([requestData])
        .select();

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        console.error('Error creating delivery request:', error);
        return;
      }

      const newRequestId = data?.[0]?.id;
      
      if (newRequestId) {
        toast({
          title: 'Success',
          description: 'Your delivery request has been created',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate(`/request/${newRequestId}`);
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Container maxW="container.md" py={8} mb={20}>
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <FormControl isRequired>
            <FormLabel>Delivery Type</FormLabel>
            <Select
              name="delivery_type"
              value={formData.delivery_type}
              onChange={handleInputChange}
            >
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="fuel">Fuel</option>
            </Select>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.item_description}>
            <FormLabel>
              <Icon as={FaBox} mr={2} />
              Item Description
            </FormLabel>
            <Input
              name="item_description"
              value={formData.item_description}
              onChange={handleInputChange}
              placeholder="Describe the item/package"
            />
            {errors.item_description && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.item_description}
              </Text>
            )}
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
            <FormControl isRequired>
              <FormLabel>
                <Icon as={FaUser} mr={2} />
                Sender Name
              </FormLabel>
              <Input
                name="senderName"
                value={formData.senderName}
                onChange={handleInputChange}
                placeholder="Enter sender's name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>
                <Icon as={FaPhone} mr={2} />
                Sender Phone
              </FormLabel>
              <Input
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleInputChange}
                placeholder="Enter sender's phone number"
              />
            </FormControl>
          </SimpleGrid>

          <AddressAutocomplete
            label="Pickup Address"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={(value) => setFormData((prev) => ({ ...prev, pickupAddress: value }))}
            placeholder="Enter pickup address"
            isRequired
            isInvalid={!!errors.pickupAddress}
            errorMessage={errors.pickupAddress}
          />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
            <FormControl isRequired>
              <FormLabel>
                <Icon as={FaUser} mr={2} />
                Recipient Name
              </FormLabel>
              <Input
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="Enter recipient's name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>
                <Icon as={FaPhone} mr={2} />
                Recipient Phone
              </FormLabel>
              <Input
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={handleInputChange}
                placeholder="Enter recipient's phone number"
              />
            </FormControl>
          </SimpleGrid>

          <AddressAutocomplete
            label="Dropoff Address"
            name="dropoffAddress"
            value={formData.dropoffAddress}
            onChange={(value) => setFormData((prev) => ({ ...prev, dropoffAddress: value }))}
            placeholder="Enter dropoff address"
            isRequired
            isInvalid={!!errors.dropoffAddress}
            errorMessage={errors.dropoffAddress}
          />

          <Button
            type="submit"
            colorScheme="brand"
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

export default DeliveryRequestForm; 