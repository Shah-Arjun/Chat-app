import { useAuthStore } from "../store/useAuthStore"

function ChatPage() {
  const { logout } = useAuthStore()
  return (
    <div>
      <button onClick={logout} className="btn btn-secondary">Logout</button>
    </div>
  )
}

export default ChatPage