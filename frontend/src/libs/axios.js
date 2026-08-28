import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "https://chat-app-hbfp.onrender.com/api");

const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

export default axiosInstance;