import { useState, useEffect } from 'react';

const drinksData = {
  spritz: [
    {
      name: 'SUNRISE ROSÉ SANGRIA SPRITZ',
      desc: 'Organic rosé wine lightly paired with organic orange, lime & pineapple juice.',
      button: 'Shop Organic Spritz',
      image: '/img/OrganicSpritz/sunrise-rose.png',
      color: '#914a64',
      colorBackground: 'img/berry.jpg'
    },
    {
      name: 'MANGO PEACH ROSÉ BELLINI SPRITZ',
      desc: 'Mango peach rosé made with organic grapes and juices.',
      button: 'Shop Bellini',
      image: '/img/OrganicSpritz/mango-peach-rose.png',
      color: '#e7420d',
      colorBackground: 'img/orange.jpg'
    },
  ],
  originals: [
    {
      name: 'ORGANIC BLOOD ORANGE MIMOSA',
      desc: 'Premium organic sparkling wine with organic blood orange, tangerine & grapefruit juices.',
      button: 'Shop Small Batch',
      image: '/img/SmallBatchOrg/blood-orange.png',
      color: '#f5532c',
      colorBackground: 'img/orange.jpg'
    },
    {
      name: 'COPPER POT MARGARITA',
      desc: 'Craft wine cocktail with organic limes and agave.',
      button: 'Shop Margarita',
      image: '/img/SmallBatchOrg/copper-pot.png',
      color: '#47c79c',
      colorBackground: 'img/pomelo.jpg'
    },
  ],
};

export default function DrinkSlider({ onProductChange }) {
  const [activeTab, setActiveTab] = useState('spritz');
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const drinks = drinksData[activeTab];
  const current = drinks[index];
  const activeColor = current?.color;

  // Gửi thông tin sản phẩm hiện tại về Home component
  useEffect(() => {
    if (onProductChange && current) {
      onProductChange({
        name: current.name,
        image: current.image,
        backgroundImage: current.colorBackground // Thêm backgroundImage
      });
    }
  }, [current, onProductChange]);

  // Hàm chuyển tiếp sang sản phẩm tiếp theo với hiệu ứng
  const nextProduct = () => {
    if (isTransitioning) return; // Ngăn spam click

    setIsTransitioning(true);
    
    setTimeout(() => {
      setIndex(prevIndex => {
        if (prevIndex === drinks.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 150); // Delay để hiệu ứng fade out hoàn thành

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
            color:
              activeTab === 'spritz'
                ? drinksData.spritz[index].color
                : undefined,
            borderColor:
              activeTab === 'spritz'
                ? drinksData.spritz[index].color
                : 'transparent',
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
            color:
              activeTab === 'originals'
                ? drinksData.originals[index].color
                : undefined,
            borderColor:
              activeTab === 'originals'
                ? drinksData.originals[index].color
                : 'transparent',
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
          <button
            className="btn transition-colors duration-300"
            style={{
              color: activeColor,
              borderColor: current?.colorBorder || activeColor,
            }}
          >
            {current.button}
          </button>
        </div>

        {/* Image Container - Cột 2 (giữa) */}
        <div className="image-container flex-2 relative w-fit h-fit flex flex-row justify-center items-center">
          <div
            className="absolute w-[350px] h-[350px] rounded-full -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{
              backgroundColor: current?.colorBorder || activeColor,
              opacity: isTransitioning ? 0.2 : 0.4,
              transform: `translate(-50%, -50%) scale(${isTransitioning ? 0.9 : 1})`,
            }}
          ></div>
          <img
            src={current.image}
            alt={current.name}
            className={`product-hero h-[800px] object-contain z-10 transition-all duration-500 ease-out ${
              isTransitioning 
                ? 'opacity-0 transform scale-95 rotate-1' 
                : 'opacity-100 transform scale-100 rotate-0'
            }`}
          />
          <i 
            className="ri-arrow-right-line cursor-pointer transition-colors duration-300"
            onClick={nextProduct}
            style={{
              color: activeColor,
            }}
          ></i>
        </div>

        {/* Next Production - Cột 3 */}
        <div className="next-production flex flex-col gap-6 items-center flex-1">
            {drinks.map((item, i) => {
                if (i === index) return null;

                return (
                <img
                    key={i}
                    src={item.image}
                    alt={item.name}
                    onClick={() => selectProduct(i)}
                    className={`h-[auto] cursor-pointer transition-all duration-300 transform drop-shadow-md ${
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
