import { useEffect, useRef } from 'react';
import { Input, FormControl, FormLabel, FormErrorMessage, Icon } from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  error?: string;
  label: string;
  placeholder: string;
  isRequired?: boolean;
}

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces: () => void;
  }
}

const LocationPicker = ({
  value,
  onChange,
  onPlaceSelect,
  error,
  label,
  placeholder,
  isRequired = false,
}: LocationPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Load Google Places API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDs4RceLiF6fMtfK9d-fGlA6HyfxlAOzVE&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (inputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'ng' }, // Restrict to Nigeria
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place) {
            onPlaceSelect(place);
            onChange(place.formatted_address || '');
          }
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onChange, onPlaceSelect]);

  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel display="flex" alignItems="center" gap={2}>
        <Icon as={FaMapMarkerAlt} color="brand.secondary" />
        {label}
      </FormLabel>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        _placeholder={{ color: 'gray.400' }}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default LocationPicker; 