import { 
  Box, 
  HStack, 
  VStack, 
  Text, 
  Image, 
  Icon, 
  Avatar,
  Badge
} from '@chakra-ui/react';
import { FaStar, FaClock, FaMotorcycle, FaTruck, FaShuttleVan, FaGasPump } from 'react-icons/fa';

interface RiderProfileCardProps {
  riderName: string;
  riderImage?: string;
  rating: number;
  vehicleType: 'bike' | 'truck' | 'van' | 'fuel';
  estimatedTime: string;
  amount: number;
  bidTime: string;
}

const RiderProfileCard = ({
  riderName,
  riderImage,
  rating,
  vehicleType,
  estimatedTime,
  amount,
  bidTime
}: RiderProfileCardProps) => {
  
  // Get the appropriate vehicle icon based on vehicle type
  const getVehicleIcon = () => {
    switch (vehicleType) {
      case 'bike': return FaMotorcycle;
      case 'truck': return FaTruck;
      case 'van': return FaShuttleVan;
      case 'fuel': return FaGasPump;
      default: return FaMotorcycle;
    }
  };

  // Get vehicle name for display
  const getVehicleName = () => {
    switch (vehicleType) {
      case 'bike': return 'Motorcycle';
      case 'truck': return 'Truck';
      case 'van': return 'Van';
      case 'fuel': return 'Fuel Delivery';
      default: return 'Vehicle';
    }
  };

  // Get color for the vehicle badge
  const getVehicleColor = () => {
    switch (vehicleType) {
      case 'bike': return 'purple';
      case 'truck': return 'blue';
      case 'van': return 'teal';
      case 'fuel': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box 
      p={4} 
      borderRadius="lg" 
      bg="rgba(26, 26, 46, 0.6)"
      border="1px solid rgba(157, 78, 221, 0.2)"
      backdropFilter="blur(10px)"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      width="100%"
    >
      <HStack spacing={4} align="start">
        {/* Rider Avatar and Info */}
        <Avatar 
          size="lg" 
          name={riderName} 
          src={riderImage}
          bg="brand.secondary"
        />
        
        <VStack align="start" flex={1} spacing={1}>
          {/* Rider Name and Rating */}
          <Text fontWeight="bold" color="white">{riderName}</Text>
          <HStack>
            <Icon as={FaStar} color="yellow.400" />
            <Text color="gray.300" fontSize="sm">
              {rating.toFixed(1)}
            </Text>
          </HStack>
          
          {/* Vehicle Type */}
          <Badge colorScheme={getVehicleColor()} display="flex" alignItems="center">
            <Icon as={getVehicleIcon()} mr={1} /> 
            {getVehicleName()}
          </Badge>
        </VStack>

        {/* Bid Details */}
        <VStack align="end" spacing={1}>
          <Text fontWeight="bold" fontSize="lg" color="brand.secondary">
            ₦{amount.toLocaleString()}
          </Text>
          <HStack>
            <Icon as={FaClock} color="blue.400" size="sm" />
            <Text fontSize="sm" color="gray.300">
              {estimatedTime}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            Bid placed {bidTime}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default RiderProfileCard; 