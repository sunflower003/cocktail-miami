import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DrinkSlider({ onProductChange }) {
  const [activeTab, setActiveTab] = useState('spritz');
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [productsData, setProductsData] = useState({
    spritz: [],
    originals: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  // Fetch products từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch tất cả products với featured = true
        const response = await fetch(`${API_URL}/api/products?featured=true&limit=50`);
        const result = await response.json();
        
        if (result.success) {
          const products = result.data;
          
          // Phân loại products theo category name
          const spritzProducts = products.filter(product => {
            const categoryName = product.category?.name?.toLowerCase() || '';
            return categoryName.includes('spritz') || categoryName.includes('organic spritz');
          });

          const originalsProducts = products.filter(product => {
            const categoryName = product.category?.name?.toLowerCase() || '';
            return categoryName.includes('original') || 
                   categoryName.includes('batch') || 
                   categoryName.includes('small batch');
          });

          // Transform data để match với format UI
          const transformProduct = (product) => ({
            _id: product._id,
            name: product.name.toUpperCase(), // Viết hoa tên sản phẩm
            desc: product.subDescription || product.description.substring(0, 100) + '...', // Lấy subDescription
            image: product.images?.[0]?.url || '/img/default-product.png',
            color: product.color || '#914a64',
            colorBackground: product.backgroundImages?.[0]?.url || 'img/berry.jpg',
            slug: product.slug
          });

          setProductsData({
            spritz: spritzProducts.map(transformProduct),
            originals: originalsProducts.map(transformProduct)
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        
        // Fallback to empty arrays nếu API fail
        setProductsData({
          spritz: [],
          originals: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_URL]);

  // Sử dụng useMemo để tối ưu tính toán drinks và current
  const drinks = useMemo(() => {
    return productsData[activeTab] || [];
  }, [productsData, activeTab]);

  const current = useMemo(() => {
    return drinks[index] || {};
  }, [drinks, index]);

  const activeColor = current?.color || '#914a64';

  // Gửi thông tin sản phẩm hiện tại về Home component
  useEffect(() => {
    if (onProductChange && current && Object.keys(current).length > 0) {
      onProductChange({
        name: current.name,
        image: current.image,
        backgroundImage: current.colorBackground
      });
    }
  }, [current, onProductChange]);

  // Reset index khi chuyển tab hoặc khi data thay đổi
  useEffect(() => {
    if (drinks.length > 0 && index >= drinks.length) {
      setIndex(0);
    }
  }, [drinks, index]);

  // Hàm chuyển tiếp sang sản phẩm tiếp theo với hiệu ứng
  const nextProduct = () => {
    if (isTransitioning || drinks.length <= 1) return;

    setIsTransitioning(true);
    
    setTimeout(() => {
      setIndex(prevIndex => {
        if (prevIndex === drinks.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 150);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Hàm chuyển sản phẩm khi click vào thumbnail
  const selectProduct = (newIndex) => {
    if (isTransitioning || newIndex === index) return;

    setIsTransitioning(true);
    
    setTimeout(() => {
      setIndex(newIndex);
    }, 150);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Hàm chuyển tab
  const handleTabChange = (tab) => {
    setIndex(0);
    setActiveTab(tab);
  };

  // Logic cho nút Shop - Navigate to product detail page
  const handleShopClick = () => {
    if (!current._id) {
      console.warn('No product selected');
      return;
    }

    try {
      // Scroll to top trước khi navigate
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Navigate to product detail page
      // Ưu tiên dùng slug, fallback về _id
      const productIdentifier = current.slug || current._id;
      navigate(`/products/${productIdentifier}`);
      
      // Analytics tracking (optional)
      if (window.gtag) {
        window.gtag('event', 'product_view', {
          event_category: 'ecommerce',
          event_label: current.name,
          product_id: current._id,
          product_category: activeTab
        });
      }
      
      console.log('Navigating to product:', {
        id: current._id,
        slug: current.slug,
        name: current.name,
        category: activeTab
      });
      
    } catch (error) {
      console.error('Error navigating to product:', error);
      
      // Fallback: Navigate using _id if slug fails
      navigate(`/products/${current._id}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="drink-slider-container pt-12 flex flex-col items-center justify-center px-32">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="drink-slider-container pt-12 flex flex-col items-center justify-center px-32">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No products state
  if (drinks.length === 0) {
    return (
      <div className="drink-slider-container pt-12 flex flex-col items-center justify-center px-32">
        <div className="text-center">
          <p className="text-gray-600">No products found for {activeTab === 'spritz' ? 'Organic Spritz' : 'Small Batch Originals'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drink-slider-container pt-12 flex flex-col items-center justify-center px-32">
      {/* Tabs */}
      <div className="tabs-container flex gap-20 text-lg">
        <button
          onClick={() => handleTabChange('spritz')}
          className={`btn-tab pb-1 border-b-2 transition-all duration-300 ${
            activeTab === 'spritz' ? 'font-medium' : 'untab-btn'
          }`}
          style={{
            color: activeTab === 'spritz' ? activeColor : undefined,
            borderColor: activeTab === 'spritz' ? activeColor : 'transparent',
          }}
        >
          Organic Spritz
        </button>

        <button
          onClick={() => handleTabChange('originals')}
          className={`btn-tab pb-1 border-b-2 transition-all duration-300 ${
            activeTab === 'originals' ? 'font-medium' : 'untab-btn'
          }`}
          style={{
            color: activeTab === 'originals' ? activeColor : undefined,
            borderColor: activeTab === 'originals' ? activeColor : 'transparent',
          }}
        >
          Small Batch Originals
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content flex items-center justify-center gap-10 mt-12">
        {/* Drink Info - Cột 1 */}
        <div className="drink-info flex flex-col gap-6 flex-1">
          <h1
            className="text-3xl font-bold text-left transition-colors duration-300"
            style={{ color: activeColor }}
          >
            {current.name}
          </h1>
          <p className="text-lg text-left">{current.desc}</p>
          
          {/* Shop Button - Bỏ hover effects */}
          <button
            onClick={handleShopClick}
            disabled={!current._id}
            className={`btn transition-colors duration-300 ${
              !current._id 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
            style={{
              color: current._id ? activeColor : '#gray',
              borderColor: current._id ? activeColor : '#gray',
            }}
          >
            {current._id ? 'Shop' : 'Loading...'}
          </button>
        </div>

        {/* Image Container - Cột 2 (giữa) */}
        <div className="image-container flex-2 relative w-fit h-fit flex flex-row justify-center items-center">
          <div
            className="absolute w-[350px] h-[350px] rounded-full -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{
              backgroundColor: activeColor,
              opacity: isTransitioning ? 0.2 : 0.4,
              transform: `translate(-50%, -50%) scale(${isTransitioning ? 0.9 : 1})`,
            }}
          ></div>
          
          {/* Product image - Bỏ click và hover effects */}
          <img
            src={current.image}
            alt={current.name}
            onError={(e) => {
              e.target.src = '/img/default-product.png'; // Fallback image
            }}
            className={`product-hero h-[800px] object-contain z-10 transition-all duration-500 ease-out ${
              isTransitioning 
                ? 'opacity-0 transform scale-95 rotate-1' 
                : 'opacity-100 transform scale-100 rotate-0'
            }`}
          />
          {drinks.length > 1 && (
            <i 
              className="ri-arrow-right-line change-arrow cursor-pointer transition-colors duration-300"
              onClick={nextProduct}
              style={{
                color: activeColor,
              }}
            ></i>
          )}
        </div>

        {/* Next Production - Cột 3 */}
        <div className="next-production flex flex-col gap-6 items-center flex-1">
          {drinks.length > 1 && drinks.map((item, i) => {
            if (i === index) return null;

            return (
              <img
                key={item._id || i}
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.target.src = '/img/default-product.png';
                }}
                onClick={() => selectProduct(i)}
                className={`h-[auto] max-h-[200px] cursor-pointer transition-all duration-300 transform drop-shadow-md ${
                  isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}
                style={{
                  border: '2px solid transparent',
                  borderRadius: '10px',
                  filter: isTransitioning ? 'blur(1px)' : 'blur(0px)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}