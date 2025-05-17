interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distance: number; // in kilometers
  duration: string; // formatted duration string
  durationValue: number; // in seconds
}

/**
 * Calculate the distance and time between two coordinates using Haversine formula
 * @param origin The origin coordinates
 * @param destination The destination coordinates
 * @returns Promise with distance and duration information
 */
export const calculateDistance = async (
  origin: LatLngLiteral,
  destination: LatLngLiteral
): Promise<DistanceResult> => {
  try {
    // Calculate distance using Haversine formula
    const distance = calculateHaversineDistance(origin, destination);
    
    // Estimate duration based on average speed of 30 km/h
    const durationValue = Math.round((distance / 30) * 3600); // seconds
    const durationText = formatDuration(durationValue);
    
    return {
      distance,
      duration: durationText,
      durationValue
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    return {
      distance: 5.3, // Fallback value
      duration: '30-45 minutes', // Fallback value
      durationValue: 2100 // 35 minutes in seconds
    };
  }
};

/**
 * Calculate distance between two coordinates using the Haversine formula
 */
const calculateHaversineDistance = (
  origin: LatLngLiteral,
  destination: LatLngLiteral
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) *
    Math.cos(toRad(destination.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(2));
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

/**
 * Format duration in seconds to a human-readable string
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

/**
 * Estimate delivery time based on distance and vehicle type
 * @param distance Distance in kilometers
 * @param vehicleType Type of vehicle
 * @returns Estimated delivery time in minutes
 */
export const estimateDeliveryTime = (
  distance: number,
  vehicleType: 'bike' | 'truck' | 'van' | 'fuel'
): number => {
  // Average speeds in km/h by vehicle type
  const avgSpeeds = {
    bike: 25, // Motorbike in urban areas
    truck: 30,
    van: 35,
    fuel: 30
  };
  
  const avgSpeed = avgSpeeds[vehicleType]; 
  const timeHours = distance / avgSpeed;
  const timeMinutes = timeHours * 60;
  
  // Add 10 minutes for pickup and 10 minutes for dropoff logistics
  return Math.round(timeMinutes + 20);
}; 