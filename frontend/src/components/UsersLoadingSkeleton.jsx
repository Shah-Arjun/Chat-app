function UsersLoadingSkeleton() {
  return (
    <div className="space-y-1 p-1">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl"
        >
          {/* Avatar skeleton */}
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full skeleton-shimmer shrink-0" />

          {/* Text lines */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3.5 skeleton-shimmer rounded-full w-2/3" />
            <div className="h-2.5 skeleton-shimmer rounded-full w-1/2 opacity-70" />
          </div>

          {/* Status pill skeleton */}
          <div className="h-4 w-10 skeleton-shimmer rounded-full shrink-0 opacity-60" />
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;