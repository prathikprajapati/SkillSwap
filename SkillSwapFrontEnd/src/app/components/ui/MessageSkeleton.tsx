import React from "react";

export const MessageSkeleton = () => (
  <div className="h-[calc(100vh-4rem)] bg-background">
    <div className="container mx-auto px-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 h-full py-4">
        {/* Conversations List Skeleton */}
        <div className="hidden md:block md:col-span-1 border rounded-xl bg-card overflow-hidden">
          <div className="p-4 border-b">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-8rem)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="w-full p-4 border-b animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area Skeleton */}
        <div className="md:col-span-2 border rounded-xl bg-card flex flex-col overflow-hidden">
          {/* Chat Header Skeleton */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded mb-1 w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Messages Skeleton */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className={`max-w-[70%] ${index % 2 === 0 ? "order-1" : "order-2"}`}>
                  <div className="p-3 rounded-lg bg-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Skeleton */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MessageSkeleton;
