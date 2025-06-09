import { useRef, useState } from "react";

export default function VideoHero() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const handleToggle = () => {
    if (videoRef.current) {
      if (!playing) {
        videoRef.current.play().catch(() => setError(true));
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
    }
  };

  const handleError = () => {
    setError(true);
    console.error("Video failed to load: /vid/video.mp4");
  };

  if (error) {
    return (
      <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center bg-gray-200">
        <p className="text-gray-500 text-sm md:text-base">Video failed to load</p>
      </div>
    );
  }

  return (
    <div
      className="video-hero-container relative w-full h-[50vh] md:h-[60vh] lg:h-screen flex items-center justify-center overflow-hidden shadow-lg cursor-pointer p-4 md:py-16 md:px-32 my-4 md:my-16"
      onClick={handleToggle}
    >
      {/* Video với thumbnail */}
      <video
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        src="/vid/video.mp4"
        poster="/img/video-thumbnail.jpg"
        muted
        playsInline
        loop
        controls={false}
        onError={handleError}
        style={{ zIndex: 1 }}
      />
      
      {/* Overlay và button - chỉ hiện khi không play hoặc đang pause */}
      {!playing && (
        <div className="flex flex-col justify-end w-screen h-screen">
          {/* Lớp phủ mờ - z-index cao hơn video */}
          <div className="absolute inset-0 bg-black/30" style={{ zIndex: 2 }} />
          
          {/* Play button - z-index cao nhất */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
            <div className="video-play-button w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
              <i className="ri-play-fill text-white text-2xl md:text-3xl ml-1"></i>
            </div>
          </div>
          <div className="video-text text-white text-left bottom-0 max-w-lg py-16 flex flex-col gap-4" style={{ zIndex: 10 }}>
            <h1 className="text-5xl font-bold">KEEP IT CLEAN. <br /> KEEP IT REAL.</h1>
            <p>When it comes to making cocktails, taste, ingredients, and authenticity matter. We make our organic craft cocktails by using the finest natural ingredients possible, using no sweeteners, no preservatives, and no additives of any kind.</p>
          </div>
        </div>
      )}
    </div>
  );
}
