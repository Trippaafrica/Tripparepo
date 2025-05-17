import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await signUp(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={8}
      maxWidth="400px"
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
      bg="rgba(26, 26, 46, 0.8)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(157, 78, 221, 0.2)"
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="email" isRequired isInvalid={!!error}>
            <FormLabel color="gray.200">Email address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color="white"
              _placeholder={{ color: 'gray.400' }}
              bg="rgba(26, 26, 46, 0.6)"
              borderColor="rgba(157, 78, 221, 0.2)"
              _hover={{
                borderColor: 'brand.primary',
              }}
              _focus={{
                borderColor: 'brand.secondary',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
              }}
            />
          </FormControl>

          <FormControl id="password" isRequired isInvalid={!!error}>
            <FormLabel color="gray.200">Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color="white"
              _placeholder={{ color: 'gray.400' }}
              bg="rgba(26, 26, 46, 0.6)"
              borderColor="rgba(157, 78, 221, 0.2)"
              _hover={{
                borderColor: 'brand.primary',
              }}
              _focus={{
                borderColor: 'brand.secondary',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
              }}
            />
          </FormControl>

          <FormControl id="confirm-password" isRequired isInvalid={!!error}>
            <FormLabel color="gray.200">Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              color="white"
              _placeholder={{ color: 'gray.400' }}
              bg="rgba(26, 26, 46, 0.6)"
              borderColor="rgba(157, 78, 221, 0.2)"
              _hover={{
                borderColor: 'brand.primary',
              }}
              _focus={{
                borderColor: 'brand.secondary',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
              }}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            width="full"
            isLoading={loading}
            loadingText="Creating account..."
          >
            Sign Up
          </Button>
        </VStack>
      </form>
    </Box>
  );
} 