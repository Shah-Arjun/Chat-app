function MessagesLoadingSkeleton() {
  const items = [
    { side: "start", width: "w-44" },
    { side: "end",   width: "w-56" },
    { side: "start", width: "w-36" },
    { side: "end",   width: "w-64" },
    { side: "start", width: "w-48" },
    { side: "end",   width: "w-40" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 py-2">
      {items.map(({ side, width }, index) => (
        <div
          key={index}
          className={`flex items-end gap-2 ${side === "end" ? "flex-row-reverse" : "flex-row"}`}
        >
          {/* Avatar */}
          <div className="h-7 w-7 rounded-full skeleton-shimmer shrink-0 mb-0.5" />

          {/* Bubble */}
          <div className={`${width} max-w-[72%]`}>
            <div
              className={`
                h-10 skeleton-shimmer rounded-2xl
                ${side === "end" ? "rounded-br-sm" : "rounded-bl-sm"}
              `}
            />
            {/* Timestamp hint */}
            <div className={`mt-1 h-2 w-10 skeleton-shimmer rounded-full opacity-50
                             ${side === "end" ? "ml-auto" : ""}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
export default MessagesLoadingSkeleton;