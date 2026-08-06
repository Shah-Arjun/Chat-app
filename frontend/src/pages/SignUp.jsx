import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: ""});
  const { signup, isSigningUp } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-slate-400">Join chat-app and start chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-slate-300">Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange}
              placeholder="John Doe"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            disabled={isSigningUp}
            className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSigningUp ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?
          <a href="/login" className="text-cyan-400 cursor-pointer hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
