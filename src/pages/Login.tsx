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
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to login. Please check your credentials.',
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
                <Icon as={FaUser} w={10} h={10} color="brand.secondary" />
                <Heading
                  size="lg"
                  bgGradient="linear(to-r, brand.secondary, brand.primary)"
                  bgClip="text"
                >
                  Login to Trippa
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
                      placeholder="Enter your password"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={isLoading}
                    mt={4}
                  >
                    Login
                  </Button>
                </VStack>
              </form>

              <Text>
                Don't have an account?{' '}
                <ChakraLink
                  as={RouterLink}
                  to="/signup"
                  color="brand.secondary"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Sign up
                </ChakraLink>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </ScaleFade>
    </Container>
  );
};

export default Login; 