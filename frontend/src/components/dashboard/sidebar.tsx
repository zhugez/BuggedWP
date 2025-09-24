'use client'

import { UploadSection } from '@/components/upload/upload-section'
import { FilterSection } from './filter-section'
import { StatsSection } from './stats-section'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-6">
        {/* Upload Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Upload
          </h3>
          <UploadSection />
        </div>

        <Separator />

        {/* Statistics Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Scan Summary
          </h3>
          <StatsSection />
        </div>

        <Separator />

        {/* Filter Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Filters
          </h3>
          <FilterSection />
        </div>
      </div>
    </div>
  )
}