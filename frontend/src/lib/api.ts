export const uploadImageToSecureBucket = async (file: File, token: string): Promise<string> => {
  // 1. Request signed URL from backend
  const res = await fetch(`/api/media/upload-url?content_type=${encodeURIComponent(file.type)}`, {
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
