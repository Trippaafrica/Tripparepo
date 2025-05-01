import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Icon,
  ScaleFade,
  Card,
  CardBody,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account',
        status: 'success',
        duration: 5000,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={20}>
      <ScaleFade initialScale={0.9} in={true}>
        <Card>
          <CardBody>
            <VStack spacing={8}>
              <VStack spacing={2}>
                <Icon as={FaUserPlus} w={10} h={10} color="brand.secondary" />
                <Heading
                  size="lg"
                  bgGradient="linear(to-r, brand.secondary, brand.primary)"
                  bgClip="text"
                >
                  Create Account
                </Heading>
              </VStack>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={isLoading}
                    mt={4}
                  >
                    Sign Up
                  </Button>
                </VStack>
              </form>

              <Text>
                Already have an account?{' '}
                <ChakraLink
                  as={RouterLink}
                  to="/login"
                  color="brand.secondary"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Login
                </ChakraLink>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </ScaleFade>
    </Container>
  );
};

export default SignUp; 