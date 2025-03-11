import axios from 'axios';

// Determine the API base URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL 
  : 'http://localhost:5000';

export const fetchResumeContent = async (): Promise<string> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/resume`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

export const saveResumeContent = async (content: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/api/resume/save`, { content });
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}; 