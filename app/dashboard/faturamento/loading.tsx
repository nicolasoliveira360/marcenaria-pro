"use client"

import { Loader2 } from "lucide-react"

export default function LoadingPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-6 container py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-72 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Skeleton do plano atual */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex flex-col gap-2">
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton das opções de plano */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-4 animate-pulse">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-14 bg-gray-100 rounded-lg"></div>
                  <div className="flex justify-center">
                    <div className="h-9 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 