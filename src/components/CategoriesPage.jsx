
// Admin: Full access | Staff: View only

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import AddCategoryDialog from './AddCategoryDialog'
import EditCategoryDialog from './EditCategoryDialog'

export default function CategoriesPage({ user, categories, inventoryData, onAddCategory, onEditCategory, onDeleteCategory }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Count items per category
  const getCategoryItemCount = (categoryName) => {
    return inventoryData.filter(item => item.category === categoryName).length
  }

  // Handle delete with confirmation
  const handleDelete = (category) => {
    const itemCount = getCategoryItemCount(category.categoryName)
    if (itemCount > 0) {
      alert(`Cannot delete category "${category.categoryName}" because it has ${itemCount} item(s). Please reassign or remove items first.`)
      return
    }
    
    if (window.confirm(`Are you sure you want to delete category "${category.categoryName}"?`)) {
      onDeleteCategory(category.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage product categories for inventory organization
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <h3 className="text-3xl font-bold mt-2">{categories.length}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{inventoryData.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Items per Category</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {categories.length > 0 ? Math.round(inventoryData.length / categories.length) : 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Categories List</CardTitle>
            
            {/* Add button - Admin only */}
            {user.role === 'Admin' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mt-4">
            <Input
              type="search"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm
                ? 'No categories found matching search'
                : 'No categories yet. Add your first category to get started.'
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => {
                const itemCount = getCategoryItemCount(category.categoryName)
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{category.categoryName}</h4>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground mb-4">
                        Added: {category.dateAdded}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setEditingCategory(category)}
                        >
                          {user.role === 'Admin' ? 'Edit' : 'View'}
                        </Button>
                        
                        {user.role === 'Admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category)}
                            disabled={itemCount > 0}
                            title={itemCount > 0 ? 'Cannot delete category with items' : 'Delete category'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {filteredCategories.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredCategories.length} of {categories.length} categories
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <AddCategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={onAddCategory}
        existingCategories={categories}
      />

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
          onEdit={onEditCategory}
          isReadOnly={user.role !== 'Admin'}
          existingCategories={categories}
        />
      )}
    </div>
  )
}