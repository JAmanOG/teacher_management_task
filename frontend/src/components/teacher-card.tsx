"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Edit, Trash2, Eye, Phone, Mail, Users } from "lucide-react"
import type { Teacher } from "@/app/page"

interface TeacherCardProps {
  teacher: Teacher
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
  onView: () => void
  isLoading: boolean
  canEdit: boolean
  canDelete: boolean
}

export function TeacherCard({
  teacher,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  isLoading,
  canEdit,
  canDelete,
}: TeacherCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} aria-label={`Select ${teacher.fullName}`} />
            <Avatar className="h-12 w-12">
              <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.fullName} />
              <AvatarFallback>{getInitials(teacher.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg leading-none">{teacher.fullName}</h3>
              <p className="text-sm text-muted-foreground mt-1">{teacher.subject}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {teacher.role}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={onToggleStatus}>
                  <Users className="h-4 w-4 mr-2" />
                  {teacher.status === "Active" ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
            {teacher.assignedClasses && teacher.assignedClasses.length > 0 && (
              <span className="text-xs text-muted-foreground">{teacher.assignedClasses.length} classes</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-3 w-3 mr-2" />
              <span className="truncate">{teacher.email}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-3 w-3 mr-2" />
              <span>{teacher.phoneNumber}</span>
            </div>
          </div>

          {teacher.assignedClasses && teacher.assignedClasses.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Assigned Classes:</p>
              <div className="flex flex-wrap gap-1">
                {teacher.assignedClasses.slice(0, 2).map((className, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {className}
                  </Badge>
                ))}
                {teacher.assignedClasses.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{teacher.assignedClasses.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
