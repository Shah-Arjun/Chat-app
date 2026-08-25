import axios from "axios"

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "https://chat-app-hbfp.onrender.com/api",
    withCredentials: true,
})

export default axiosInstance