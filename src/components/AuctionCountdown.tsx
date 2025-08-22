import React, { useState, useEffect } from 'react';

interface AuctionCountdownProps {
  endTime: string | null;
}

const AuctionCountdown: React.FC<AuctionCountdownProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('N/A');
  
  useEffect(() => {
    if (!endTime) {
      setTimeLeft('N/A');
      return;
    }
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Format with leading zeros for better readability
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');
      
      if (days > 0) {
        setTimeLeft(`${days}d ${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
      } else {
        setTimeLeft(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
      }
    };
    
    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Clean up on unmount
    return () => clearInterval(timer);
  }, [endTime]);
  
  return (
    <span className={`font-medium ${timeLeft === 'Ended' ? 'text-red-600' : timeLeft === 'N/A' ? 'text-gray-500' : 'text-red-600 font-bold'}`}>
      {timeLeft}
    </span>
  );
};

export default AuctionCountdown;
