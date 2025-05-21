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
  GridItem,
  useBreakpointValue
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
  const isMobile = useBreakpointValue({ base: true, sm: false });
  
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
      p={{ base: 3, sm: 4 }} 
      borderRadius="lg" 
      bg="rgba(26, 26, 46, 0.6)"
      border="1px solid rgba(157, 78, 221, 0.2)"
      backdropFilter="blur(10px)"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      width="100%"
    >
      {/* Top section - Rider info and amount */}
      <Grid 
        templateColumns={{ base: "auto 1fr", md: "auto 1fr auto" }}
        gap={{ base: 3, sm: 4 }}
      >
        {/* Rider Avatar */}
        <GridItem>
          <Avatar 
            size={{ base: "md", sm: "lg" }}
            name={riderName} 
            bg={generateAvatarColor()}
          />
        </GridItem>
        
        {/* Rider Name and Rating */}
        <GridItem>
          <VStack align="start" spacing={{ base: 0.5, sm: 1 }}>
            <Text 
              fontWeight="bold" 
              color="white" 
              fontSize={{ base: "md", sm: "lg" }}
              noOfLines={1}
            >
              {riderName}
            </Text>
            <HStack wrap="wrap" spacing={{ base: 1, sm: 2 }}>
            <HStack>
                <Icon as={FaStar} color="yellow.400" boxSize={{ base: 3, sm: 4 }} />
                <Text color="gray.300" fontSize={{ base: "xs", sm: "sm" }}>
                {rating.toFixed(1)} rating
              </Text>
              </HStack>
              
              <Badge 
                colorScheme={getVehicleColor()} 
                ml={{ base: 0.5, sm: 2 }}
                fontSize={{ base: "xs", sm: "sm" }}
                display="flex" 
                alignItems="center"
                px={1.5}
                py={0.5}
              >
                <Icon as={getVehicleIcon()} mr={1} boxSize={{ base: 3, sm: 3.5 }} /> 
                {isMobile ? vehicleType : getVehicleName()}
              </Badge>
            </HStack>
          </VStack>
        </GridItem>

        {/* Total Price - On mobile, this is placed below in a separate row */}
        <GridItem colSpan={{ base: 2, md: 1 }}>
          <Stat mt={{ base: 2, md: 0 }}>
            <StatLabel color="gray.300" fontSize={{ base: "2xs", sm: "xs" }} mb={-0.5}>
              Total Price
            </StatLabel>
            <StatNumber 
              color="brand.secondary" 
              fontWeight="bold"
              fontSize={{ base: "lg", sm: "xl" }}
            >
              ₦{totalAmount.toLocaleString()}
            </StatNumber>
            <Tooltip label={`Rider bid: ₦${amount.toLocaleString()} + Service fee: ₦${serviceFee.toLocaleString()}`} placement="top">
              <StatHelpText color="gray.400" fontSize={{ base: "3xs", sm: "xs" }} cursor="help" mt={-0.5}>
                <Icon as={FaInfoCircle} mr={1} boxSize={{ base: 2.5, sm: 3 }} />
                Breakdown
              </StatHelpText>
            </Tooltip>
          </Stat>
        </GridItem>
      </Grid>

      {/* Divider */}
      <Divider my={{ base: 2, sm: 3 }} borderColor="rgba(157, 78, 221, 0.2)" />
      
      {/* Bottom section - Delivery details */}
      <Flex 
        justify="space-between" 
        align={{ base: "flex-start", sm: "center" }} 
        wrap="wrap"
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 2, sm: 0 }}
      >
        {/* Estimated Time */}
        <HStack spacing={{ base: 2, sm: 2 }} mr={4}>
          <Icon as={FaClock} color="blue.400" boxSize={{ base: 3.5, sm: 4 }} />
          <VStack spacing={0} align="start">
            <Text fontSize={{ base: "2xs", sm: "xs" }} color="gray.400">Estimated Time</Text>
            <Text color="white" fontWeight="medium" fontSize={{ base: "sm", sm: "md" }}>{estimatedTime}</Text>
          </VStack>
        </HStack>
        
        {/* Bid Time */}
        <Text fontSize={{ base: "2xs", sm: "xs" }} color="gray.400">
          Bid placed {bidTime}
        </Text>
      </Flex>
    </Box>
  );
};

export default RiderProfileCard; 