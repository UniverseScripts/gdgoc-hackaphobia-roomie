import api from './api';

export interface OnboardingStatus {
  profile_completed: boolean;
  test_completed: boolean;
}

export interface ProfileData {
  full_name: string;
  age: number;
  gender: string;
  university: string;
  major: string;
  bio: string;
  username?: string;
}

export const getOnboardingStatus = async () => {
  const response = await api.get<OnboardingStatus>('/onboarding/status');
  return response.data;
};

export const submitProfile = async (data: ProfileData) => {
  const response = await api.post('/onboarding/profile', data);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get<ProfileData>('/onboarding/profile');
  return response.data;
};