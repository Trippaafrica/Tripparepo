import { Box, Container, Heading, Text, Link, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export default function Login() {
  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={8} align="center">
        <Heading color="brand.secondary">Welcome Back</Heading>
        <LoginForm />
        <Text>
          Don't have an account?{' '}
          <Link as={RouterLink} to="/signup" color="brand.secondary">
            Sign up
          </Link>
        </Text>
      </VStack>
    </Container>
  );
} 