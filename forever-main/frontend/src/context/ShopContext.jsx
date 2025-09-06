import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = '$';
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false); // NEW: Track products loading state

  const navigate = useNavigate();

  // Load token from localStorage once on mount
  useEffect(() => {
    const loadToken = () => {
      try {
        const savedToken = localStorage.getItem('token');
        if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
          const cleanedToken = savedToken.replace(/^"|"$/g, '');
          if (cleanedToken.split('.').length === 3) {
            setToken(cleanedToken);
            getUserCart(cleanedToken);
          } else {
            console.warn('Invalid token format detected, clearing token');
            localStorage.removeItem('token');
            setToken(null);
          }
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error('Error loading token:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setTokenLoading(false);
      }
    };

    loadToken();
  }, []);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (!tokenLoading) {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, [token, tokenLoading]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    setCartItems(prevCart => {
      const updatedCart = { ...prevCart };
      updatedCart[itemId] = updatedCart[itemId] || {};
      updatedCart[itemId][size] = (updatedCart[itemId][size] || 0) + 1;
      return updatedCart;
    });

    if (!token) {
      toast.info("Login to save your cart");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        const cartResponse = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          { headers: { token } }
        );

        if (cartResponse.data.success && cartResponse.data.cartData) {
          setCartItems(cartResponse.data.cartData);
        } else {
          console.warn("⚠️ cart/get did not return valid cartData");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add to cart");
    }
  };

  // Update quantity (including remove logic)
  const updateQuantity = async (itemId, size, quantity) => {
    setCartItems(prevCart => {
      const updatedCart = { ...prevCart };

      if (quantity === 0) {
        if (updatedCart[itemId]) {
          delete updatedCart[itemId][size];
          if (Object.keys(updatedCart[itemId]).length === 0) {
            delete updatedCart[itemId];
          }
        }
      } else {
        updatedCart[itemId] = updatedCart[itemId] || {};
        updatedCart[itemId][size] = quantity;
      }

      return updatedCart;
    });

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          { headers: { token } }
        );

        if (!response.data.success) {
          toast.error(response.data.message || 'Failed to update cart');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error updating cart');
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        totalCount += cartItems[items][size] || 0;
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const itemInfo = products.find(p => p._id === items);
      if (!itemInfo) continue;
      for (const size in cartItems[items]) {
        totalAmount += itemInfo.price * cartItems[items][size];
      }
    }
    return totalAmount;
  };

  // ENHANCED: Better products loading with error handling
  const getProductsData = async (showToast = false) => {
    try {
      setProductsLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
        console.log('Products loaded:', response.data.products.length);
        if (showToast) {
          toast.success(`Loaded ${response.data.products.length} products`);
        }
        return response.data.products;
      } else {
        throw new Error(response.data.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      if (showToast) {
        toast.error('Error loading products');
      }
      return [];
    } finally {
      setProductsLoading(false);
    }
  };

  // ENHANCED: Refresh products function with better error handling and loading states
  const refreshProducts = async (showToast = false) => {
    try {
      console.log('Refreshing products...');
      setProductsLoading(true);
      
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        const newProducts = response.data.products;
        setProducts(newProducts);
        console.log('Products refreshed:', newProducts.length);
        
        if (showToast) {
          toast.success(`Refreshed ${newProducts.length} products`);
        }
        
        return newProducts;
      } else {
        throw new Error(response.data.message || 'Failed to refresh products');
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      if (showToast) {
        toast.error('Error refreshing products');
      }
      return products; // Return existing products on error
    } finally {
      setProductsLoading(false);
    }
  };

  // NEW: Force refresh from server (bypasses cache)
  const forceRefreshProducts = async () => {
    try {
      setProductsLoading(true);
      console.log('Force refreshing products from server...');
      
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.data.success) {
        const newProducts = response.data.products;
        setProducts(newProducts);
        console.log('Products force refreshed:', newProducts.length);
        toast.success(`Refreshed ${newProducts.length} products from server`);
        return newProducts;
      } else {
        throw new Error(response.data.message || 'Failed to force refresh products');
      }
    } catch (error) {
      console.error('Error force refreshing products:', error);
      toast.error('Error refreshing products from server');
      return products;
    } finally {
      setProductsLoading(false);
    }
  };

  // NEW: Add product to global state (for immediate UI updates)
  const addProductToGlobalState = (newProduct) => {
    setProducts(prevProducts => {
      // Check if product already exists
      const existingIndex = prevProducts.findIndex(p => p._id === newProduct._id);
      if (existingIndex !== -1) {
        // Update existing product
        const updatedProducts = [...prevProducts];
        updatedProducts[existingIndex] = newProduct;
        return updatedProducts;
      } else {
        // Add new product to the beginning
        return [newProduct, ...prevProducts];
      }
    });
  };

  // NEW: Remove product from global state (for immediate UI updates)
  const removeProductFromGlobalState = (productId) => {
    setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
  };

  // NEW: Update product in global state (for immediate UI updates)
  const updateProductInGlobalState = (productId, updates) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p._id === productId ? { ...p, ...updates } : p
      )
    );
  };

  const getUserCart = async (tokenValue) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token: tokenValue } }
      );
      if (response.data.success && response.data.cartData) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const login = (newToken) => {
    const cleanedToken = newToken.replace(/^"|"$/g, '');
    if (cleanedToken.split('.').length === 3) {
      setToken(cleanedToken);
      getUserCart(cleanedToken);
    } else {
      console.error('Invalid token format received');
      toast.error('Invalid authentication token');
    }
  };

  const logout = () => {
    setToken(null);
    setCartItems({});
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Load products on mount
  useEffect(() => {
    getProductsData();
  }, []);

  const [wishlist, setWishlist] = useState([]);

  const getWishlist = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/wishlist/get`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load wishlist");
    }
  };

  const addToWishlist = async (productId) => {
    if (!token) {
      toast.info("Login to use wishlist");
      return;
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/wishlist/add`,
        { productId },
        { headers: { token } }
      );
      if (response.data.success) {
        setWishlist(response.data.wishlist);
        toast.success("Added to wishlist");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/wishlist/remove`,
        { productId },
        { headers: { token } }
      );
      if (response.data.success) {
        setWishlist(response.data.wishlist);
        toast.info("Removed from wishlist");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove from wishlist");
    }
  };

  useEffect(() => {
    getWishlist();
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    backendUrl,
    token,
    setToken,
    tokenLoading,
    login,
    logout,
    navigate,
    setProducts,
    // ENHANCED: Product management functions
    refreshProducts,
    forceRefreshProducts,
    getProductsData,
    productsLoading,
    // NEW: Immediate state update functions
    addProductToGlobalState,
    removeProductFromGlobalState,
    updateProductInGlobalState,
    // Wishlist
    wishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlist
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;