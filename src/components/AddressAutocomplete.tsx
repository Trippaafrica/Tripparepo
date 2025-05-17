import React, { useEffect, useRef, useState } from 'react';
import {
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Box,
  Spinner,
  Text,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Declare global window with google property for TypeScript
declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces: () => void;
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  label?: string;
  name: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Enter address',
  label,
  name,
  isRequired = false,
  isInvalid = false,
  errorMessage,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    // Only load the script if Google Maps isn't already loaded
    if (!(window as any).google?.maps?.places) {
      setIsLoading(true);
      
      // Create the script element
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDAPCO0RO432dTqJm0tH94o3g5s-kliK9o&libraries=places';
      script.async = true;
      script.defer = true;
      
      // Set up load and error handlers
      script.onload = () => {
        setIsLoading(false);
        initializeAutocomplete();
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsLoading(false);
        setScriptError(true);
      };
      
      // Add the script to the page
      document.head.appendChild(script);
      
      // Clean up function for when component unmounts
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } else {
      // Google Maps already loaded, initialize autocomplete
      initializeAutocomplete();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !(window as any).google?.maps?.places) return;
    
    try {
      // Initialize the autocomplete using the same approach as LocationPicker
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
      });
      
      // Add place_changed event listener
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place) {
          onChange(place.formatted_address || '');
          if (onPlaceSelect) {
            onPlaceSelect(place);
          }
        }
      });
      
      setScriptError(false);
    } catch (error) {
      console.error('Error initializing Google Maps Places:', error);
      setScriptError(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormControl isRequired={isRequired} isInvalid={isInvalid}>
      {label && <FormLabel>{label}</FormLabel>}
      <Stack spacing={0}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaMapMarkerAlt} color="gray.500" />
          </InputLeftElement>
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            pr={isLoading ? '40px' : undefined}
            name={name}
          />
          {isLoading && (
            <Box position="absolute" right="8px" top="50%" transform="translateY(-50%)">
              <Spinner size="sm" color="gray.400" />
            </Box>
          )}
        </InputGroup>
        
        {scriptError && (
          <Text color="yellow.500" fontSize="xs" mt={1}>
            Address suggestions unavailable. You can still enter the address manually.
          </Text>
        )}
        
        {isInvalid && errorMessage && (
          <FormErrorMessage>{errorMessage}</FormErrorMessage>
        )}
      </Stack>
    </FormControl>
  );
};

export default AddressAutocomplete; 