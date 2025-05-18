import { 
  Box, 
  HStack, 
  VStack, 
  Text, 
  Icon, 
  Avatar,
  Badge,
  Tooltip,
  Flex,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { FaStar, FaClock, FaMotorcycle, FaTruck, FaShuttleVan, FaGasPump, FaInfoCircle } from 'react-icons/fa';

interface RiderProfileCardProps {
  riderName: string;
  riderImage?: string;
  rating: number;
  vehicleType: 'bike' | 'truck' | 'van' | 'fuel';
  estimatedTime?: string;
  amount: number;
  bidTime: string;
}

const RiderProfileCard = ({
  riderName,
  riderImage,
  rating,
  vehicleType,
  estimatedTime = '30-45 minutes',
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
      {/* Top section - Rider info and amount */}
      <Grid templateColumns="auto 1fr auto" gap={4}>
        {/* Rider Avatar */}
        <GridItem>
          <Avatar 
            size="lg" 
            name={riderName} 
            bg={generateAvatarColor()}
          />
        </GridItem>
        
        {/* Rider Name and Rating */}
        <GridItem>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" color="white" fontSize="lg">{riderName}</Text>
            <HStack>
              <Icon as={FaStar} color="yellow.400" />
              <Text color="gray.300" fontSize="sm">
                {rating.toFixed(1)} rating
              </Text>
              
              <Badge colorScheme={getVehicleColor()} ml={2} display="flex" alignItems="center">
                <Icon as={getVehicleIcon()} mr={1} /> 
                {getVehicleName()}
              </Badge>
            </HStack>
          </VStack>
        </GridItem>

        {/* Total Price */}
        <GridItem>
          <Stat>
            <StatLabel color="gray.300" fontSize="xs">Total Price</StatLabel>
            <StatNumber color="brand.secondary" fontWeight="bold">₦{totalAmount.toLocaleString()}</StatNumber>
            <Tooltip label={`Rider bid: ₦${amount.toLocaleString()} + Service fee: ₦${serviceFee.toLocaleString()}`} placement="top">
              <StatHelpText color="gray.400" fontSize="xs" cursor="help">
                <Icon as={FaInfoCircle} mr={1} />
                Breakdown
              </StatHelpText>
            </Tooltip>
          </Stat>
        </GridItem>
      </Grid>

      {/* Divider */}
      <Divider my={3} borderColor="rgba(157, 78, 221, 0.2)" />
      
      {/* Bottom section - Delivery details */}
      <Flex justify="space-between" align="center" wrap="wrap">
        {/* Estimated Time */}
        <HStack spacing={2} mr={4}>
          <Icon as={FaClock} color="blue.400" />
          <VStack spacing={0} align="start">
            <Text fontSize="xs" color="gray.400">Estimated Time</Text>
            <Text color="white" fontWeight="medium">{estimatedTime}</Text>
          </VStack>
        </HStack>
        
        {/* Bid Time */}
        <Text fontSize="xs" color="gray.400">
          Bid placed {bidTime}
        </Text>
      </Flex>
    </Box>
  );
};

export default RiderProfileCard; 