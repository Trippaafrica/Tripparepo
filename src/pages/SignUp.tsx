import { Box, Container, Heading, Text, Link, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SignUpForm } from '../components/SignUpForm';

export default function SignUp() {
  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={8} align="center">
        <Heading color="brand.secondary">Create Account</Heading>
        <SignUpForm />
        <Text>
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="brand.secondary">
            Sign in
          </Link>
        </Text>
      </VStack>
    </Container>
  );
} 