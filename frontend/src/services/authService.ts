import api from './api';

export const loginUser = async (formData: FormData) => {
  // We use URLSearchParams because OAuth2 expects form-data, not JSON
  const params = new URLSearchParams();
  params.append('username', formData.get('username') as string);
  params.append('password', formData.get('password') as string);

  const response = await api.post('/auth/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  // Save token for future requests
  if (response.data.access_token) {
    // 1. Store the Token
    localStorage.setItem('token', response.data.access_token);
    
    // 2. Store the User ID (Essential for Chat)
    // We convert it to a string because localStorage only stores strings
    if (response.data.user_id) {
        localStorage.setItem('userId', response.data.user_id.toString());
    }

    // 3. Store the Username (Optional, but good for UI welcome messages)
    if (response.data.username) {
        localStorage.setItem('username', response.data.username);
    }
  }
  
  return response.data;
};

export const registerUser = async (data: any) => {
  // The backend expects specific JSON structure defined in CreateUserRequest
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password
  };

  // POST to /auth/ (the create_user endpoint)
  const response = await api.post('/auth/', payload);
  return response.data;
};

export const getUserPublicProfile = async (userId: number) => {
  const response = await api.get(`/auth/user/${userId}`);
  return response.data;
};