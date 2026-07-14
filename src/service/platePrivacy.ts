import axios from "axios";

// Proxied through /api/blur-plate (Vercel serverless function) so the browser
// never talks to the third-party API directly - avoids CORS on the source
// image fetch and keeps the API key server-side only.
export const hideCarPlate = async (imageUrl: string): Promise<string> => {
  const res = await axios.post(
    "/api/blur-plate",
    { imageUrl },
    { responseType: "blob" }
  );

  return window.URL.createObjectURL(res.data as Blob);
};
