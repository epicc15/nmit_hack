import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const MyProducts = () => {
    const navigate = useNavigate();
    const { token, backendUrl, refreshProducts } = useContext(ShopContext);
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [stockUpdateLoading, setStockUpdateLoading] = useState(null);

    // Handle stock increase/decrease
    const handleStockChange = async (productId, change) => {
        const product = products.find(p => p._id === productId);
        const newStock = Math.max(0, (product.stock || 1) + change);
        
        setStockUpdateLoading(productId);
        try {
            const response = await axios.post(
                `${backendUrl || process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/product/update`,
                { 
                    id: productId, 
                    stock: newStock 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Update local state
                setProducts(products.map(p => 
                    p._id === productId ? { ...p, stock: newStock } : p
                ));
                toast.success(`Stock updated to ${newStock}`);
                
                // Refresh global products list to keep Collection in sync
                if (refreshProducts) {
                    await refreshProducts();
                }
            } else {
                toast.error(response.data.message || 'Failed to update stock');
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error(error.response?.data?.message || 'Error updating stock');
        } finally {
            setStockUpdateLoading(null);
        }
    };

    // Fetch user's products
    const fetchUserProducts = async () => {
        try {
            const response = await axios.get(
                `${backendUrl || process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/product/my-products`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setProducts(response.data.products);
                console.log('My Products loaded:', response.data.products.length);
            } else {
                toast.error('Failed to fetch your products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to view your products');
                navigate('/login');
            } else {
                toast.error('Error loading products');
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete product
    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        setDeleteLoading(productId);
        try {
            const response = await axios.post(
                `${backendUrl || process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/product/remove`,
                { id: productId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Product deleted successfully');
                // Update local state
                setProducts(products.filter(product => product._id !== productId));
                
                // Refresh global products list after deletion
                if (refreshProducts) {
                    await refreshProducts();
                }
            } else {
                toast.error(response.data.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error.response?.data?.message || 'Error deleting product');
        } finally {
            setDeleteLoading(null);
        }
    };

    // Manual refresh function for debugging
    const handleManualRefresh = async () => {
        setLoading(true);
        try {
            console.log('Manual refresh triggered');
            
            // Refresh both local and global products
            await Promise.all([
                fetchUserProducts(),
                refreshProducts && refreshProducts()
            ]);
            
            console.log('Manual refresh completed');
        } catch (error) {
            console.error('Manual refresh error:', error);
            toast.error('Error refreshing products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            toast.error('Please login to view your products');
            navigate('/login');
            return;
        }
        fetchUserProducts();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                            <p className="text-gray-600 mt-1">Manage your listed products</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <button 
                                onClick={handleManualRefresh}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    loading ? 'bg-gray-400 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <Link
                                to="/add-product"
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                + Add New Product
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Products Yet</h3>
                        <p className="text-gray-600 mb-6">You haven't listed any products yet.</p>
                        <Link
                            to="/add-product"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                        >
                            List Your First Product
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Product Image */}
                                <div className="relative aspect-square">
                                    <img
                                        src={product.images?.[0] || '/api/placeholder/300/300'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.log('Image failed to load:', product.images?.[0]);
                                            e.target.src = '/api/placeholder/300/300';
                                        }}
                                    />
                                    {product.bestseller && (
                                        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                                            Bestseller
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                                        {product.condition || 'Good'}
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{product.category} • {product.subCategory}</p>
                                    <p className="text-lg font-bold text-green-600 mb-3">${product.price}</p>
                                    
                                    {/* Stock Display */}
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600">
                                            Stock: <span className="font-medium">{product.stock || 1}</span>
                                        </p>
                                    </div>
                                    
                                    {/* Sizes */}
                                    {product.sizes && product.sizes.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-500 mb-1">Available Sizes:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {product.sizes.slice(0, 4).map((size, index) => (
                                                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        {size}
                                                    </span>
                                                ))}
                                                {product.sizes.length > 4 && (
                                                    <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stock Controls */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                            <button
                                                onClick={() => handleStockChange(product._id, -1)}
                                                disabled={stockUpdateLoading === product._id || (product.stock || 1) <= 0}
                                                className="bg-red-100 hover:bg-red-200 text-red-700 w-8 h-8 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="font-medium text-gray-700">
                                                {stockUpdateLoading === product._id ? '...' : (product.stock || 1)}
                                            </span>
                                            <button
                                                onClick={() => handleStockChange(product._id, 1)}
                                                disabled={stockUpdateLoading === product._id}
                                                className="bg-green-100 hover:bg-green-200 text-green-700 w-8 h-8 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/edit-product/${product._id}`}
                                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-center py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Edit Details
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            disabled={deleteLoading === product._id}
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {deleteLoading === product._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {products.length > 0 && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                                <div className="text-sm text-gray-600">Items Listed</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    ${products.reduce((sum, product) => sum + parseFloat(product.price), 0).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600">Total Listed Value</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {products.reduce((sum, product) => sum + (product.stock || 1), 0)}
                                </div>
                                <div className="text-sm text-gray-600">Total Stock</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {products.filter(p => p.bestseller).length}
                                </div>
                                <div className="text-sm text-gray-600">Featured Items</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProducts;