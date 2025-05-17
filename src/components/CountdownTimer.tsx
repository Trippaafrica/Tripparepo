import { useState, useEffect } from 'react';
import { Text, HStack, Box, CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import { FaClock } from 'react-icons/fa';

interface CountdownTimerProps {
  duration: number; // Duration in minutes
  onComplete?: () => void;
}

const CountdownTimer = ({ duration, onComplete }: CountdownTimerProps) => {
  const initialTimeInSeconds = duration * 60; // Convert to seconds
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, isRunning, onComplete]);

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate percentage of time remaining
  const percentComplete = Math.max(0, Math.min(100, (timeLeft / initialTimeInSeconds) * 100));

  return (
    <HStack spacing={3} alignItems="center">
      <CircularProgress 
        value={percentComplete} 
        color={percentComplete > 50 ? "green.400" : percentComplete > 20 ? "yellow.400" : "red.400"}
        size="60px"
        thickness="8px"
      >
        <CircularProgressLabel fontSize="sm" fontWeight="bold">
          {formatTime(timeLeft)}
        </CircularProgressLabel>
      </CircularProgress>
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.300">
          <FaClock style={{ display: 'inline', marginRight: '6px' }} />
          Waiting for bids
        </Text>
        <Text fontSize="xs" color="gray.400">
          {timeLeft > 0 ? "Time remaining" : "Time's up!"}
        </Text>
      </Box>
    </HStack>
  );
};

export default CountdownTimer; 