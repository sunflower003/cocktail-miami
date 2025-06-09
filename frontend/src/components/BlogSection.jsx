export default function BlogSection() {
    return (
        <div className="blog-section py-16 px-32 h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-between"
        style={{ backgroundImage: "url('/img/blog-thumbnail.jpg')" }}>
            {/* Overlay */}
            <div className="overlay-blog absolute inset-0 bg-black bg-opacity-20 z-0"></div>
            
            <div className="blog-section-title text-white text-left flex flex-col justify-center gap-4 z-10">
                <span>Our Story</span>
                <h1>FROM HANOI TO THE WORLD</h1>
                <p>Miami is a state of mind: and endless flow of weekend vibes. We set out to make premium ready-to-drink cocktails that capture the lighter side of life</p>
            </div>
            
            <div className="blog-section-icon text-white flex items-center gap-4 relative z-10 cursor-pointer">
                <span className="icon-hehe"><i className="ri-arrow-right-line hehe"></i></span>
                Read Our Story
            </div>
        </div>
    );
}