import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/ui.slice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import api from '../../services/api';
import { MenuSquare, Plus, Search, Filter, Trash2, Edit, AlertCircle, ToggleLeft, ToggleRight, Info } from 'lucide-react';

export const MenuPage = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  
  // Modals Toggles
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  // Forms states
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    preparationTime: 15,
    allergyInfo: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await api.get('/menu/categories');
      setCategories(catRes.data.data.categories);

      const itemsRes = await api.get('/menu/items');
      setItems(itemsRes.data.data.items);
    } catch (err) {
      dispatch(addToast({ message: 'Error retrieving menu specifications', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    try {
      const res = await api.post('/menu/categories', catForm);
      setCategories(prev => [...prev, res.data.data.category]);
      setCatForm({ name: '', description: '' });
      setShowAddCategory(false);
      dispatch(addToast({ message: 'Menu Category created successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to create category', type: 'error' }));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.categoryId) {
      dispatch(addToast({ message: 'Name and Category are required', type: 'error' }));
      return;
    }

    const formData = new FormData();
    formData.append('name', itemForm.name);
    formData.append('description', itemForm.description);
    formData.append('price', itemForm.price);
    formData.append('categoryId', itemForm.categoryId);
    formData.append('preparationTime', itemForm.preparationTime);

    if (itemForm.allergyInfo) {
      const allergens = itemForm.allergyInfo.split(',').map(s => s.trim()).filter(Boolean);
      formData.append('allergyInfo', JSON.stringify(allergens));
    }

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await api.post('/menu/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItems(prev => [res.data.data.item, ...prev]);
      setItemForm({ name: '', description: '', price: 0, categoryId: '', preparationTime: 15, allergyInfo: '' });
      setSelectedFile(null);
      setShowAddItem(false);
      dispatch(addToast({ message: 'Menu Item added successfully', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to create menu item', type: 'error' }));
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/items/${itemId}`);
      setItems(prev => prev.filter(i => i._id !== itemId));
      dispatch(addToast({ message: 'Menu item soft deleted', type: 'info' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to delete menu item', type: 'error' }));
    }
  };

  const toggleItemAvailability = async (item) => {
    try {
      const updated = await api.patch(`/menu/items/${item._id}`, { isAvailable: !item.isAvailable });
      setItems(prev => prev.map(i => i._id === item._id ? updated.data.data.item : i));
      dispatch(addToast({ message: 'Availability status toggled', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: 'Failed to toggle availability', type: 'error' }));
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory ? (item.categoryId?._id === selectedCategory || item.categoryId === selectedCategory) : true;
    const matchesSearch = item.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchVal.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-50 flex items-center">
              <MenuSquare className="h-6 w-6 mr-2 text-primary" /> Menu Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Add new categories, specify dishes, prices, preparation times, and track variants.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" icon={Plus} onClick={() => setShowAddCategory(true)}>
              Category
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowAddItem(true)}>
              Menu Item
            </Button>
          </div>
        </div>

        {/* Categories filters tabs row */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-zinc-900 pb-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-colors ${
              selectedCategory === null ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-colors ${
                selectedCategory === cat._id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search controls */}
        <div className="flex items-center bg-white border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 px-3 py-2 rounded-card max-w-md shadow-soft">
          <Search className="h-4.5 w-4.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search items by name or keywords..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
          />
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton variant="rectangular" height={220} />
            <Skeleton variant="rectangular" height={220} />
            <Skeleton variant="rectangular" height={220} />
            <Skeleton variant="rectangular" height={220} />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-zinc-800">
            <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-zinc-300">No items found</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filters or create a new menu item.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item._id} className="p-0 overflow-hidden flex flex-col justify-between border border-slate-100 dark:border-zinc-900 hover:shadow-premium transition-all">
                {/* Visual */}
                <div className="h-36 bg-slate-100 dark:bg-zinc-900 relative">
                  {item.image ? (
                    <img 
                      src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-700">
                      <MenuSquare className="h-10 w-10" />
                    </div>
                  )}
                  {/* Availability badge */}
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-pill ${
                    item.isAvailable ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[70%]">{item.name}</h4>
                      <span className="text-xs font-bold text-primary">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 line-clamp-2 h-7 leading-normal">{item.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 dark:border-zinc-900/50 text-[10px] text-slate-400 font-semibold">
                    <span>Prep: {item.preparationTime || 15}m</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleItemAvailability(item)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title="Toggle availability"
                      >
                        {item.isAvailable ? <ToggleRight className="h-4.5 w-4.5 text-primary" /> : <ToggleLeft className="h-4.5 w-4.5 text-slate-300" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Category Form */}
        {showAddCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-sm rounded-card p-6 shadow-premium space-y-4 animate-scale-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Create New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <Input 
                  label="Category Name" 
                  name="cname" 
                  value={catForm.name} 
                  onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
                <Input 
                  label="Description" 
                  name="cdesc" 
                  value={catForm.description} 
                  onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Create</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Menu Item Form */}
        {showAddItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 dark:bg-zinc-950 dark:border-zinc-900 w-full max-w-md rounded-card p-6 shadow-premium space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Add New Menu Item</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                <Input 
                  label="Item Name" 
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Price ($)" 
                    type="number" 
                    step="0.01" 
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    required 
                  />
                  <Input 
                    label="Prep Time (mins)" 
                    type="number" 
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm(prev => ({ ...prev, preparationTime: parseInt(e.target.value, 10) }))}
                  />
                </div>
                
                {/* Category Dropdown */}
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Category *</label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="px-3 py-2 text-xs border bg-white border-slate-300 rounded-input focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <Input 
                  label="Allergens (comma separated)" 
                  placeholder="Nuts, Dairy, Gluten"
                  value={itemForm.allergyInfo}
                  onChange={(e) => setItemForm(prev => ({ ...prev, allergyInfo: e.target.value }))}
                />

                <Input 
                  label="Description" 
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                />

                {/* Upload Image File */}
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 font-sans">Item Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="text-xs text-slate-400"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddItem(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Save Item</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenuPage;
