"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, Trash2, Mail, Phone, Calendar, Users, BookOpen, Shield } from "lucide-react"
import type { Teacher } from "@/app/page"

interface TeacherDetailsModalProps {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
  canDelete: boolean
}

export function TeacherDetailsModal({
  teacher,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: TeacherDetailsModalProps) {
  if (!teacher) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.fullName} />
              <AvatarFallback className="text-lg">{getInitials(teacher.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{teacher.fullName}</h2>
              <p className="text-lg text-muted-foreground">{teacher.subject}</p>
              <div className="mt-2">
                <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              {canEdit && (
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{teacher.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Subject</p>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{teacher.role}</p>
                </div>
              </div>
              {teacher.joinDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Join Date</p>
                    <p className="text-sm text-muted-foreground">{new Date(teacher.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Classes */}
          {teacher.assignedClasses && teacher.assignedClasses.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Assigned Classes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacher.assignedClasses.map((className, index) => (
                    <Badge key={index} variant="outline">
                      {className}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          {teacher.permissions && teacher.permissions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Permissions</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teacher.permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary">
                      {permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
