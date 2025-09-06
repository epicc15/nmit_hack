import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const {products, search, showSearch, refreshProducts} = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [loading, setLoading] = useState(false);

  // Debug: Add console logs to track products
  console.log('Collection Debug - Products from context:', products);
  console.log('Collection Debug - Products count:', products.length);
  console.log('Collection Debug - Filtered products:', filterProducts);

  const toggleCategory = (e) => {
    if(category.includes(e.target.value)){
      setCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if(subcategory.includes(e.target.value)){
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    console.log('Applying filter with products:', products.length);
    let productsCopy = products.slice();
    if(showSearch && search){
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if(category.length > 0){
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }
    if(subcategory.length > 0){
      productsCopy = productsCopy.filter(item => subcategory.includes(item.subCategory))
    }
    console.log('Filter result:', productsCopy.length);
    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType){
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price-b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price-a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }

  // Add manual refresh function for debugging
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      console.log('Manual refresh triggered');
      await refreshProducts();
      console.log('Manual refresh completed');
    } catch (error) {
      console.error('Manual refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    console.log('useEffect triggered - applying filter');
    applyFilter();
  }, [category, subcategory, search, showSearch, products])

  useEffect(()=>{
    sortProduct();
  }, [sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/*Filter options */}
      <div className='min-w-60'> 
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
          FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        
        {/* Debug Button */}
        <button 
          onClick={handleManualRefresh}
          disabled={loading}
          className={`mb-4 px-4 py-2 rounded text-white text-sm ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Refreshing...' : 'Debug: Refresh Products'}
        </button>
        
        {/* Debug Info */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <p>Total Products: {products.length}</p>
          <p>Filtered: {filterProducts.length}</p>
          <p>Categories: {category.join(', ') || 'None'}</p>
          <p>Subcategories: {subcategory.join(', ') || 'None'}</p>
        </div>
        
        {/* Category Filter */} 
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}> 
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Electronics'}/>Electronics
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Clothing'}/>Clothing
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Books'}/>Books
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Furniture'}/>Furniture
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Sports'}/>Sports
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Home & Garden'}/>Home & Garden
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Automotive'}/>Automotive
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Others'}/>Others
            </p>
          </div>
        </div>

        {/* Subcategory filters */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}> 
          <p className='mb-3 text-sm font-medium'>SUBCATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {/* Electronics */}
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Mobile Phones'}/>Mobile Phones
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Laptops'}/>Laptops
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Cameras'}/>Cameras
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Gaming'}/>Gaming
            </p>
            
            {/* Clothing */}
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Men'}/>Men's Clothing
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Women'}/>Women's Clothing
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Kids'}/>Kids' Clothing
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Shoes'}/>Shoes
            </p>
            
            {/* Books */}
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Fiction'}/>Fiction
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Non-Fiction'}/>Non-Fiction
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Academic'}/>Academic
            </p>
            
            {/* Furniture */}
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Living Room'}/>Living Room
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Bedroom'}/>Bedroom
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Office'}/>Office
            </p>
            
            {/* Sports */}
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Fitness'}/>Fitness
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Outdoor Sports'}/>Outdoor Sports
            </p>
            
            {/* Other common subcategories */}
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Kitchen'}/>Kitchen
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Garden Tools'}/>Garden Tools
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Car Parts'}/>Car Parts
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Musical Instruments'}/>Musical Instruments
            </p>
          </div>
        </div>

        {/* Condition Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}> 
          <p className='mb-3 text-sm font-medium'>CONDITION</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'New'}/>New
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Like New'}/>Like New
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Good'}/>Good
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Fair'}/>Fair
            </p>
          </div>
        </div>
      </div>

      {/*Right side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'}></Title>
          {/*Product sort */}
          <select onChange={(e)=>setSortType(e.target.value)} className="border-2 border-gray-300 text-sm px-2" >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/*Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.length > 0 ? (
            filterProducts.map((item, index)=>(
              <ProductItem 
                key={index} 
                name={item.name} 
                id={item._id} 
                price={item.price} 
                image={item.images || item.image} 
              />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No products in database</p>
              <p className="text-gray-400 text-sm mt-2">Add some products or check your backend connection</p>
              <button 
                onClick={handleManualRefresh}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Retry Loading Products'}
              </button>
            </div>
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No products match your filters</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
              <button 
                onClick={() => {
                  setCategory([]);
                  setSubCategory([]);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Collection;