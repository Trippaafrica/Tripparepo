import { Box, Container, Heading, SimpleGrid, VStack, Text, Button, Icon, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaTruck, FaShippingFast, FaCalendarAlt } from 'react-icons/fa';

const deliveryTypes = [
  {
    type: 'standard',
    title: 'Standard Delivery',
    description: 'Regular delivery service with 2-3 business days delivery time',
    icon: FaTruck,
  },
  {
    type: 'express',
    title: 'Express Delivery',
    description: 'Fast delivery service with same-day or next-day delivery',
    icon: FaShippingFast,
  },
  {
    type: 'scheduled',
    title: 'Scheduled Delivery',
    description: 'Plan your delivery for a specific date and time',
    icon: FaCalendarAlt,
  },
];

const Home = () => {
  const cardBg = useColorModeValue('white', 'rgba(26, 26, 46, 0.8)');
  const cardBorder = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={12}>
        <VStack spacing={4} textAlign="center">
          <Icon as={FaTruck} w={16} h={16} color="brand.secondary" />
          <Heading
            size="2xl"
            bgGradient="linear(to-r, brand.secondary, brand.primary)"
            bgClip="text"
          >
            Welcome to Trippa
          </Heading>
          <Text fontSize="xl" color="gray.400">
            Choose your delivery type to get started
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} width="100%">
          {deliveryTypes.map(({ type, title, description, icon }) => (
            <Box
              key={type}
              as={RouterLink}
              to={`/delivery/${type}`}
              p={6}
              bg={cardBg}
              borderRadius="xl"
              border="1px solid"
              borderColor={cardBorder}
              boxShadow="0 4px 20px rgba(157, 78, 221, 0.15)"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(57, 255, 20, 0.2)',
                borderColor: 'brand.secondary',
              }}
            >
              <VStack spacing={4} align="start">
                <Icon as={icon} w={8} h={8} color="brand.secondary" />
                <Heading size="md">{title}</Heading>
                <Text color="gray.400">{description}</Text>
                <Button
                  colorScheme="brand"
                  variant="outline"
                  size="sm"
                  mt={2}
                  _hover={{
                    bg: 'brand.secondary',
                    color: 'brand.dark',
                  }}
                >
                  Book Now
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Home; 