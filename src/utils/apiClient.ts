import axios from 'axios';
import { POKEAPI_BASE_URL } from '../config/constants';

const apiClient = axios.create({
  baseURL: POKEAPI_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logger.info(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`[API Error] ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      logger.error('[API Error] No response received from PokéAPI');
    } else {
      logger.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export { apiClient}