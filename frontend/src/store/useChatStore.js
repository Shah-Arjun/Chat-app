import toast from "react-hot-toast"
import { create } from "zustand"
import axiosInstance from "../libs/axios"

// creates a global data store named useChatStore
export const useChatStore = create((set, get) => ({
    // state variables
    allContacts: [],   // array to hold all contacts fetched from the backend
    chats: [],         // array to hold all chats partners fetched from the backend
    messages: [],       // array to hold all messages fetched from the backend
    activeTab: "chats", // chats by default, can be "chats" or "contacts"
    selectedUser: null, // object to hold the selected user for chat
    isUsersLoading: false, 
    isMessagesLoading: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true, // boolean to enable or disable sound notifications


    // state update functions
    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled)  // change the value in localStorage
        set({ isSoundEnabled: !get().isSoundEnabled })  // update the state variable
    },       
    
    setActiveTab: (tab) => {
        set({ activeTab: tab })
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser: selectedUser })
    },

    getAllContacts: async () => {
        try {
            set({ isUsersLoading: true })
            const res = await axiosInstance.get("/messages/contacts")
            set({ allContacts: res.data })
        } catch (error) {
            console.log("Error in getAllContacts", error)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMyChatPartners: async () => {
        try {
            set({ isUsersLoading: true })
            const res = await axiosInstance.get("/messages/chats")
            set({ chats: res.data })
        } catch (error) {
            toast.error(error.response?.data?.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessagesByUserId: async (userId) => {
        try {
            set({ isMessagesLoading: true })
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data })
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        } finally {
            set({ isMessagesLoading: false })
        }
    }
}))