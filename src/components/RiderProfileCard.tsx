import { 
  Box, 
  HStack, 
  VStack, 
  Text, 
  Image, 
  Icon, 
  Avatar,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { FaStar, FaClock, FaMotorcycle, FaTruck, FaShuttleVan, FaGasPump, FaInfoCircle } from 'react-icons/fa';

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
  
  // Calculate total amount (rider bid + service fee)
  const serviceFee = 1200;
  const totalAmount = amount + serviceFee;
  
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

  // Generate avatar color based on rider name for consistent coloring
  const generateAvatarColor = () => {
    // Simple hash function for the name to generate a consistent color
    const nameHash = riderName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorOptions = ['purple', 'blue', 'teal', 'green', 'cyan', 'orange', 'pink'];
    const colorIndex = nameHash % colorOptions.length;
    return colorOptions[colorIndex] + '.400';
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
        {/* Rider Avatar - Use name-based avatar since images may not exist */}
        <Avatar 
          size="lg" 
          name={riderName} 
          bg={generateAvatarColor()}
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
          {/* Total Amount (Bid + Service Fee) */}
          <Text fontWeight="bold" fontSize="lg" color="brand.secondary">
            ₦{totalAmount.toLocaleString()}
          </Text>
          
          {/* Bid Amount */}
          <HStack>
            <Text fontSize="sm" color="gray.300">
              Rider bid: ₦{amount.toLocaleString()}
            </Text>
            <Tooltip label="Service fee: ₦1,200" placement="top">
              <span><Icon as={FaInfoCircle} color="gray.400" fontSize="xs" /></span>
            </Tooltip>
          </HStack>
          
          {/* Estimated Time */}
          <HStack>
            <Icon as={FaClock} color="blue.400" size="sm" />
            <Text fontSize="sm" color="gray.300">
              {estimatedTime}
            </Text>
          </HStack>
          
          {/* Bid Time */}
          <Text fontSize="xs" color="gray.400">
            Bid placed {bidTime}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default RiderProfileCard; 