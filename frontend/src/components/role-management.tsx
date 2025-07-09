"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Shield, Plus, Edit, Trash2 } from "lucide-react"
import type { UserRole } from "@/app/page"

interface RoleManagementProps {
  userRoles: UserRole[]
  permissions: string[]
  onUpdateRole: (role: UserRole) => void
  onAddRole: (role: Omit<UserRole, "id">) => void
  onDeleteRole: (roleId: string) => void
}

export function RoleManagement({ userRoles, permissions, onUpdateRole, onAddRole, onDeleteRole }: RoleManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<UserRole | null>(null)
  const [deletingRole, setDeletingRole] = useState<UserRole | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
    })
  }

  const handleAddRole = () => {
    if (!formData.name.trim()) return

    onAddRole({
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions,
    })

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditRole = () => {
    if (!editingRole || !formData.name.trim()) return

    onUpdateRole({
      ...editingRole,
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions,
    })

    resetForm()
    setEditingRole(null)
  }

  const openEditDialog = (role: UserRole) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    })
  }

  const handleDeleteRole = () => {
    if (!deletingRole) return
    onDeleteRole(deletingRole.id)
    setDeletingRole(null)
  }

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const formatPermissionName = (permission: string) => {
    return permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {formatPermissionName(permission)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole} disabled={!formData.name.trim()}>
                  Add Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userRoles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-none mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    {role.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(role)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingRole(role)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Permissions ({role.permissions.length})</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {formatPermissionName(permission)}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {userRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No roles found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first role</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name *</Label>
              <Input
                id="edit-role-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${permission}`}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <Label htmlFor={`edit-${permission}`} className="text-sm">
                      {formatPermissionName(permission)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole} disabled={!formData.name.trim()}>
                Update Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role <strong>{deletingRole?.name}</strong>{" "}
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
