import {v2 as cloudinary} from 'cloudinary';

import  productModel from '../models/productModel.js';





cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// ✅ Updated function for USER to add product (removed admin restriction)
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, condition } = req.body;
        
        // ✅ Get user ID from authenticated user (from your auth.js middleware)
        const userId = req.userId; // This comes from your auth middleware

        // ✅ Ensure req.files exists
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.json({ success: false, message: "No images uploaded" });
        }

        // ✅ Extract images safely
        const image1 = req.files.image1?.[0];
        const image2 = req.files.image2?.[0];
        const image3 = req.files.image3?.[0];
        const image4 = req.files.image4?.[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        if (images.length === 0) {
            return res.json({ success: false, message: "At least one image is required" });
        }

        // ✅ Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type:'image'});
                return result.secure_url;
            })
        );

        // ✅ Create product data object with seller info
        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true" ? true : false,
            condition: condition || 'Good', // Default to 'Good' if not provided
            images: imagesUrl,
            date: Date.now(),
            seller: userId, // ✅ Add the user who is adding the product
            status: 'active' // ✅ Default status
        };

        // ✅ Save product in DB
        const product = new productModel(productData);
        await product.save();
        res.json({ success: true, message: "Product Added Successfully" });

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// ✅ Function for listing all products (public) - shows only active products
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({ status: 'active' })
            .populate('seller', 'name email') // ✅ Populate seller info if you have user model
            .sort({ date: -1 }); // ✅ Sort by newest first
        res.json({success: true, products});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// ✅ NEW: Function to get user's own products
const getUserProducts = async (req, res) => {
    try {
        const userId = req.userId;
        const products = await productModel.find({ seller: userId })
            .sort({ date: -1 });
        res.json({success: true, products});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// ✅ Updated remove product (only seller can remove their own product)
const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.userId;

        // ✅ Find product and check if user is the seller
        const product = await productModel.findById(id);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        // ✅ Check if current user is the seller of this product
        if (product.seller.toString() !== userId) {
            return res.json({ success: false, message: "You can only delete your own products" });
        }

        await productModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Product removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ✅ Updated single product function
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId)
            .populate('seller', 'name email'); // ✅ Include seller info if you have user model
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        res.json({success: true, product});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// ✅ NEW: Update product (only seller can update)
// In your productController.js, update the updateProduct function:

const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller, condition, status, stock } = req.body;
        const userId = req.userId;

        // ✅ Find product and check ownership
        const product = await productModel.findById(id);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        if (product.seller.toString() !== userId) {
            return res.json({ success: false, message: "You can only update your own products" });
        }

        // ✅ Update product fields
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;
        if (subCategory) updateData.subCategory = subCategory;
        if (sizes) updateData.sizes = JSON.parse(sizes);
        if (bestseller !== undefined) updateData.bestseller = bestseller === "true";
        if (condition) updateData.condition = condition;
        if (status) updateData.status = status;
        if (stock !== undefined) updateData.stock = Number(stock); // ✅ Add stock update

        // ✅ Handle image updates if new images are uploaded
        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files.image1?.[0];
            const image2 = req.files.image2?.[0];
            const image3 = req.files.image3?.[0];
            const image4 = req.files.image4?.[0];

            const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

            if (images.length > 0) {
                let imagesUrl = await Promise.all(
                    images.map(async (item) => {
                        let result = await cloudinary.uploader.upload(item.path, {resource_type:'image'});
                        return result.secure_url;
                    })
                );
                updateData.images = imagesUrl;
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ✅ NEW: Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await productModel.find({ 
            category: category, 
            status: 'active' 
        })
        .populate('seller', 'name email')
        .sort({ date: -1 });
        
        res.json({success: true, products, category});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// ✅ NEW: Search products
const searchProducts = async (req, res) => {
    try {
        const { query } = req.params;
        const products = await productModel.find({
            status: 'active',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { subCategory: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('seller', 'name email')
        .sort({ date: -1 });
        
        res.json({success: true, products, searchQuery: query});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

export { 
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    getUserProducts, 
    updateProduct, 
    getProductsByCategory,
    searchProducts 
};