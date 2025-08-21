'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    featured: false,
    bestseller: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log('🔄 Admin dashboard useEffect triggered');
    fetchProducts();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (msg: string) => {
    setMessage(msg);
  };

  const fetchProducts = async () => {
    try {
      console.log('📡 Fetching admin products...');
      const response = await fetch('/api/admin/products', {
        credentials: 'include'
      });
      console.log('📡 Admin products response status:', response.status);
      
      if (response.status === 401) {
        console.log('❌ Unauthorized, redirecting to login');
        router.push('/x7k9m2p');
        return;
      }
      
      const data = await response.json();
      console.log('✅ Admin products fetched:', data.length, 'products');
      setProducts(data);
    } catch (error) {
      console.error('❌ Error fetching admin products:', error);
      showMessage('Error: Failed to fetch products');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { 
      method: 'POST',
      credentials: 'include'
    });
    router.push('/x7k9m2p');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      
      // Upload image if a file was selected
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('image', imageFile);
        
        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formDataToSend,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category,
        featured: formData.featured,
        bestseller: formData.bestseller
      };
      
      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update product');
        }
        
        setMessage('Product updated successfully!');
      } else {
        // Add new product
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add product');
        }
        
        setMessage('Product added successfully!');
      }
      
      // Refresh products list
      fetchProducts();
      resetForm();
      setEditingProduct(null);
      
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      featured: product.featured,
      bestseller: product.bestseller
    });
    setImagePreview(product.image);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      featured: false,
      bestseller: false
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchProducts();
        showMessage('Product deleted successfully!');
      } else {
        const errorData = await response.json();
        showMessage(`Error: ${errorData.error || 'Failed to delete product'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showMessage('Error: Failed to delete product');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, image: data.url }));
        setImagePreview(data.url);
        setImageFile(null);
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-light text-[#7C805A] font-elegant">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/x7k9m2p/dashboard')}
                className="px-4 py-2 bg-[#7C805A] text-[#F5E6D3] rounded-lg font-light"
              >
                Products
              </button>
              <button
                onClick={() => router.push('/x7k9m2p/orders')}
                className="px-4 py-2 bg-white/20 text-[#7C805A] border border-white/30 rounded-lg font-light hover:bg-white/30 transition-colors"
              >
                Orders
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 text-red-600 border border-red-500/30 rounded-lg font-light hover:bg-red-600/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className="mb-6 p-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-lg shadow-black/20">
              <p className="text-[#7C805A] font-light text-center">{message}</p>
            </div>
          )}

          {/* Add Product Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-[#7C805A] hover:bg-[#6A7150] text-[#F5E6D3] rounded-xl transition-all duration-200 font-light shadow-lg shadow-black/30"
            >
              Add New Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-[#7C805A] text-lg">No products found</p>
                <p className="text-[#7C805A] opacity-60 text-sm">Products count: {products.length}</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-black/20"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-light text-[#7C805A] mb-2">{product.name}</h3>
                  <p className="text-[#7C805A] opacity-80 mb-3 text-sm">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-light text-[#7C805A]">${product.price}</span>
                    <span className="text-sm text-[#7C805A] opacity-80">{product.category}</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {product.featured && (
                      <span className="px-2 py-1 bg-[#7C805A] text-[#F5E6D3] rounded-full text-xs">
                        Featured
                      </span>
                    )}
                    {product.bestseller && (
                      <span className="px-2 py-1 bg-[#7C805A] text-[#F5E6D3] rounded-full text-xs">
                        Bestseller
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 py-2 px-4 bg-[#7C805A] text-[#F5E6D3] rounded-lg hover:bg-[#6A7150] transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id.toString())}
                      className="flex-1 py-2 px-4 bg-red-600/20 text-red-600 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add/Edit Product Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-black/30">
                <h2 className="text-2xl font-light text-[#7C805A] mb-6 font-elegant">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/50 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    required
                  />
                  
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/50 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent h-24 resize-none"
                    required
                  />
                  
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/50 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    required
                  />
                  
                  <div className="mb-4">
                    <label className="block text-[#7C805A] font-light mb-2">Image</label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="w-32 h-32 object-cover rounded-lg border border-white/40"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setFormData(prev => ({ ...prev, image: '' }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      
                      {/* File Input */}
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="flex-1 text-sm text-[#7C805A] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-light file:bg-[#7C805A] file:text-[#F5E6D3] hover:file:bg-[#6A7150] file:cursor-pointer"
                        />
                        {imageFile && (
                          <button
                            type="button"
                            onClick={() => handleImageUpload(imageFile)}
                            disabled={uploading}
                            className="px-4 py-2 bg-[#7C805A] hover:bg-[#6A7150] text-[#F5E6D3] rounded-lg transition-colors font-light disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploading ? 'Uploading...' : 'Upload'}
                          </button>
                        )}
                      </div>
                      
                      {/* Current Image URL (for reference) */}
                      {formData.image && (
                        <div className="text-xs text-[#7C805A] opacity-70">
                          Current: {formData.image}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/50 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent"
                    required
                  />
                  
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="mr-2 h-4 w-4 text-[#7C805A] focus:ring-[#7C805A] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Featured</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="bestseller"
                        checked={formData.bestseller}
                        onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                        className="mr-2 h-4 w-4 text-[#7C805A] focus:ring-[#7C805A] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Bestseller</span>
                    </label>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-[#7C805A] hover:bg-[#6A7150] text-[#F5E6D3] rounded-lg transition-all duration-200 font-light"
                    >
                      {editingProduct ? 'Update' : 'Add'} Product
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-light"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}