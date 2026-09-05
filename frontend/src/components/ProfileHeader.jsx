import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState, useRef } from "react";
import { LogOutIcon, Volume2Icon, VolumeXIcon, Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";


function ProfileHeader() {
  const { authUser, updateProfile, isUpdatingProfile, logout } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const fileInputRef = useRef(null);
  // Lazy-init the click sound scoped to this component
  const clickSoundRef = useRef(null);
  const getClickSound = () => {
    if (!clickSoundRef.current) {
      clickSoundRef.current = new Audio("/sounds/mouse-click.mp3");
    }
    return clickSoundRef.current;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Img = reader.result;
      setSelectedImg(base64Img);
      await updateProfile({ profilePic: base64Img });
    };
    reader.readAsDataURL(file);
  };

  const handleSoundToggle = () => {
    const sound = getClickSound();
    sound.currentTime = 0;
    sound.play().catch(() => {});
    // toggleSound uses functional updater, so we read the *current* store value
    // after the toggle to show the correct toast message.
    const willBeEnabled = !isSoundEnabled;
    toggleSound();
    toast.success(willBeEnabled ? "Sound notifications enabled" : "Sound notifications disabled", {
      icon: willBeEnabled ? "🔔" : "🔇",
      duration: 1500,
    });
  };

  // Initials fallback
  const initials = authUser?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="shrink-0 px-3 py-3 sm:px-4 sm:py-4 border-b border-slate-800 bg-[#0e1628]">
      <div className="flex items-center justify-between gap-3">

        {/* ── Avatar + User Info ── */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative group shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdatingProfile}
              className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden
                         border-2 border-cyan-500/40 hover:border-cyan-400/80
                         transition-all duration-200 focus:outline-none
                         ring-2 ring-cyan-500/10 hover:ring-cyan-500/25
                         shadow-md hover:shadow-glow-cyan"
              title="Click to change avatar"
              aria-label="Change profile picture"
            >
              {(selectedImg || authUser?.profilePic) ? (
                <img
                  src={selectedImg || authUser?.profilePic}
                  alt={authUser?.fullName || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="h-full w-full flex items-center justify-center
                                 bg-gradient-to-br from-cyan-500 to-blue-600
                                 text-white font-bold text-sm">
                  {initials}
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100
                              flex items-center justify-center transition-opacity duration-200">
                {isUpdatingProfile
                  ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                  : <Camera className="h-4 w-4 text-white" />
                }
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Online Badge */}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full
                             bg-emerald-500 border-2 border-slate-900 shadow-sm
                             animate-pulse-dot" />
          </div>

          <div className="min-w-0">
            <h2 className="text-slate-100 font-semibold text-sm sm:text-[15px] leading-tight truncate">
              {authUser?.fullName}
            </h2>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <span>Online</span>
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className={`icon-btn h-9 w-9 ${
              isSoundEnabled
                ? "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50"
            }`}
            title={isSoundEnabled ? "Sound enabled" : "Sound muted"}
            aria-label="Toggle sound notifications"
          >
            {isSoundEnabled
              ? <Volume2Icon className="h-4 w-4" />
              : <VolumeXIcon className="h-4 w-4" />
            }
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="icon-btn h-9 w-9 text-slate-400 hover:text-rose-400
                       hover:bg-rose-500/10 border border-transparent
                       hover:border-rose-500/20"
            title="Log out"
            aria-label="Log out"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;