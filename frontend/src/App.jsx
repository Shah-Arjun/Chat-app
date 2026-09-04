import { Route, Routes, Navigate } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ChatPage from "./pages/ChatPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";
import IncomingCall from "./components/IncomingCall";
import VideoCall from "./components/VideoCall";
import { useCallStore } from "./store/useCallStore";


function App() {
  const { checkAuth, isCheckingAuth, authUser, socket } = useAuthStore();
  const initializeCallSocket = useCallStore((state) => state.initializeSocket);

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    initializeCallSocket(socket);
  }, [socket, initializeCallSocket])

  if(isCheckingAuth) return <PageLoader />

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#070e1c] flex flex-col justify-center items-center">
      {/* Crisp Dark Background with subtle mesh lines */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#070e1c] via-[#091326] to-[#040812]" />

      {/* Subtle non-blurry ambient radial glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-600/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/10" />

      {/* Crisp subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Main App Container */}
      <main className="relative z-10 h-full w-full flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={ authUser ? <ChatPage /> : <Navigate to="/login" /> } />
          <Route path="/login" element={ !authUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={ !authUser ? <SignUp /> : <Navigate to="/" /> } />
        </Routes>
      </main>

      {/* Global Overlays (Toaster, IncomingCall modal, Active Call modal) */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      <IncomingCall />
      <VideoCall />
    </div>
  );
}

export default App;