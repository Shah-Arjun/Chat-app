import {create} from "zustand"
import axiosInstance from "../libs/axios"
import toast from "react-hot-toast"
import { io } from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://chat-app-hbfp.onrender.com"

// creates a global data store named useAuthStore
// create function returns a hook that can be used to access the store
export const useAuthStore = create((set, get) => ({
    // state variables
    authUser: null,
    isCheckingAuth: true,     // check auth status on app load
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    socket: null,            // stores socket instance/connection
    onlineUsers: [],         // stoes online users ids received from server

    // state update functions
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
            get().connectSocket()  // connect socket after successful auth check
        } catch (error) {
            console.log("Error in checkAuth", error)
            set({ authUser: null, isCheckingAuth: false})
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        try {
            set({ isSigningUp: true })
            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data, isSigningUp: false })
            toast.success("Account created successfully!")
            get().connectSocket()  // connect socket after successful signup
        } catch (error) {
            set({ isSigningUp: false })
            toast.error(error.response?.data?.message || "Error in signup")
        } finally {
            set({ isSigningUp: false })
        }
    },

    login: async (data) => {
        try {
            set({ isLoggingIn: true })
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data, isLoggingIn: false })
            toast.success("Login successful!")
            get().connectSocket()  // connect socket after successful login
        } catch (error) {
            set({ isLoggingIn: false })
            toast.error(error.response?.data?.message || "Error in login")
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        try {
            const res = await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            toast.success(res.data.message || "Logout successful!")
            get().disconnectSocket()  // disconnect socket after logout
        } catch (error) {
            toast.error("Error in logout")
            console.log("Error in logout", error)
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const res = await axiosInstance.put("/auth/update-profile", data)
            set({ authUser: res.data, isUpdatingProfile: false })
            toast.success("Profile updated successfully!")
        } catch (error) {
            set({ isUpdatingProfile: false })
            toast.error("Error in updating profile")
            console.log("Error in updateProfile", error)
        } finally {
            set({ isUpdatingProfile: false })
        }
    },


    // this function connects the authenticated frontend user to the socket.io server
    connectSocket: () => {
        const {authUser} = get()                             // get the current authenticated user from the store (from authUser state variable)
        if(!authUser || get().socket?.connected) return     // if not authenticated user or socket is already connected, do nothing (dont connect socket again)

        const socket = io(BASE_URL, {       // creates socket connection,  connect to the server using socket.io
            withCredentials: true,
        })

        socket.connect()                // starts socket connection

        set({ socket: socket })         // update the socket state variable in the store with the connected socket instance

        // listen to online users event from server
        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds })
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect()
    },
}))