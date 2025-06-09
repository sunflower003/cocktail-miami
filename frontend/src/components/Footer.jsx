export default function Footer() {
    return (
        <div className="footer flex flex-col items-center gap-10 py-16 px-32">
            <div className="border-footer"></div>

            <div className="flex justify-between items-center w-full">
                {/* Logo */}
                <div className="icon-link flex items-center">
                    <img src="logo.png" alt="Miami Cocktail Logo" className="h-14 logo-footer" />
                    {/* Navigation Links */}
                    <div className="link-ico grid grid-cols-3">
                        <div className="flex flex-col gap-8">
                            <a href="#">Our Story</a>
                            <a href="#">Drink Clean</a>
                            <a href="#">Our Cocktails</a>
                        </div>
                        <div className="flex flex-col gap-8">
                            <a href="#">MC Swag</a>
                            <a href="#">Tasting Rooms</a>
                            <a href="#">In the News</a>
                        </div>
                        <div className="flex flex-col gap-8">
                            <a href="#">Upcoming Events</a>
                            <a href="#">Where to Buy</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
                
                {/* Social + Button */}
                <div className="flex flex-col gap-4 items-center justify-center button-footer">
                    {/* Social Icons */}
                    <div className="flex gap-8">
                        <i className="ri-facebook-fill fco"></i>
                        <i className="ri-twitter-x-fill fco"></i>
                        <i className="ri-instagram-line fco"></i>
                        <i className="ri-youtube-fill fco"></i>
                    </div>

                    {/* Buy Button */}
                    <button className="btn">
                        Buy now
                    </button>
                </div>
            </div>


            {/* Footer Bottom Text */}
            <p className="copyright-text">
                Please Drink Responsibly. ©2025 Copyright and Registered Trademark owned by Lehy.
            </p>
        </div>
    );
}
