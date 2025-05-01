import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DeliveryBooking from './pages/DeliveryBooking';
import BiddingPage from './pages/BiddingPage';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/delivery/:type" element={<DeliveryBooking />} />
          <Route path="/bidding/:requestId" element={<BiddingPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
