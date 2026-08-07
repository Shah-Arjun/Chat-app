import {create} from "zustand"
import axiosInstance from "../libs/axios"
import toast from "react-hot-toast"


// creates a global data store named useAuthStore
// create function returns a hook that can be used to access the store
export const useAuthStore = create((set) => ({
    // state variables
    authUser: null,
    isCheckingAuth: true,     // check auth status on app load
    isSigningUp: false,

    // state update functions
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
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
        } catch (error) {
            set({ isSigningUp: false })
            toast.error(error.response?.data?.message || "Error in signup")
        } finally {
            set({ isSigningUp: false })
        }
    }

}))