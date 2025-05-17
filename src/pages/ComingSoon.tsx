import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Image,
  Box,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaArrowLeft, FaTools } from 'react-icons/fa';

const ComingSoon = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  
  const getServiceName = () => {
    if (!serviceType) return 'This feature';
    
    switch (serviceType) {
      case 'search':
        return 'Search functionality';
      case 'fuel':
        return 'Fuel delivery service';
      default:
        return `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} service`;
    }
  };
  
  const headingColor = useColorModeValue('brand.primary', 'brand.secondary');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack 
        spacing={8} 
        align="center" 
        bg={bgColor}
        p={8}
        borderRadius="xl"
        boxShadow="md"
      >
        <Icon as={FaTools} w={16} h={16} color={headingColor} />
        
        <VStack spacing={4}>
          <Heading size="xl" textAlign="center" color={headingColor}>
            Coming Soon!
          </Heading>
          
          <Text fontSize="lg" textAlign="center">
            {getServiceName()} is currently under development.
          </Text>
          
          <Text textAlign="center" color="gray.500">
            We're working hard to bring you this feature. Please check back later!
          </Text>
        </VStack>
        
        <Box>
          <Image 
            src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" 
            alt="Under Construction" 
            borderRadius="md"
            maxH="200px"
            objectFit="cover"
          />
        </Box>
        
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={() => navigate('/')}
          colorScheme="brand"
          size="lg"
        >
          Back to Home
        </Button>
      </VStack>
    </Container>
  );
};

export default ComingSoon; 