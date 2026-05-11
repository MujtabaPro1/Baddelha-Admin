export function dataURLToBlob(dataURL: any): Blob {
  // Validate input
  if (!dataURL || typeof dataURL !== 'string') {
    throw new Error('Invalid data URL: Input is empty or not a string');
  }
  
  if (!dataURL.includes(',')) {
    throw new Error('Invalid data URL format: Missing comma separator');
  }

  try {
    const parts = dataURL.split(",");
    const base64Data = parts[1];
    
    if (!base64Data) {
      throw new Error('Invalid data URL: No base64 data found');
    }
    
    // Extract MIME type with fallback
    let mimeString = 'image/jpeg'; // Default fallback
    try {
      const metaPart = parts[0];
      if (metaPart && metaPart.includes(':') && metaPart.includes(';')) {
        mimeString = metaPart.split(":")[1].split(";")[0] || 'image/jpeg';
      }
    } catch (mimeError) {
      console.warn('Could not parse MIME type, using default:', mimeError);
    }
    
    // Decode base64 with error handling
    let byteString: string;
    try {
      byteString = atob(base64Data);
    } catch (decodeError) {
      throw new Error('Failed to decode base64 data: Invalid base64 string');
    }
    
    if (byteString.length === 0) {
      throw new Error('Decoded data is empty');
    }

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  } catch (error: any) {
    console.error('dataURLToBlob error:', error);
    throw new Error(`Failed to convert image: ${error.message || 'Unknown error'}`);
  }
}
