import axios from "axios"

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "https://chat-app-hbfp.onrender.com/api",
    withCredentials: true,
})

export default axiosInstance