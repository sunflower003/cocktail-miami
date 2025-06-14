import React, { useEffect, useState } from "react";

const ScrollUpButton = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY >= 350);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      href="#"
      className={`scrollup${show ? " show-scroll" : ""}`}
      id="scroll-up"
    >
      <i className="ri-arrow-up-line"></i>
    </a>
  );
};

export default ScrollUpButton;
