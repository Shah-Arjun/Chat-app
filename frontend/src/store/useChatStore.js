import toast from "react-hot-toast"
import { create } from "zustand"
import axiosInstance from "../libs/axios"
import { useAuthStore } from "./useAuthStore"


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
    isDeletingSelectedMessages: false,
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true, // boolean to enable or disable sound notifications
    selectedMessages: [], // array to hold the ids of selected messages for deletion


    // state update functions
    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled)  // change the value in localStorage
        set({ isSoundEnabled: !get().isSoundEnabled })  // update the state variable
    },       
    
    setActiveTab: (tab) => {
        set({ activeTab: tab })
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser: selectedUser, selectedMessages: [] })
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
            set({ messages: res.data, selectedMessages: [] })
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (msgData) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, msgData)
            set({ messages: messages.concat(res.data) })  // append the new message to the existing messages
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    },

    // listen to new incoming messages in real-time
    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get()
        if(!selectedUser) return

        const socket = useAuthStore.getState().socket

        // listen to new incoming messages in real-time
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
            if(!isMessageSentFromSelectedUser) return 

            const currentMessages = get().messages
            set({ messages: [...currentMessages, newMessage] })
            
            if(isSoundEnabled) {
                const notificationSound = new Audio("/sounds/notification.mp3")
                notificationSound.currentTime = 0
                notificationSound.play().catch((e) => console.log("Sound play failed.", e))
            }
        })


        // listen to message deletion events in real-time
        socket.on("messagesDeleted", ({ messageIds }) => {
            set((state) => ({
                messages: state.messages.filter(
                (message) => !messageIds.includes(message._id)
                ),
                selectedMessages: state.selectedMessages.filter((id) => !messageIds.includes(id)),
            }));
        });
    },


    // unsubscribe from new incoming messages when the component unmounts or selectedUser changes
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage", )

        socket.off("messagesDeleted");

    },


    deleteSelectedMessages: async () => {
        const { selectedMessages } = get();
        if (selectedMessages.length === 0) return;

        try {
            set({ isDeletingSelectedMessages: true })

            await axiosInstance.delete("/messages", {
                data: { messageIds: selectedMessages}
            });

            set((state) => ({
                messages: state.messages.filter((message) => !selectedMessages.includes(message._id)
            ), selectedMessages: [],
            }));

            toast.success("Messages deleted successfully");
        } catch (error) {
            toast.error(
            error.response?.data?.message || "Failed to delete messages"
            );
        } finally {
            set({ isDeletingSelectedMessages: false })
        }
    },

    toggleMessageSelection: (messageId) => {
        set((state) => {
            const isAlreadySelected = state.selectedMessages.includes(messageId)
            return {
                selectedMessages: isAlreadySelected
                    ? state.selectedMessages.filter((id) => id !== messageId)
                    : [...state.selectedMessages, messageId],
            }
        })
    },

    clearSelectedMessages: () => {
        set({ selectedMessages: [] })
    },


}))