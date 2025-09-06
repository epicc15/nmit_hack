// pages/AddProduct.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const AddProduct = () => {
    const navigate = useNavigate();
    const { 
        token, 
        backendUrl, 
        refreshProducts, 
        addProductToGlobalState,
        forceRefreshProducts 
    } = useContext(ShopContext);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        subCategory: '',
        sizes: [],
        bestseller: false,
        condition: 'Good'
    });

    const [images, setImages] = useState({
        image1: null,
        image2: null,
        image3: null,
        image4: null
    });

    const [loading, setLoading] = useState(false);

    // Categories for EcoFinds marketplace
    const categories = [
        'Electronics',
        'Clothing', 
        'Books',
        'Furniture',
        'Sports',
        'Home & Garden',
        'Automotive',
        'Others'
    ];

    // Sub-categories based on main category
    const subCategories = {
        'Electronics': ['Mobile Phones', 'Laptops', 'Tablets', 'Cameras', 'Gaming', 'Audio'],
        'Clothing': ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'],
        'Books': ['Fiction', 'Non-Fiction', 'Academic', 'Children', 'Comics'],
        'Furniture': ['Bedroom', 'Living Room', 'Kitchen', 'Office', 'Outdoor'],
        'Sports': ['Fitness', 'Outdoor Sports', 'Team Sports', 'Water Sports'],
        'Home & Garden': ['Kitchen', 'Decor', 'Garden Tools', 'Cleaning'],
        'Automotive': ['Car Parts', 'Motorcycles', 'Accessories', 'Tools'],
        'Others': ['Art', 'Collectibles', 'Musical Instruments', 'Toys']
    };

    // Size options (for clothing, shoes, etc.)
    const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'];
    
    const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'category') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                subCategory: '' // Reset subcategory when category changes
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSizeChange = (size) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size) 
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setImages(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Product name is required');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('Product description is required');
            return false;
        }
        if (!formData.price || formData.price <= 0) {
            toast.error('Please enter a valid price');
            return false;
        }
        if (!formData.category) {
            toast.error('Please select a category');
            return false;
        }
        if (!formData.subCategory) {
            toast.error('Please select a subcategory');
            return false;
        }
        if (!images.image1) {
            toast.error('At least one product image is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // Check if user is logged in
        if (!token) {
            toast.error('Please login to add products');
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            
            // Append form fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('subCategory', formData.subCategory);
            formDataToSend.append('sizes', JSON.stringify(formData.sizes));
            formDataToSend.append('bestseller', formData.bestseller);
            formDataToSend.append('condition', formData.condition);
            
            // Append images
            if (images.image1) formDataToSend.append('image1', images.image1);
            if (images.image2) formDataToSend.append('image2', images.image2);
            if (images.image3) formDataToSend.append('image3', images.image3);
            if (images.image4) formDataToSend.append('image4', images.image4);

            // Use consistent backend URL
            const url = `${backendUrl || 'http://localhost:4000'}/api/product/add`;
            console.log('Making request to:', url);

            const response = await axios.post(
                url,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Don't set Content-Type header, let browser set it for FormData
                    }
                }
            );

            console.log('Response:', response.data);

            if (response.data.success) {
                toast.success('Product added successfully!');
                
                // Create a product object for immediate state update
                const newProduct = {
                    _id: response.data.productId || Date.now().toString(), // Use returned ID or temporary ID
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    subCategory: formData.subCategory,
                    sizes: formData.sizes,
                    bestseller: formData.bestseller,
                    condition: formData.condition,
                    images: response.data.images || [], // Use returned image URLs if available
                    date: new Date(),
                    status: 'active',
                    stock: 1
                };

                // Immediately add to global state for instant UI update
                if (addProductToGlobalState && response.data.product) {
                    console.log('Adding product to global state:', response.data.product);
                    addProductToGlobalState(response.data.product);
                } else if (addProductToGlobalState) {
                    console.log('Adding constructed product to global state:', newProduct);
                    addProductToGlobalState(newProduct);
                }

                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    subCategory: '',
                    sizes: [],
                    bestseller: false,
                    condition: 'Good'
                });
                setImages({
                    image1: null,
                    image2: null,
                    image3: null,
                    image4: null
                });

                // Force refresh from server to ensure data consistency
                try {
                    console.log('Force refreshing products from server...');
                    if (forceRefreshProducts) {
                        await forceRefreshProducts();
                    } else if (refreshProducts) {
                        await refreshProducts(true); // Pass true to show toast
                    }
                    console.log('Products refreshed successfully');
                } catch (refreshError) {
                    console.error('Error refreshing products:', refreshError);
                    // Don't show error to user as product was added successfully
                    // But try a regular refresh as fallback
                    if (refreshProducts) {
                        try {
                            await refreshProducts();
                        } catch (fallbackError) {
                            console.error('Fallback refresh also failed:', fallbackError);
                        }
                    }
                }

                // Show success message with navigation options
                const userChoice = window.confirm(
                    'Product added successfully! Would you like to view it in the Collection page? (Click Cancel to add another product)'
                );
                
                if (userChoice) {
                    navigate('/collection');
                } else {
                    // Stay on the page to add more products
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                toast.error(response.data.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again');
                navigate('/login');
                return;
            }
            
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.error('Error adding product. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Check if user is logged in before rendering form
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                    <p className="text-gray-600 mb-6">Please login to add products</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-green-600 px-6 py-4">
                        <h1 className="text-3xl font-bold text-white">Add New Product</h1>
                        <p className="text-green-100 mt-1">List your item on EcoFinds marketplace</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Product Images */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-800 mb-4">
                                Product Images *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['image1', 'image2', 'image3', 'image4'].map((imageKey, index) => (
                                    <div key={imageKey} className="relative">
                                        <input
                                            type="file"
                                            name={imageKey}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id={imageKey}
                                        />
                                        <label
                                            htmlFor={imageKey}
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                                        >
                                            {images[imageKey] ? (
                                                <img
                                                    src={URL.createObjectURL(images[imageKey])}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <div className="text-3xl text-gray-400 mb-2">+</div>
                                                    <div className="text-sm text-gray-500">
                                                        {index === 0 ? 'Main Image' : `Image ${index + 1}`}
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">First image will be used as main image</p>
                        </div>

                        {/* Product Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sub Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sub Category *
                                    </label>
                                    <select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select Sub Category</option>
                                        {formData.category && subCategories[formData.category]?.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price ($) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Condition */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Condition
                                    </label>
                                    <select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        {conditions.map(condition => (
                                            <option key={condition} value={condition}>{condition}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sizes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sizes (if applicable)
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {sizeOptions.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => handleSizeChange(size)}
                                                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                                                    formData.sizes.includes(size)
                                                        ? 'bg-green-600 text-white border-green-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bestseller */}
                                <div>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="bestseller"
                                            checked={formData.bestseller}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Mark as Bestseller
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="5"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Describe your product in detail..."
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/collection')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-8 py-3 bg-green-600 text-white rounded-lg font-medium transition-colors ${
                                    loading
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-green-700'
                                }`}
                            >
                                {loading ? 'Adding Product...' : 'Add Product'}
                            </button>
                        </div>

                        {/* Loading indicator */}
                        {loading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                                    <p className="text-gray-700 font-medium">Adding your product...</p>
                                    <p className="text-gray-500 text-sm mt-1">Please wait while we upload your images</p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;