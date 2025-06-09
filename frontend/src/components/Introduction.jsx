export default function Introduction() {
  return (
    <>
        <div className="hero-introduce relative w-full h-full flex flex-col items-center justify-center py-16 px-32">
            <h1 className="anton-regular introduce-title">OUR COCKTAILS</h1>
            <div className="introduce-photo w-full relative">
                <img
                    src="/img/1.jpg"
                    alt="Cocktails"
                    className="produce-photo-1" />
                <img
                    src="/img/2.jpg"
                    alt="Cocktails"
                    className="produce-photo-2" />
                <img
                    src="/img/3.jfif"
                    alt="Cocktails"
                    className="produce-photo-3" />
            </div>
            <div className="introduce-text flex flex-col justify-center gap-4">
                <h1 className="anton-regular">ORGANIC<br />SPRITZ</h1>
                <p>
                Great tasting cocktails to enjoy today without sacrificing tomorrow. Enjoy an endless summer in a can, no matter where you are. Our organic SPRITZ cocktails are only 110 calories with no added sugar, color, or flavors. It’s the easiest way to <b>#DrinkClean</b>
                </p>
                <button
                className="btn transition-colors duration-300"
                style={{
                color: '#914a64',
                borderColor: '#914a64',
                }}
            >
                Shop Organic Spritz
            </button>
            </div>
        </div>
        <div className="hero-introduce relative w-full h-full flex flex-col items-center justify-center py-16 px-32 section-2">
            <div className="introduce-photo w-full relative">
                <img
                    src="/img/4.jpg"
                    alt="Cocktails"
                    className="produce-photo-1" />
                <img
                    src="/img/5.jpg"
                    alt="Cocktails"
                    className="produce-photo-2" />
                <img
                    src="/img/7.jpg"
                    alt="Cocktails"
                    className="produce-photo-3" />
            </div>
            <div className="introduce-text flex flex-col justify-center gap-4">
                <h1 className="anton-regular">ORGANIC SMALL<br />BATCH ORIGINALS</h1>
                <p>
                Who needs to shake and stir when you can just twist, pour and sip. Our organic Small Batch Originals are made with fresh juices and contain no added sugar, color or flavors. Pour up to four servings, each one no more than 100 calories. It’s the easiest way to <b>#DrinkClean</b>
                </p>
                <button
                className="btn transition-colors duration-300"
                style={{
                color: '#914a64',
                borderColor: '#914a64',
                }}
            >
                Shop Small Batch
            </button>
            </div>
        </div>
    </>
  );
}