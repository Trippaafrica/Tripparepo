import { Box, Container, Heading, SimpleGrid, VStack, Text, Button, Icon, useColorModeValue, Image, Flex, Badge, Card, CardBody, ScaleFade, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMotorcycle, FaTruck, FaTruckMoving, FaGasPump, FaStar, FaClock, FaShieldAlt, FaUsers, FaMapMarkedAlt, FaMoneyBillWave, FaRoute } from 'react-icons/fa';
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

const riderBenefits = [
  {
    title: "Flexible Hours",
    description: "Choose your own schedule and work when it suits you",
    icon: FaClock,
    color: "green",
  },
  {
    title: "Competitive Earnings",
    description: "Earn up to ₦25,000 per delivery with surge pricing",
    icon: FaMoneyBillWave,
    color: "yellow",
  },
  {
    title: "Weekly Payouts",
    description: "Get paid weekly with no hidden fees",
    icon: FaRoute,
    color: "blue",
  },
];

const Home = () => {
  const cardBg = useColorModeValue('white', 'rgba(26, 26, 46, 0.8)');
  const cardBorder = useColorModeValue('gray.200', 'rgba(157, 78, 221, 0.2)');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  return (
    <Box>
      {/* Header Section with Gradient Background */}
      <Box
        bgGradient="linear(to-r, brand.dark, brand.primary)"
        py={20}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="url('/images/pattern.png')"
          opacity={0.1}
        />
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="center">
            <VStack spacing={8} position="relative" zIndex={1}>
              <Heading
                size="2xl"
                textAlign="center"
                color="white"
                textShadow="0 2px 4px rgba(0,0,0,0.2)"
              >
                Fast & Reliable Delivery Services
              </Heading>
              <Text
                fontSize="xl"
                color="gray.200"
                textAlign="center"
                maxW="2xl"
              >
                Choose from our range of delivery options and get your items delivered safely and on time
              </Text>
              <Button
                as={RouterLink}
                to="/delivery"
                size="lg"
                colorScheme="brand"
                leftIcon={<Icon as={FaMotorcycle} />}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(57, 255, 20, 0.3)',
                }}
              >
                Book Now
              </Button>
            </VStack>
            <Box
              position="relative"
              height="400px"
              width="100%"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="0 8px 32px rgba(57, 255, 20, 0.2)"
              bgGradient="radial(circle at 50% 50%, rgba(157, 78, 221, 0.3), rgba(26, 26, 46, 0.9))"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src="/images/delivery-cyclist.png"
                alt="Delivery Cyclist"
                objectFit="contain"
                height="90%"
                width="90%"
                filter="drop-shadow(0 0 20px rgba(57, 255, 20, 0.2))"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="container.xl" py={16}>
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
                  <Heading size="md" color={textColor}>{title}</Heading>
                  <Text color={descriptionColor}>{description}</Text>
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

          {/* Become a Rider Section */}
          <Card
            bg="rgba(26, 26, 46, 0.8)"
            border="1px solid"
            borderColor="rgba(157, 78, 221, 0.2)"
            overflow="hidden"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={0}>
              <Box p={8}>
                <VStack spacing={6} align="start">
                  <Heading size="lg" color="brand.secondary">
                    Become a Trippa Rider
                  </Heading>
                  <Text color="gray.300">
                    Join our network of professional delivery riders and start earning today. 
                    Enjoy flexible hours, competitive pay, and weekly payments.
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} width="100%">
                    {riderBenefits.map((benefit, index) => (
                      <Card key={index} bg="rgba(26, 26, 46, 0.6)" border="1px solid" borderColor="rgba(157, 78, 221, 0.2)">
                        <CardBody>
                          <VStack spacing={3} align="start">
                            <Icon as={benefit.icon} w={6} h={6} color={`${benefit.color}.400`} />
                            <Heading size="sm" color="brand.secondary">
                              {benefit.title}
                            </Heading>
                            <Text fontSize="sm" color="gray.400">
                              {benefit.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                  <Button
                    colorScheme="brand"
                    size="lg"
                    leftIcon={<Icon as={FaMotorcycle} />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(57, 255, 20, 0.3)',
                    }}
                  >
                    Apply Now
                  </Button>
                </VStack>
              </Box>
              <Box
                bgImage="url('/images/rider-hero.jpg')"
                bgSize="cover"
                bgPosition="center"
                minH="400px"
                position="relative"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="linear-gradient(to right, rgba(26, 26, 46, 0.9), rgba(26, 26, 46, 0.6))"
                />
              </Box>
            </SimpleGrid>
          </Card>

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
    </Box>
  );
};

export default Home; 