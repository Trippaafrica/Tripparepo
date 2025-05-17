import {
  Box,
  VStack,
  Text,
  Card,
  CardBody,
  HStack,
  Badge,
  Progress,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { FaBox, FaCheckCircle, FaTruck, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

interface OrderTrackingProps {
  order: {
    id: string;
    status: string;
    pickup_code?: string;
    dropoff_code?: string;
    pickup_location?: string;
    dropoff_location?: string;
    pickup_address?: string;
    dropoff_address?: string;
    created_at: string;
  };
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'yellow';
      case 'accepted':
        return 'blue';
      case 'in_progress':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 25;
      case 'accepted':
        return 50;
      case 'in_progress':
        return 75;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const getFormattedStatus = (status: string) => {
    if (!status) return 'UNKNOWN';
    return status.replace('_', ' ').toUpperCase();
  };

  // Get pickup and dropoff locations, using fallbacks for different field names
  const pickupLocation = order.pickup_location || order.pickup_address || 'No pickup location provided';
  const dropoffLocation = order.dropoff_location || order.dropoff_address || 'No dropoff location provided';

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card 
      width="100%" 
      bg={bgColor} 
      border="1px solid" 
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: "brand.secondary"
      }}
      role="group"
    >
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">Order #{order.id.slice(0, 8)}</Text>
            <Badge colorScheme={getStatusColor(order.status)} fontSize="md" px={3} py={1}>
              {getFormattedStatus(order.status)}
            </Badge>
          </HStack>

          <Box>
            <Progress
              value={getProgressValue(order.status)}
              colorScheme={getStatusColor(order.status)}
              size="sm"
              borderRadius="full"
            />
          </Box>

          <VStack spacing={4} align="stretch">
            <Box>
              <HStack spacing={2} mb={2}>
                <FaMapMarkerAlt color="green" />
                <Text fontWeight="bold">Pickup Details</Text>
              </HStack>
              <Text ml={6} noOfLines={1}>{pickupLocation}</Text>
              {order.pickup_code && (
                <HStack ml={6} mt={2} spacing={2}>
                  <Text color="gray.500">Pickup Code:</Text>
                  <Text fontWeight="bold" color="green.500">{order.pickup_code}</Text>
                </HStack>
              )}
            </Box>

            <Box>
              <HStack spacing={2} mb={2}>
                <FaMapMarkerAlt color="red" />
                <Text fontWeight="bold">Dropoff Details</Text>
              </HStack>
              <Text ml={6} noOfLines={1}>{dropoffLocation}</Text>
              {order.dropoff_code && (
                <HStack ml={6} mt={2} spacing={2}>
                  <Text color="gray.500">Dropoff Code:</Text>
                  <Text fontWeight="bold" color="red.500">{order.dropoff_code}</Text>
                </HStack>
              )}
            </Box>

            <Box>
              <HStack spacing={2} mb={2}>
                <FaTruck />
                <Text fontWeight="bold">Order Timeline</Text>
              </HStack>
              <VStack align="start" ml={6} spacing={2}>
                <HStack>
                  <FaCheckCircle color={order.status !== 'cancelled' ? 'green' : 'gray'} />
                  <Text>Order Placed</Text>
                  <Text color="gray.500" fontSize="sm">
                    {new Date(order.created_at).toLocaleString()}
                  </Text>
                </HStack>
                <HStack>
                  <FaCheckCircle color={['accepted', 'in_progress', 'completed'].includes(order.status.toLowerCase()) ? 'green' : 'gray'} />
                  <Text>Order Accepted</Text>
                </HStack>
                <HStack>
                  <FaCheckCircle color={['in_progress', 'completed'].includes(order.status.toLowerCase()) ? 'green' : 'gray'} />
                  <Text>In Progress</Text>
                </HStack>
                <HStack>
                  <FaCheckCircle color={order.status.toLowerCase() === 'completed' ? 'green' : 'gray'} />
                  <Text>Delivery Completed</Text>
                </HStack>
              </VStack>
            </Box>

            <Button
              as={RouterLink}
              to={`/order/${order.id}`}
              colorScheme="brand"
              size="sm"
              rightIcon={<FaArrowRight />}
              alignSelf="flex-end"
              mt={2}
              opacity={{ base: 1, md: 0 }}
              _groupHover={{ opacity: 1 }}
              transition="all 0.2s"
            >
              View Details
            </Button>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderTracking; 