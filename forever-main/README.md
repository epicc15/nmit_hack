# E-Commerce Website (MERN Stack)

Project Description: EcoFinds - Sustainable Second-Hand Marketplace
EcoFinds is a sustainable second-hand marketplace platform designed to promote responsible consumption and extend the lifecycle of everyday products. Created with the mission of empowering users to buy and sell pre-owned items with ease, EcoFinds aims to be a trusted, community-driven hub for eco-conscious consumers.

The platform addresses the growing need for sustainable alternatives to consumerism by offering a user-friendly and intuitive desktop and mobile application that allows users to register, create personal profiles, list items for sale, and browse or search for second-hand goods. It fosters a circular economy, reduces environmental impact, and makes finding unique and affordable items more accessible.

The application includes essential features such as secure user authentication, product listing management, keyword search, category filtering, and a clean product browsing interface. It also supports basic cart functionality and allows users to view their previous purchases. A strong emphasis is placed on trust, transparency, and ease of use—core values that help create a positive user experience and reinforce EcoFinds’ vision of a sustainable future.

Core Features Included in the Prototype:
User Authentication: Secure login and registration system via email and password.
Profile Creation and Dashboard: Users can set and edit their username and profile details.
Product Listings (CRUD): Users can create, edit, view, and delete product listings with a title, category, description, price, and image placeholder.
Product Feed and Browsing: Listings are displayed in a feed with filters by category and a keyword search.
Product Detail View: Displays full information of selected products.
Shopping Cart: Allows users to add products for future checkout.
Previous Purchases View: Displays a history of past purchases made by the user.

## Project Structure
1. Frontend: Vite React setup, routing, and UI components.
2. Backend: API development with Express and MongoDB.
3. Authentication: User registration and admin verification.
4. Product Features: Uploading and displaying products.
5. Cart & Orders: Managing user purchases and tracking orders.
6. Admin Dashboard: Overview and control over website operations.
7. Payments: Secure integration with Stripe and Razorpay.
8. Image Uploads: Implemented using Cloudinary and Multer.
9. Deployment: Final hosting on Vercel.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mern-ecommerce.git
   ```
2. Navigate to the project directory:
   ```bash
   cd mern-ecommerce
   ```
3. Install dependencies for both frontend and backend:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   cd ../admin
   npm install
   ```
4. Start the development servers:
   ```bash
   cd frontend
   npm run dev
   ```
   ```bash
   cd backend
   npm run dev
   ```
   ```bash
   cd admin
   npm run start
   ```
5. Open `http://localhost:5174/` in your browser.

## Technologies Used
- **Frontend**: React, Redux, React Router
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT
- **Payment**: Stripe, Razorpay
- **Image Uploads**: Cloudinary, Multer
- **Deployment**: Vercel
