import { useEffect } from "react"
import { useChatStore } from "../store/useChatStore"
import ChatHeader from "./ChatHeader"

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages } = useChatStore()

  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id)
    }
  }, [selectedUser, getMessagesByUserId])

  return (
    <>
     <ChatHeader />
    </>
  )
}

export default ChatContainer