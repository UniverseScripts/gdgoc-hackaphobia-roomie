import api from './api';

export interface MatchProfile {
  user_id: number;
  username: string;
  match_score: number;
  // In a real app, you'd fetch avatar_url or bio here too
}

export const getMyMatches = async (): Promise<MatchProfile[]> => {
  const response = await api.get('/matches');
  return response.data;
};