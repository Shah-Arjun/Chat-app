import TypingIndicator from "./TypingIndicator";

/**
 * SidebarUserItem
 * Reusable sidebar row used by both ChatList and ContactList.
 *
 * @param {object}   user        - User object { _id, fullName, profilePic }
 * @param {boolean}  isSelected  - Whether this item is the active conversation
 * @param {boolean}  isOnline    - Whether the user is currently online
 * @param {boolean}  [isTyping]  - Whether the user is currently typing (chat list only)
 * @param {string}   [subText]   - Secondary line of text below the name
 * @param {function} onClick     - Click handler
 */
function SidebarUserItem({ user, isSelected, isOnline, isTyping = false, subText = "", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sidebar-item p-2.5 sm:p-3 group ${isSelected ? "sidebar-item-active" : "sidebar-item-inactive"}`}
      aria-label={`Open conversation with ${user.fullName}`}
      aria-current={isSelected ? "true" : undefined}
    >
      {/* Active left accent bar */}
      {isSelected && (
        <span
          className="absolute left-0 top-2.5 bottom-2.5 w-[3px]
                     bg-cyan-400 rounded-r-full shadow-glow-bar"
        />
      )}

      {/* Avatar + online badge */}
      <div className="relative shrink-0">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.fullName}
          className={`
            h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover
            border-2 shadow-sm transition-all duration-200
            ${isSelected
              ? "border-cyan-500/50"
              : "border-slate-700/60 group-hover:border-slate-600/80"
            }
          `}
          loading="lazy"
        />
        <span
          className={`
            absolute bottom-0 right-0 h-3 w-3 rounded-full
            border-2 border-slate-900 shadow-sm
            ${isOnline ? "bg-emerald-500 animate-pulse-dot" : "bg-slate-600"}
          `}
          title={isOnline ? "Online" : "Offline"}
        />
      </div>

      {/* Name + status */}
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3
            className={`font-semibold text-sm truncate leading-tight ${
              isSelected ? "text-cyan-200" : "text-slate-100"
            }`}
          >
            {user.fullName}
          </h3>

          {/* Online/Offline pill */}
          {isOnline ? (
            <span className="shrink-0 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-1.5 py-px leading-none">
              Active
            </span>
          ) : (
            <span className="shrink-0 text-[10px] font-medium text-slate-500">
              Offline
            </span>
          )}
        </div>

        {/* Sub-text — typing indicator or fallback hint */}
        <div className="text-xs text-slate-400 truncate">
          {isTyping ? (
            <span className="text-cyan-400 font-medium flex items-center gap-1.5">
              <TypingIndicator />
              typing
            </span>
          ) : (
            <span className="opacity-60">{subText}</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default SidebarUserItem;
