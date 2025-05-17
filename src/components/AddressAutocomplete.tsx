import { useEffect, useRef, useState } from 'react';
import {
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Box,
  List,
  ListItem,
  Text,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Google Maps API key
const GOOGLE_API_KEY = 'AIzaSyDAPCO0RO432dTqJm0tH94o3g5s-kliK9o';

interface Place {
  description: string;
  place_id: string;
}

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, coordinates: { lat: number; lng: number } | null) => void;
  error?: string;
  isRequired?: boolean;
}

const AddressAutocomplete = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  isRequired = false,
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  // Load Google Maps API script
  useEffect(() => {
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    googleMapScript.onload = initGoogleServices;
    
    // Check if script is already loaded
    if (!document.querySelector(`script[src*="maps.googleapis.com/maps/api"]`)) {
      document.head.appendChild(googleMapScript);
    } else {
      initGoogleServices();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize Google services
  const initGoogleServices = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService (required by the API)
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      
      placesService.current = new window.google.maps.places.PlacesService(mapDiv);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length > 2 && autocompleteService.current) {
      setIsLoading(true);
      setShowSuggestions(true);
      
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
          types: ['address', 'establishment', 'geocode'],
        },
        (predictions, status) => {
          setIsLoading(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions);
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  };

  // Handle suggestion selection
  const handleSelectPlace = (place: Place) => {
    setInputValue(place.description);
    setPredictions([]);
    setShowSuggestions(false);
    
    // Get coordinates from place_id
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: place.place_id,
          fields: ['geometry']
        },
        (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result && result.geometry) {
            const lat = result.geometry.location?.lat();
            const lng = result.geometry.location?.lng();
            
            if (lat && lng) {
              onChange(place.description, { lat, lng });
            } else {
              onChange(place.description, null);
            }
          } else {
            onChange(place.description, null);
          }
        }
      );
    } else {
      onChange(place.description, null);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        event.target !== autocompleteInputRef.current
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel>
        <FaMapMarkerAlt style={{ display: 'inline', marginRight: '8px' }} />
        {label}
      </FormLabel>
      <Box position="relative">
        <InputGroup>
          <Input
            ref={autocompleteInputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
          />
          <InputRightElement>
            {isLoading && <Spinner size="sm" />}
          </InputRightElement>
        </InputGroup>

        {/* Suggestions dropdown */}
        {showSuggestions && predictions.length > 0 && (
          <Box
            ref={suggestionsRef}
            position="absolute"
            zIndex={10}
            width="100%"
            mt={1}
            bg={bgColor}
            boxShadow="md"
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            maxH="200px"
            overflowY="auto"
          >
            <List spacing={0}>
              {predictions.map((place) => (
                <ListItem
                  key={place.place_id}
                  px={4}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: hoverBgColor }}
                  onClick={() => handleSelectPlace(place)}
                >
                  <Text fontSize="sm">
                    <FaMapMarkerAlt style={{ display: 'inline', marginRight: '8px' }} />
                    {place.description}
                  </Text>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default AddressAutocomplete; 