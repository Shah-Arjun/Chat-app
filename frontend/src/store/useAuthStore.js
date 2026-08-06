import {create} from "zustand"
import axiosInstance from "../libs/axios"


// creates a global data store named useAuthStore
// create function returns a hook that can be used to access the store
export const useAuthStore = create((set) => ({
    // state variables
    authUser: null,
    isCheckingAuth: true,   // check auth status on app load

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
    }

}))