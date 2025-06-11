import { useState, useEffect, useCallback } from 'react';
import ScrollReveal from 'scrollreveal';
import DrinkSlider from '../../components/DrinkSlider';
import VideoHero from '../../components/Video';
import Introduction from '../../components/Introduction';
import BlogSection from '../../components/BlogSection';
import GallerySection from '../../components/GallerySection';



const Home = () => {
    const [currentProduct, setCurrentProduct] = useState({
        name: 'SUNRISE ROSÉ SANGRIA SPRITZ',
        image: '/img/OrganicSpritz/sunrise-rose.png',
        backgroundImage: 'img/berry.jpg'
    });

    // Sử dụng useCallback để tránh tạo function mới mỗi lần render
    const handleProductChange = useCallback((newProduct) => {
        setCurrentProduct(newProduct);
    }, []);

    // ScrollReveal chỉ chạy một lần khi component mount
    useEffect(() => {
        document.title = 'Cocktail Miami';
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '50px',
            duration: 1000,
            delay: 0,
            opacity: 0,
            scale: 1,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            reset: false,
            cleanup: false,
            viewFactor: 0.8
        });

        sr.reveal('.hero-title-reveal');
        sr.reveal('.hero-description');
        sr.reveal('.main-content');
        sr.reveal('.video-text', {origin: 'left'});
        sr.reveal('.introduce-photo', {origin: 'right'});
        sr.reveal('.introduce-text', {origin: 'left'});
        sr.reveal('.blog-section-title', {origin: 'left'});
        sr.reveal('.blog-section-icon', {origin: 'right'});
        return () => {
            sr.destroy();
        };
    }, []);

    return (
        <div>
            <div className='section-main-hero'>
                <h1 
                    className='hero-title-reveal text-11xl font-bold text-center leading-none text-transparent bg-clip-text bg-cover bg-center anton-regular'
                    style={{ 
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${currentProduct.backgroundImage}')`,
                        backgroundBlendMode: 'multiply',
                        transition: 'background-image 0.6s ease-in-out'
                    }}
                >
                    SO FRESH & <br/> SO SQUEEZED
                </h1>
                <p className='hero-description text-center text-blackCus'>Premium ready-to-enjoy cocktails made with clean, <br/>
                globally-sourced ingredients</p>
            </div>
            <div className="drink-slider-container">
                <DrinkSlider onProductChange={handleProductChange} />
            </div>
            <VideoHero />
            <Introduction />
            <BlogSection />
            <GallerySection />
        </div>  
    )
};

export default Home;