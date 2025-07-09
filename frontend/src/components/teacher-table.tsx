"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { MoreVertical, Edit, Trash2, Eye, Users } from "lucide-react"
import type { Teacher } from "@/app/page"

interface TeacherTableProps {
  teachers: Teacher[]
  selectedTeachers: string[]
  onSelectTeacher: (teacherId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onEdit: (teacher: Teacher) => void
  onDelete: (teacher: Teacher) => void
  onToggleStatus: (teacher: Teacher) => void
  onView: (teacher: Teacher) => void
  isLoading: boolean
  canEdit: boolean
  canDelete: boolean
}

export function TeacherTable({
  teachers,
  selectedTeachers,
  onSelectTeacher,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  isLoading,
  canEdit,
  canDelete,
}: TeacherTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const allSelected = teachers.length > 0 && selectedTeachers.length === teachers.length
  const someSelected = selectedTeachers.length > 0 && selectedTeachers.length < teachers.length

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el && "indeterminate" in el) (el as HTMLInputElement).indeterminate = someSelected
                }}
                onCheckedChange={onSelectAll}
                aria-label="Select all teachers"
              />
            </TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTeachers.includes(teacher.id)}
                  onCheckedChange={(checked) => onSelectTeacher(teacher.id, !!checked)}
                  aria-label={`Select ${teacher.fullName}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.fullName} />
                    <AvatarFallback className="text-xs">{getInitials(teacher.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{teacher.fullName}</div>
                    <div className="text-sm text-muted-foreground">{teacher.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{teacher.subject}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{teacher.phoneNumber}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{teacher.role}</Badge>
              </TableCell>
              <TableCell>
                {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {teacher.assignedClasses.slice(0, 2).map((className, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {className}
                      </Badge>
                    ))}
                    {teacher.assignedClasses.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{teacher.assignedClasses.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              <TableCell>{teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : "N/A"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(teacher)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(teacher)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onToggleStatus(teacher)}>
                      <Users className="h-4 w-4 mr-2" />
                      {teacher.status === "Active" ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canDelete && (
                      <DropdownMenuItem onClick={() => onDelete(teacher)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
