/**
 * EmptyState
 * Generic centered empty-state layout: icon + title + description + optional CTA.
 *
 * @param {React.ReactNode} icon        - Icon element (e.g. a Lucide icon component)
 * @param {string}          title       - Bold heading text
 * @param {string}          description - Secondary helper text
 * @param {string}          [ctaLabel]  - Label for the optional action button
 * @param {function}        [onCta]     - Click handler for the action button
 * @param {React.ReactNode} [children]  - Optional extra content rendered below description
 * @param {string}          [className] - Extra wrapper classes
 */
function EmptyState({ icon, title, description, ctaLabel, onCta, children, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in ${className}`}
    >
      {/* Icon container */}
      {icon && (
        <div className="relative mb-4">
          <div
            className="w-16 h-16 bg-gradient-to-br from-cyan-500/15 to-blue-500/10
                        border border-cyan-500/20 rounded-3xl
                        flex items-center justify-center shadow-lg shadow-cyan-500/5"
          >
            {icon}
          </div>
          {/* Decorative outer ring */}
          <div className="absolute inset-0 rounded-3xl border border-cyan-500/10 scale-110 opacity-50 pointer-events-none" />
        </div>
      )}

      <h4 className="text-slate-200 font-semibold text-[15px] mb-1.5">{title}</h4>

      {description && (
        <p className="text-slate-500 text-xs sm:text-sm max-w-[220px] mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {children}

      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="px-4 py-2 text-xs font-semibold text-cyan-300
                     bg-cyan-500/10 hover:bg-cyan-500/20
                     border border-cyan-500/20 hover:border-cyan-500/35
                     rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
