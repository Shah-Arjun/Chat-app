import {create} from "zustand"

export const useAuthStore = create((set) => ({
    authUser: { name: "jhon", _id: 123, age: 25},
    isLoading: false,

    //function
    login: () => {
        console.log("We just logged in.")
    }
}))