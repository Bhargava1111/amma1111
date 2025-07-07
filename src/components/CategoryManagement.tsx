import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Tag,
  Package } from
'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  product_count?: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  is_active: boolean;
}

const CategoryManagement: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        throw new Error(result.error || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      
      if (editingCategory) {
        // Update existing category
        response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new category
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Category ${editingCategory ? 'updated' : 'added'} successfully`
        });

        resetForm();
        setIsDialogOpen(false);
        await loadCategories();
        window.dispatchEvent(new Event('categoriesUpdated'));
      } else {
        throw new Error(result.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save category",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category?.product_count && category.product_count > 0) {
      toast({
        title: "Cannot Delete",
        description: "This category has products. Please move or delete the products first.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });

        await loadCategories();
        window.dispatchEvent(new Event('categoriesUpdated'));
      } else {
        throw new Error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          is_active: !category.is_active
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Category ${!category.is_active ? 'activated' : 'deactivated'}`
        });

        await loadCategories();
        window.dispatchEvent(new Event('categoriesUpdated'));
      } else {
        throw new Error(result.error || 'Failed to update category status');
      }
    } catch (error) {
      console.error('Error updating category status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-gray-600">Organize your products with categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {resetForm();setIsDialogOpen(true);}}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update the category information below.' : 'Create a new category to organize your products.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pickles"
                  required />

              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the category"
                  required />

              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))} />

                <Label htmlFor="active">Active Category</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ?
                  <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div> :

                  <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {editingCategory ? 'Update' : 'Add'} Category
                    </div>
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) =>
        <Card key={category.id} className={`${!category.is_active ? 'opacity-50' : ''}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Category Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Category Info */}
                <div>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {category.product_count || 0} products
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(category)}
                  className="flex-1">

                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleCategoryStatus(category)}>

                    {category.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(category.id)}
                  disabled={category.product_count && category.product_count > 0}>

                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {categories.length === 0 && !isLoading &&
      <Card>
          <CardContent className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first product category
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Category
            </Button>
          </CardContent>
        </Card>
      }
    </div>);

};

export default CategoryManagement;
