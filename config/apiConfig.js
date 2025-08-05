const apiConfig = {
  development: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "YOUR_PRODUCTION_API_URL", // Replace with your production API URL
  },
};

const environment = process.env.NODE_ENV || "development"; // Default to development if NODE_ENV is not set
const config = apiConfig[environment];

export default config;
