import { apiUrl } from '../components/common/http';

// Check car availability
export const checkAvailability = async (carId, pickupDate, returnDate, token) => {
  try {
    const response = await fetch(`${apiUrl}/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        car_id: carId,
        pickup_date: pickupDate,
        return_date: returnDate
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Create booking
export const createBooking = async (bookingData, token) => {
  try {
    const response = await fetch(`${apiUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Process payment
export const processPayment = async (bookingId, token) => {
  try {
    const response = await fetch(`${apiUrl}/bookings/${bookingId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    return await response.json();
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Update this function to match your backend API structure
export const getUserBookings = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/user/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log("API response for user bookings:", data);
    return data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};