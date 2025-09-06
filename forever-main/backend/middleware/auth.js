// middleware/auth.js
import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        // ✅ Get token from header - supporting both formats
        const { token, authorization } = req.headers;
        
        let authToken;
        
        // ✅ Check for Bearer token format first
        if (authorization && authorization.startsWith('Bearer ')) {
            authToken = authorization.split(' ')[1];
        } 
        // ✅ Check for direct token in headers
        else if (token) {
            authToken = token;
        } 
        else {
            return res.json({ success: false, message: 'Not Authorized. Please login again' });
        }
        
        // ✅ Verify token
        const token_decode = jwt.verify(authToken, process.env.JWT_SECRET);
        
        // ✅ Add user ID to request object
        req.userId = token_decode.id;
        
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Invalid token. Please login again' });
    }
}

export default auth;