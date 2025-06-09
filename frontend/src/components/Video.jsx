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
      <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center bg-gray-200 rounded-2xl">
        <p className="text-gray-500">Video không thể tải được</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden shadow-lg cursor-pointer py-16 px-32 my-16"
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
        <>
          {/* Lớp phủ mờ - z-index cao hơn video */}
          <div className="absolute inset-0 bg-black/30" style={{ zIndex: 2 }} />
          
          {/* Play button - z-index cao nhất */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
              <i className="ri-play-fill text-white text-3xl ml-1"></i>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
