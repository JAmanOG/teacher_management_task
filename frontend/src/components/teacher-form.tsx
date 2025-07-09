"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Teacher, UserRole } from "@/app/page"

const teacherSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  subject: z.string().min(1, "Please select a subject"),
  status: z.enum(["Active", "Inactive"]),
  role: z.string().min(1, "Please select a role"),
  assignedClasses: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>

interface TeacherFormProps {
  initialData?: Teacher
  onSubmit: (data: Omit<Teacher, "id">) => void
  onCancel: () => void
  isLoading: boolean
  subjects: string[]
  roles: string[]
  userRoles: UserRole[]
  canManageRoles: boolean
}

export function TeacherForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  subjects,
  roles,
  userRoles,
  canManageRoles,
}: TeacherFormProps) {
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
      subject: initialData?.subject || "",
      status: initialData?.status || "Active",
      role: initialData?.role || "Teacher",
      assignedClasses: initialData?.assignedClasses || [],
      permissions: initialData?.permissions || [],
    },
  })

  const selectedRole = form.watch("role")
  const selectedUserRole = userRoles.find((r) => r.name === selectedRole)

  const handleSubmit = (data: TeacherFormData) => {
    // Auto-assign permissions based on role if role management is enabled
    const rolePermissions = selectedUserRole?.permissions || []

    onSubmit({
      ...data,
      role: data.role as Teacher["role"],
      avatar: initialData?.avatar,
      joinDate: initialData?.joinDate,
      permissions: canManageRoles ? data.permissions : rolePermissions,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {selectedUserRole && <FormDescription>{selectedUserRole.description}</FormDescription>}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Status *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Active" id="active" />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Inactive" id="inactive" />
                      <Label htmlFor="inactive">Inactive</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {canManageRoles && selectedUserRole && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedUserRole.permissions.map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem key={permission} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value ?? []), permission])
                                        : field.onChange(field.value?.filter((value) => value !== permission))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Teacher" : "Add Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
