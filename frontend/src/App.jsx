import { Route, Routes } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f]">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07111f] via-[#0b1328] to-[#040814]" />

      {/* Glass Aurora */}
      <div className="absolute -top-52 -left-52 h-[650px] w-[650px] rounded-full bg-cyan-500/20 blur-[150px]" />
      <div className="absolute top-1/3 -right-40 h-[550px] w-[550px] rounded-full bg-blue-500/20 blur-[150px]" />
      <div className="absolute bottom-[-250px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[180px]" />

      {/* Light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_55%)]" />
      {/* Glass Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.5) 0.5px, transparent 0.5px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Page */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-5">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;