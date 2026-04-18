import { auth } from "./firebase";

const BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || "";

export const uploadImageToSecureBucket = async (file: File, token: string): Promise<string> => {
  // 1. Request signed URL from backend
  const res = await fetch(`${BASE_URL}/api/media/upload-url?content_type=${encodeURIComponent(file.type)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!res.ok) {
    throw new Error('Failed to acquire secure upload URL from backend');
  }
  
  const { upload_url, final_storage_path } = await res.json();

  // 2. Execute PUT request directly to Google Cloud Storage
  const uploadRes = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });

  if (!uploadRes.ok) {
    throw new Error('Direct upload to secure bucket rejected');
  }

  // 3. Return the string to be injected into the Pydantic Create payload
  return final_storage_path;
};


export async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  // 1. Await the absolute cryptographic truth from Firebase
  const user = auth.currentUser;
  let token = "";
  
  if (user) {
    // Force token refresh if necessary
    token = await user.getIdToken(); 
  }

  // 2. Inject the JWT into the headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 3. Execute the network request
  // Use relative endpoint if BASE_URL is empty, else combine them
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `API Execution failed: ${response.status}`);
  }

  return response.json();
}
