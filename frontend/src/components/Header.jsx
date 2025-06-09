import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <header className="header-div flex justify-between items-center w-full py-16 px-32">
                <div className='header-links flex items-center justify-center gap-20'>
                    <Link to="/" className="link text-blackCus font-medium">
                        Our Cocktails
                    </Link>
                    <Link to="/" className="link text-blackCus font-medium">
                        Drink Clean
                    </Link>
                    <Link to="/" className="link text-blackCus font-medium">
                        Our Story
                    </Link>
                </div>
                <Link to="/">
                    <img src='/logo.png' className='header-logo h-12' />
                </Link>
                <div className='header-links flex items-center justify-center gap-20'>
                    <Link to="/" className="link text-blackCus font-medium">
                        Tasting Room
                    </Link>
                    <Link to="/" className="link text-blackCus font-medium">
                        Cart
                    </Link>
                    <button className="btn font-medium">
                        Login
                    </button>
                </div>
                <i className="ri-menu-3-line hidden" onClick={toggleMenu}></i>
                <aside className={`menu-header absolute top-0 right-0 h-screen bg-white shadow-lg hidden ${isMenuOpen ? 'active' : 'hidden'}`}>
                    <i className="ri-close-line absolute top-0 right-0 p-4" onClick={closeMenu}></i>
                    <div className='flex flex-col text-left p-4 gap-6 mt-16'>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Our Cocktails
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Drink Clean
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Our Story
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Tasting Room
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Cart
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Login
                        </Link>
                    </div>
                </aside>
            </header>
        </>
    );
}

export default Header;