import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import DeliveryBooking from './pages/DeliveryBooking';
import BiddingPage from './pages/BiddingPage';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: '#9D4EDD', // Dark purple
      secondary: '#39FF14', // Neon green
      dark: '#1A1A2E', // Dark background
      light: '#F8F9FA', // Light text
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.dark',
        color: 'brand.light',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.secondary',
          color: 'brand.dark',
          _hover: {
            bg: 'brand.secondary',
            opacity: 0.9,
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(57, 255, 20, 0.3)',
          },
          _active: {
            bg: 'brand.secondary',
            opacity: 0.8,
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(26, 26, 46, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(157, 78, 221, 0.2)',
          boxShadow: '0 4px 20px rgba(157, 78, 221, 0.15)',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'rgba(26, 26, 46, 0.6)',
          border: '1px solid rgba(157, 78, 221, 0.2)',
          _hover: {
            borderColor: 'brand.primary',
          },
          _focus: {
            borderColor: 'brand.secondary',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
          },
        },
      },
    },
    Textarea: {
      baseStyle: {
        bg: 'rgba(26, 26, 46, 0.6)',
        border: '1px solid rgba(157, 78, 221, 0.2)',
        _hover: {
          borderColor: 'brand.primary',
        },
        _focus: {
          borderColor: 'brand.secondary',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
        },
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          bg: 'rgba(26, 26, 46, 0.6)',
          border: '1px solid rgba(157, 78, 221, 0.2)',
          _hover: {
            borderColor: 'brand.primary',
          },
          _focus: {
            borderColor: 'brand.secondary',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/delivery/:type" element={<DeliveryBooking />} />
              <Route path="/bidding/:requestId" element={<BiddingPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;
