"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, X } from "lucide-react"

interface BulkActionsBarProps {
  selectedCount: number
  onBulkDelete: () => void
  onClearSelection: () => void
  isLoading: boolean
}

export function BulkActionsBar({ selectedCount, onBulkDelete, onClearSelection, isLoading }: BulkActionsBarProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {selectedCount} teacher{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Clear Selection
        </Button>
      </div>
    </Card>
  )
}
