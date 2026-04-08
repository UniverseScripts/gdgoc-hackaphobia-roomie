import api from './api';

export interface TestSubmission {
  sleep_schedule: string;
  cleanliness: string;
  noise_tolerance: string;
  guest_frequency: string;
  budget: string;
  priority: string;
  district: string;      // "District 1", etc.
}

export const checkTestStatus = async () => {
  const response = await api.get('/test/status');
  return response.data; // Returns { completed: true/false }
};

export const submitAssessment = async (data: TestSubmission) => {
  const response = await api.post('/test/submit', data);
  return response.data;
};