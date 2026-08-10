
import { useEffect } from "react"
import { useChatStore } from "../store/useChatStore"
import UsersLoadingSkeleton from "./UsersLoadingSkeleton"

function ContactList() {
  const { allContacts, getAllContacts, isUsersLoading, setSelectedUser } = useChatStore()

  useEffect(() => {
    getAllContacts()
  }, [getAllContacts])

  if (isUsersLoading) return <UsersLoadingSkeleton />

  return (
    <>
      {allContacts.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm">
          No contacts found
        </div>
      ) : (
        allContacts.map((contact) => (
          <div
            key={contact._id}
            onClick={() => setSelectedUser(contact)}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* TODO: fix this online status and make it work with socket.io */}
              <div className="avatar online">
                <div className="size-12 rounded-full">
                  <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">{contact.fullName}</h4>
            </div>
          </div>
        ))
      )}
    </>
  )
}

export default ContactList