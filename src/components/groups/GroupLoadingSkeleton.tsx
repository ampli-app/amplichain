
import { Skeleton } from "@/components/ui/skeleton";

export function GroupLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded max-w-lg mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-xl overflow-hidden">
            <div className="aspect-[16/9] bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="pt-2 space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
