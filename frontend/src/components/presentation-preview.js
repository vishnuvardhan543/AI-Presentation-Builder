import { Card, CardContent } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";

export function PresentationPreview() {
  return (
    <div className="space-y-8">
      {/* Title Slide Preview */}
      <div className="aspect-video bg-white rounded-lg shadow-lg p-8">
        <div className="h-full flex flex-col items-center justify-center space-y-6">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>

      {/* Content Slides Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Content Slide */}
        <div className="aspect-video bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Image and Text Slide */}
        <div className="aspect-video bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </div>

        {/* Chart Slide */}
        <div className="aspect-video bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="h-[calc(100%-2rem)] grid place-items-center">
              <Skeleton className="w-full h-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Bullet Points Slide */}
        <div className="aspect-video bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-200" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
