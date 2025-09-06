import express from 'express';
import { 
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    getUserProducts, 
    updateProduct, 
    getProductsByCategory 
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js'; // ✅ Using your existing auth.js

const productRouter = express.Router();

// ✅ PUBLIC ROUTES (no authentication needed)
productRouter.get('/list', listProducts); // Get all active products
productRouter.post('/single', singleProduct); // Get single product details
productRouter.get('/category/:category', getProductsByCategory); // Get products by category

// ✅ USER AUTHENTICATED ROUTES (user must be logged in)
productRouter.post('/add', 
    auth, // ✅ Using your existing auth middleware
    upload.fields([
        {name:'image1', maxCount:1}, 
        {name:'image2', maxCount:1}, 
        {name:'image3', maxCount:1}, 
        {name:'image4', maxCount:1}
    ]), 
    addProduct
); // ✅ Any logged-in user can add products

productRouter.get('/my-products', auth, getUserProducts); // ✅ Get user's own products

productRouter.post('/update', 
    auth, 
    upload.fields([
        {name:'image1', maxCount:1}, 
        {name:'image2', maxCount:1}, 
        {name:'image3', maxCount:1}, 
        {name:'image4', maxCount:1}
    ]), 
    updateProduct
); // ✅ Update user's own product

productRouter.post('/remove', auth, removeProduct); // ✅ Remove user's own product

export default productRouter;