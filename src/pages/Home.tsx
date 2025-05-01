import { Box, Container, Heading, SimpleGrid, VStack, Text, Button, Icon, useColorModeValue, Image, Flex, Badge, Card, CardBody, ScaleFade } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMotorcycle, FaTruck, FaTruckMoving, FaGasPump, FaStar, FaClock, FaShieldAlt, FaUsers, FaMapMarkedAlt } from 'react-icons/fa';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const deliveryTypes = [
  {
    type: 'bike',
    title: 'Bike Delivery',
    description: 'Fast and efficient delivery for small packages and urgent items',
    icon: FaMotorcycle,
  },
  {
    type: 'truck',
    title: 'Truck Delivery',
    description: 'Heavy-duty delivery for large items and bulk shipments',
    icon: FaTruck,
  },
  {
    type: 'van',
    title: 'Van Delivery',
    description: 'Medium-sized deliveries with extra space and flexibility',
    icon: FaTruckMoving,
  },
  {
    type: 'fuel',
    title: 'Fuel Delivery',
    description: 'Emergency fuel delivery service for vehicles and generators',
    icon: FaGasPump,
  },
];

const successStories = [
  {
    title: "Emergency Fuel Delivery",
    description: "Saved a stranded family during a late-night breakdown with our rapid fuel delivery service.",
    icon: FaGasPump,
    color: "orange",
  },
  {
    title: "Medical Supplies",
    description: "Delivered critical medical supplies to a remote clinic within 2 hours.",
    icon: FaTruck,
    color: "red",
  },
  {
    title: "Business Relocation",
    description: "Successfully handled the complete office relocation for a tech startup.",
    icon: FaTruckMoving,
    color: "blue",
  },
];

const stats = [
  { label: "Deliveries Completed", value: "10,000+" },
  { label: "Happy Customers", value: "5,000+" },
  { label: "Cities Covered", value: "50+" },
  { label: "Average Rating", value: "4.8/5" },
];

const Home = () => {
  const cardBg = useColorModeValue('white', 'rgba(26, 26, 46, 0.8)');
  const cardBorder = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={16}>
        {/* Delivery Types Section */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} width="100%">
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

        {/* Stats Section */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} width="100%">
          {stats.map((stat, index) => (
            <Card key={index} bg="rgba(26, 26, 46, 0.8)" border="1px solid" borderColor="rgba(157, 78, 221, 0.2)">
              <CardBody>
                <VStack spacing={2}>
                  <Heading size="lg" color="brand.secondary">
                    {stat.value}
                  </Heading>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    {stat.label}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Hero Image Section */}
        <motion.div
          ref={scrollRef}
          style={{
            width: '100%',
            position: 'relative',
            opacity,
            scale,
          }}
        >
          <Image
            src="/images/delivery-hero.jpg"
            alt="Delivery Service"
            borderRadius="xl"
            fallbackSrc="https://via.placeholder.com/1200x600?text=Delivery+Service"
            objectFit="cover"
            width="100%"
            height="400px"
          />
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="linear-gradient(to top, rgba(26, 26, 46, 0.9), transparent)"
            p={8}
          >
            <VStack spacing={4} align="start">
              <Heading size="lg" color="white">
                Your Trusted Delivery Partner
              </Heading>
              <Text color="gray.300">
                Fast, reliable, and secure delivery services for all your needs
              </Text>
            </VStack>
          </Box>
        </motion.div>

        {/* Success Stories Section */}
        <VStack spacing={8} width="100%">
          <Heading size="lg" color="brand.secondary">
            Success Stories
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} width="100%">
            {successStories.map((story, index) => (
              <Card key={index} bg="rgba(26, 26, 46, 0.8)" border="1px solid" borderColor="rgba(157, 78, 221, 0.2)">
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Icon as={story.icon} w={8} h={8} color={`${story.color}.400`} />
                    <Heading size="md" color="brand.secondary">
                      {story.title}
                    </Heading>
                    <Text color="gray.400">
                      {story.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>

        {/* Trust Badges */}
        <Flex wrap="wrap" gap={4} justify="center" width="100%">
          <Badge colorScheme="green" px={4} py={2} borderRadius="full">
            <Flex align="center" gap={2}>
              <Icon as={FaShieldAlt} />
              <Text>Secure Delivery</Text>
            </Flex>
          </Badge>
          <Badge colorScheme="blue" px={4} py={2} borderRadius="full">
            <Flex align="center" gap={2}>
              <Icon as={FaClock} />
              <Text>24/7 Support</Text>
            </Flex>
          </Badge>
          <Badge colorScheme="purple" px={4} py={2} borderRadius="full">
            <Flex align="center" gap={2}>
              <Icon as={FaStar} />
              <Text>Rated 4.8/5</Text>
            </Flex>
          </Badge>
          <Badge colorScheme="orange" px={4} py={2} borderRadius="full">
            <Flex align="center" gap={2}>
              <Icon as={FaUsers} />
              <Text>5,000+ Happy Customers</Text>
            </Flex>
          </Badge>
          <Badge colorScheme="teal" px={4} py={2} borderRadius="full">
            <Flex align="center" gap={2}>
              <Icon as={FaMapMarkedAlt} />
              <Text>50+ Cities Covered</Text>
            </Flex>
          </Badge>
        </Flex>
      </VStack>
    </Container>
  );
};

export default Home; 