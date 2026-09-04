import { useState } from "react";
import { Eye, EyeOff, Loader2, MessageCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { Link } from "react-router";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row min-h-[520px] md:min-h-[600px]">

            {/* ── Left: Form ── */}
            <div className="flex-1 md:max-w-md p-6 sm:p-10 flex flex-col justify-center
                            md:border-r border-slate-700/40">
              {/* Brand / Heading */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                                bg-gradient-to-br from-cyan-500/20 to-blue-500/15
                                border border-cyan-500/25 shadow-lg shadow-cyan-500/10 mb-4">
                  <MessageCircle className="w-7 h-7 text-cyan-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-100 mb-1.5">Welcome Back</h1>
                <p className="text-sm text-slate-400">Sign in to continue to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="auth-label">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="auth-input"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="auth-label">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="auth-input pr-11"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-eye-button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button disabled={isLoggingIn} className="auth-btn mt-2">
                  {isLoggingIn ? (
                    <><Loader2 className="animate-spin" size={18} /> Logging In…</>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/signup" className="auth-link">
                  Don't have an account?{" "}
                  <span className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                    Sign Up
                  </span>
                </Link>
              </div>
            </div>

            {/* ── Right: Illustration ── */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8
                            bg-gradient-to-bl from-slate-800/30 to-transparent">
              <img
                src="/login.png"
                alt="People connecting on mobile"
                className="w-full max-w-xs h-auto object-contain drop-shadow-xl"
              />
              <div className="mt-8 text-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400
                               bg-clip-text text-transparent mb-4">
                  Connect anytime, anywhere
                </h3>
                <div className="flex justify-center gap-3 flex-wrap">
                  <span className="auth-badge">Free</span>
                  <span className="auth-badge">Easy Setup</span>
                  <span className="auth-badge">Private</span>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default Login;
