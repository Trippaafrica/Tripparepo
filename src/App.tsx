import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import DeliveryBooking from './pages/DeliveryBooking';
import BiddingPage from './pages/BiddingPage';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
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
