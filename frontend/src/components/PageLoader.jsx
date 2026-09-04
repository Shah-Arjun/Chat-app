import { Loader2, MessageCircle } from 'lucide-react';

function PageLoader() {    
  return (
    <div className="flex flex-col items-center justify-center h-dvh w-full bg-[#07111f] text-slate-100 gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
        <span>Loading PulseChat...</span>
      </div>
    </div>
  );
}

export default PageLoader;