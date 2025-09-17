import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users,
  Edit,
  ToggleLeft,
  ToggleRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"]
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!response.ok) throw new Error("Failed to update user role");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Failed to update user role", variant: "destructive" });
    }
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error("Failed to update user status");
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Failed to update user status", variant: "destructive" });
    }
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = (newRole: string) => {
    if (editingUser) {
      updateRoleMutation.mutate({ userId: editingUser.id, role: newRole });
    }
  };

  const handleToggleStatus = (user: User) => {
    updateStatusMutation.mutate({ userId: user.id, isActive: !user.isActive });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500 hover:bg-purple-600";
      case "property_owner": return "bg-blue-500 hover:bg-blue-600";
      case "customer": return "bg-gray-500 hover:bg-gray-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-users">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total Users:</span>
          <Badge variant="secondary">{users.length}</Badge>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? users.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user.fullName || user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${getRoleColor(user.role)} text-white border-0`}
                        data-testid={`badge-role-${user.role}`}
                      >
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.isActive ? "default" : "secondary"}
                        className={user.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          data-testid={`button-edit-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "default"}
                          onClick={() => handleToggleStatus(user)}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-toggle-${user.id}`}
                        >
                          {user.isActive ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="edit-user-dialog">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Update the role for {editingUser?.fullName || editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select 
                  defaultValue={editingUser.role} 
                  onValueChange={handleUpdateRole}
                  data-testid="select-user-role"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="property_owner">Property Owner</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Current Details:</strong>
                  <div className="mt-2 space-y-1">
                    <div>Email: {editingUser.email}</div>
                    <div>Username: {editingUser.username}</div>
                    <div>Status: {editingUser.isActive ? "Active" : "Inactive"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}