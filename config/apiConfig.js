const apiConfig = {
  development: {
    apiUrl: "https://ebc3b0c55b1a.ngrok-free.app",
  },
  production: {
    apiUrl: "YOUR_PRODUCTION_API_URL", // Replace with your production API URL
  },
};

const environment = process.env.NODE_ENV || "development"; // Default to development if NODE_ENV is not set
const config = apiConfig[environment];

export default config;
