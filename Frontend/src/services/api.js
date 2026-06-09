import axios from 'axios';
import { isDemoMode, handleDemoRequest } from './demoStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api` 
        : '/api',
});

api.interceptors.request.use(
    (config) => {
        if (isDemoMode()) {
            config.adapter = async (cfg) => {
                try {
                    const { data, status } = handleDemoRequest(cfg);
                    return {
                        data,
                        status,
                        statusText: 'OK',
                        headers: {},
                        config: cfg,
                    };
                } catch (error) {
                    return Promise.reject(error);
                }
            };
            return config;
        }

        const token = localStorage.getItem('Pulse_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;