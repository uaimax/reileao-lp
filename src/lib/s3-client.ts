import { getEventConfig } from './api';

// Upload file to S3 via API
export const uploadToS3 = async (file: File, folder: string = ''): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Failed to upload to S3:', error);
    return null;
  }
};

// Delete file from S3 (placeholder for future implementation)
export const deleteFromS3 = async (url: string): Promise<boolean> => {
  // TODO: Implement delete via API endpoint
  console.log('Delete not implemented yet:', url);
  return false;
};

// Get S3 configuration status
export const getS3Status = async () => {
  try {
    const eventConfig = await getEventConfig();
    return {
      enabled: eventConfig?.s3Enabled || false,
      configured: !!(eventConfig?.s3Endpoint && eventConfig?.s3AccessKey && eventConfig?.s3SecretKey && eventConfig?.s3BucketName)
    };
  } catch (error) {
    return { enabled: false, configured: false };
  }
};