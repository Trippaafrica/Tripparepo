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

// Load the Google Maps script
const loadGoogleMapsScript = (callback: () => void) => {
  const existingScript = document.getElementById('google-maps-script');
  
  // If script already exists, just use it
  if (existingScript) {
    if ((window as any).google?.maps?.places) {
      callback();
    } else {
      existingScript.addEventListener('load', callback);
    }
    return;
  }
  
  // Create script element
  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDAPCO0RO432dTqJm0tH94o3g5s-kliK9o&libraries=places';
  script.async = true;
  script.defer = true;
  
  // Add load handler
  script.addEventListener('load', callback);
  script.addEventListener('error', (e) => {
    console.error('Failed to load Google Maps API:', e);
  });
  
  // Add the script to the page
  document.head.appendChild(script);
};

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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Initialize Google Maps places autocomplete
  const initAutocomplete = () => {
    if (!inputRef.current || !(window as any).google) return;
    
    try {
      // Create autocomplete instance with type casting to avoid TypeScript errors
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current, 
        {
          fields: ['formatted_address', 'geometry'],
          types: ['geocode']
        } as any
      );

      // Add place_changed event listener
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place) {
          if (place.formatted_address) {
            onChange(place.formatted_address);
          }
          if (onPlaceSelect) {
            onPlaceSelect(place);
          }
        }
      });
      
      setIsScriptLoaded(true);
      setScriptError(false);
    } catch (error) {
      console.error('Error initializing Google Maps Places:', error);
      setScriptError(true);
    }
  };

  // Load script when component mounts
  useEffect(() => {
    if (!(window as any).google?.maps?.places && !isScriptLoading) {
      setIsScriptLoading(true);
      loadGoogleMapsScript(() => {
        setIsScriptLoaded(true);
        setIsScriptLoading(false);
        initAutocomplete();
      });
    } else if ((window as any).google?.maps?.places) {
      setIsScriptLoaded(true);
      initAutocomplete();
    }
    
    return () => {
      // Clean up listener when component unmounts
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

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
            pr={isScriptLoading ? '40px' : undefined}
            name={name}
          />
          {isScriptLoading && (
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