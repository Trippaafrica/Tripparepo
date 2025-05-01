import { Box, Grid, Heading, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaMotorcycle, FaTruck, FaTruckMoving, FaGasPump } from 'react-icons/fa';
import { DeliveryType } from '../types';

const deliveryOptions: { type: DeliveryType; title: string; icon: any; description: string }[] = [
  {
    type: 'bike',
    title: 'Bike Delivery',
    icon: FaMotorcycle,
    description: 'Fast and efficient delivery for small packages',
  },
  {
    type: 'truck',
    title: 'Truck Delivery',
    icon: FaTruck,
    description: 'Heavy-duty delivery for large items',
  },
  {
    type: 'van',
    title: 'Van Delivery',
    icon: FaTruckMoving,
    description: 'Medium-sized deliveries with extra space',
  },
  {
    type: 'fuel',
    title: 'Fuel Delivery',
    icon: FaGasPump,
    description: 'Emergency fuel delivery service',
  },
];

const DeliveryCard = ({ type, title, icon: Icon, description }: typeof deliveryOptions[0]) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', bg: hoverBg }}
      onClick={() => navigate(`/delivery/${type}`)}
    >
      <VStack spacing={4}>
        <Icon size={40} />
        <Heading size="md">{title}</Heading>
        <Text textAlign="center" color="gray.600">
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

const Home = () => {
  return (
    <Box p={8}>
      <VStack spacing={8}>
        <Heading>Welcome to Trippa</Heading>
        <Text fontSize="xl" color="gray.600">
          Choose your delivery type
        </Text>
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={6}
          w="full"
        >
          {deliveryOptions.map((option) => (
            <DeliveryCard key={option.type} {...option} />
          ))}
        </Grid>
      </VStack>
    </Box>
  );
};

export default Home; 