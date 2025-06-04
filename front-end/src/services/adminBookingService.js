const API_URL = 'http://localhost:8000/api';

// Fetch all bookings with optional filtering
export const getAdminBookings = async (filters = {}, token) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.from_date) queryParams.append('from_date', filters.from_date);
    if (filters.to_date) queryParams.append('to_date', filters.to_date);
    
    const url = `${API_URL}/admin/bookings?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    throw error;
  }
};

// Fetch a single booking by ID
export const getAdminBookingById = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/admin/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch booking details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (id, data, token) => {
  try {
    console.log('Updating booking status:', { id, data });
    
    const response = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    let responseData;
    
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
      console.log('API response:', responseData);
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      throw new Error(responseData.message || `Failed to update booking (${response.status})`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Fetch booking statistics
export const getBookingStats = async (token) => {
  try {
    const response = await fetch(`${API_URL}/admin/booking-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch booking stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw error;
  }
};