import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Loader2, Users } from 'lucide-react';
import { UserService } from '../services/UserService';
import { User, UserProfile } from '../contexts/AuthContext'; // Import User and UserProfile

interface UserManagementProps {}

const UserManagement: React.FC<UserManagementProps> = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<(User & UserProfile)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [currentEditingUser, setCurrentEditingUser] = useState<(User & UserProfile) | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<(User & UserProfile) | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    ID: '',
    Name: '',
    Email: '',
    role: 'customer' as 'customer' | 'admin',
    phone_number: '',
    full_name: '',
    avatar_url: '',
    email_notifications: true,
    whatsapp_notifications: true,
    marketing_notifications: true,
    auth_method: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [page, filterRole, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await UserService.getAllUsers({
        pageNo: page,
        pageSize: pageSize,
        search: searchTerm,
        role: filterRole
      });
      setUsers(result.users);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch users.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserClick = () => {
    setCurrentEditingUser(null);
    setFormData({
      ID: '',
      Name: '',
      Email: '',
      role: 'customer',
      phone_number: '',
      full_name: '',
      avatar_url: '',
      email_notifications: true,
      whatsapp_notifications: true,
      marketing_notifications: true,
      auth_method: ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleEditUserClick = (user: User & UserProfile) => {
    setCurrentEditingUser(user);
    setFormData({
      ID: user.ID,
      Name: user.Name,
      Email: user.Email,
      role: user.role,
      phone_number: user.phone_number,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      email_notifications: user.email_notifications,
      whatsapp_notifications: user.whatsapp_notifications,
      marketing_notifications: user.marketing_notifications,
      auth_method: user.auth_method
    });
    setIsAddEditModalOpen(true);
  };

  const handleDeleteUserClick = (user: User & UserProfile) => {
    setUserToDelete(user);
    setDeleteConfirmModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, id: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveUser = async () => {
    setLoading(true);
    try {
      if (currentEditingUser) {
        // Update user
        await UserService.updateUser(currentEditingUser.ID, {
          full_name: formData.full_name,
          email: formData.Email,
          phone_number: formData.phone_number,
          role: formData.role,
          avatar_url: formData.avatar_url,
          email_notifications: formData.email_notifications,
          whatsapp_notifications: formData.whatsapp_notifications,
          marketing_notifications: formData.marketing_notifications
        });
        toast({
          title: 'Success',
          description: 'User updated successfully.',
          variant: 'default'
        });
      } else {
        // Add new user
        await UserService.createUser({
          email: formData.Email,
          name: formData.full_name,
          role: formData.role,
          phoneNumber: formData.phone_number
        });
        toast({
          title: 'Success',
          description: 'User added successfully.',
          variant: 'default'
        });
      }
      setIsAddEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save user.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      setLoading(true);
      try {
        await UserService.deleteUser(userToDelete.ID);
        toast({
          title: 'Success',
          description: 'User deleted successfully.',
          variant: 'default'
        });
        setDeleteConfirmModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete user.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage user accounts and roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => setPage(1) /* Reset page on search */}>
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddUserClick}>
            <Plus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={fetchUsers} className="mt-4">Retry</Button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No users found.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.ID}>
                    <TableCell className="font-medium">{user.Name}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.phone_number || 'N/A'}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUserClick(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUserClick(user)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Add/Edit User Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentEditingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {currentEditingUser ? `Editing user ${currentEditingUser.Name}` : 'Create a new user account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Email" className="text-right">
                Email
              </Label>
              <Input
                id="Email"
                type="email"
                value={formData.Email}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange(value as 'customer' | 'admin', 'role')}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Add more fields as needed, e.g., password for new users, notifications preferences */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmModalOpen} onOpenChange={setDeleteConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user "{userToDelete?.Name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
