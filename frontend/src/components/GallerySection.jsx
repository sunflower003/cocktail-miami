 export default function GallerySection() {
    return (
        <div className="gallery-section relative flex flex-col items-center justify-center gap-3 py-16 px-32">
            <div className="gallery-text relative">
                <h1 className="anton-regular introduce-title">FOLLOW US</h1>
                <p>#miamicocktailcompany</p>
            </div>
            <div className="gallery-social-icon flex items-center justify-center">
                <i className="ri-facebook-fill gsi"></i>
                <i className="ri-twitter-x-fill gsi"></i>
                <i className="ri-instagram-line gsi"></i>
                <i className="ri-youtube-fill gsi"></i>
            </div>
            <div className="gallery-grid">
                <img className="grid-1" src="/img/gallery-2.jpg" alt=""/>
                <img className="grid-2" src="/img/gallery-1.jpg" alt=""/>
                <img className="grid-3" src="/img/gallery-3.jpg" alt=""/>
                <img className="grid-4" src="/img/gallery-4.jpg" alt=""/>
                <img className="grid-5" src="/img/gallery-5.jpg" alt=""/>
                <img className="grid-6" src="/img/gallery-6.jpg" alt=""/>
            </div>
        </div>
    );
}