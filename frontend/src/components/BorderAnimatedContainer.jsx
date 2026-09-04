function BorderAnimatedContainer({ children, className = "" }) {
  return (
    <div
      className={`
        w-full h-full
        [background:linear-gradient(45deg,#0c1427,#162035_50%,#0c1427)_padding-box,conic-gradient(from_var(--border-angle),rgba(51,65,85,0.4)_80%,rgba(6,182,212,0.9)_86%,rgba(103,232,249,1)_90%,rgba(6,182,212,0.9)_94%,rgba(51,65,85,0.4))_border-box]
        rounded-none sm:rounded-2xl
        border border-transparent
        animate-border
        shadow-2xl shadow-black/80
        flex overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;