import { useParams } from 'react-router-dom';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import CreateDeliveryRequest from '../components/CreateDeliveryRequest';
import { DeliveryType } from '../types';

const DeliveryBooking = () => {
  const { type } = useParams<{ type: DeliveryType }>();

  if (!type || !['bike', 'truck', 'van', 'fuel'].includes(type)) {
    return (
      <Box p={8} textAlign="center">
        <VStack spacing={4}>
          <Heading>Invalid Delivery Type</Heading>
          <Text>Please select a valid delivery type from the home page.</Text>
        </VStack>
      </Box>
    );
  }

  return <CreateDeliveryRequest />;
};

export default DeliveryBooking; 