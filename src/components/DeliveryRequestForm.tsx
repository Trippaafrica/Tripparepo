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
  weight?: number;
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
  pickupAddress?: string;
  dropoffAddress?: string;
  item_description?: string;
  senderPhone?: string;
  recipientPhone?: string;
  weight?: string;
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
    weight: undefined,
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
    
    // Nigerian phone number validation: Should start with +234 followed by 9-10 digits
    const nigerianPhoneRegex = /^\+234[0-9]{9,10}$/;
    
    if (!nigerianPhoneRegex.test(formData.senderPhone.trim())) {
      newErrors.senderPhone = 'Please enter a valid Nigerian phone number in +234 format';
    }
    
    if (!nigerianPhoneRegex.test(formData.recipientPhone.trim())) {
      newErrors.recipientPhone = 'Please enter a valid Nigerian phone number in +234 format';
    }

    if (formData.weight !== undefined) {
      if (formData.weight <= 0) {
        newErrors.weight = 'Weight must be greater than 0';
      } else if (formData.delivery_type === 'bike' && formData.weight > 20) {
        newErrors.weight = 'Bike delivery is limited to items under 20kg';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceSelect = (type: 'pickup' | 'dropoff') => (place: google.maps.places.PlaceResult) => {
    const location = place.geometry?.location;
    if (location && place.formatted_address) {
      if (type === 'pickup') {
        setFormData(prev => ({
          ...prev,
          pickupAddress: place.formatted_address || '',
          pickup_coordinates: {
            lat: location.lat(),
            lng: location.lng()
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          dropoffAddress: place.formatted_address || '',
          dropoff_coordinates: {
            lat: location.lat(),
            lng: location.lng()
          }
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      console.log('Creating delivery request with data:', formData);
      
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
        package_weight: formData.weight || null,
        pickup_coordinates: formData.pickup_coordinates,
        dropoff_coordinates: formData.dropoff_coordinates,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('delivery_requests')
        .insert([requestData])
        .select();

      if (error) {
        console.error('Error creating delivery request:', error);
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const newRequestId = data?.[0]?.id;
      
      if (newRequestId) {
        console.log('Delivery request created successfully with ID:', newRequestId);
        toast({
          title: 'Success',
          description: 'Your delivery request has been created',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Use setTimeout to ensure the toast appears before navigation
        setTimeout(() => {
          navigate(`/bidding/${newRequestId}`);
        }, 500);
      } else {
        throw new Error('Failed to get ID of new delivery request');
      }
    } catch (err: any) {
      console.error('Error in form submission:', err);
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred',
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

  const handleWeightChange = (value: string) => {
    setFormData((prev) => ({ ...prev, weight: value ? parseFloat(value) : undefined }));
    if (errors.weight) {
      setErrors((prev) => ({ ...prev, weight: undefined }));
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

          <FormControl isInvalid={!!errors.weight}>
            <FormLabel>
              <Icon as={FaWeight} mr={2} />
              Package Weight (kg)
            </FormLabel>
            <NumberInput 
              min={0} 
              value={formData.weight || ''} 
              onChange={handleWeightChange}
            >
              <NumberInputField placeholder="Enter weight in kg" />
            </NumberInput>
            {formData.delivery_type === 'bike' && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Note: Bike delivery is limited to packages under 20kg
              </Text>
            )}
            {errors.weight && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.weight}
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
                placeholder="+234 (Nigerian format, no leading zero)"
                inputMode="tel"
              />
              {errors.senderPhone && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.senderPhone}
                </Text>
              )}
            </FormControl>
          </SimpleGrid>

          <AddressAutocomplete
            label="Pickup Address"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={(value) => setFormData((prev) => ({ ...prev, pickupAddress: value }))}
            onPlaceSelect={handlePlaceSelect('pickup')}
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
                placeholder="+234 (Nigerian format, no leading zero)"
                inputMode="tel"
              />
              {errors.recipientPhone && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.recipientPhone}
                </Text>
              )}
            </FormControl>
          </SimpleGrid>

          <AddressAutocomplete
            label="Dropoff Address"
            name="dropoffAddress"
            value={formData.dropoffAddress}
            onChange={(value) => setFormData((prev) => ({ ...prev, dropoffAddress: value }))}
            onPlaceSelect={handlePlaceSelect('dropoff')}
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