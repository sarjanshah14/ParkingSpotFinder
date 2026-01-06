// src/utils/DateUtils.js
export const formatBookingDate = (booking) => {
    // Ensure we're working with Date objects
    const start = booking.start_time instanceof Date ? booking.start_time : new Date(booking.start_time);
    const end = booking.end_time instanceof Date ? booking.end_time : new Date(booking.end_time);
    
    // Handle invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date received:', booking.start_time, booking.end_time);
      return {
        date: 'Invalid date',
        timeRange: 'Invalid time range',
        duration: booking.duration ? `${booking.duration} hour${booking.duration !== 1 ? 's' : ''}` : 'N/A'
      };
    }
  
    return {
      date: start.toLocaleDateString(),
      timeRange: `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      duration: `${booking.duration} hour${booking.duration !== 1 ? 's' : ''}`
    };
  };    