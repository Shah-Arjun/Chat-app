/**
 * TypingIndicator
 * Renders three animated bouncing dots used to indicate someone is typing.
 *
 * @param {string} [className] - Optional extra classes on the wrapper
 */
function TypingIndicator({ className = "" }) {
  return (
    <span className={`flex gap-0.5 items-center ${className}`}>
      <span className="typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="typing-dot" style={{ animationDelay: "160ms" }} />
      <span className="typing-dot" style={{ animationDelay: "320ms" }} />
    </span>
  );
}

export default TypingIndicator;
