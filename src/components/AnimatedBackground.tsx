import React, { useEffect, useRef, useState } from "react";

const ThreeDAnimatedBackgroundSVG: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInWindow, setIsMouseInWindow] = useState(true);

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseEnter = () => setIsMouseInWindow(true);
    const handleMouseLeave = () => setIsMouseInWindow(false);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container || !isMouseInWindow) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = mousePosition.x - rect.left;
    const mouseY = mousePosition.y - rect.top;

    const maxRotation = 15; // Maximale Rotation in Grad
    const maxTranslation = 20; // Maximale Verschiebung in Pixeln

    const rotateX = ((mouseY - centerY) / centerY) * maxRotation;
    const rotateY = ((mouseX - centerX) / centerX) * -maxRotation; // Invertiert für natürlichere Bewegung
    const translateX = ((mouseX - centerX) / centerX) * maxTranslation;
    const translateY = ((mouseY - centerY) / centerY) * maxTranslation;

    svg.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateX(${translateX}px)
      translateY(${translateY}px)
    `;
  }, [mousePosition, isMouseInWindow]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1127 664"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-80"
      >
        <g style={{ mixBlendMode: "lighten" }} opacity={0.3}>
          <g style={{ mixBlendMode: "lighten" }} filter="url(#filter0_f_74_52)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M465.025 163.929C528.532 136.819 595.607 115.793 653.828 121.462C714.542 127.373 754.565 156.559 778.09 194.411C804.292 236.569 829.079 286.519 790.373 341.16C751.886 395.491 665.264 421.333 593.21 455.404C515.453 492.172 437.831 544.515 361.663 543.875C277.546 543.169 205.774 509.548 192.282 452.039C179.528 397.672 242.874 331.705 298.18 273.283C341.672 227.342 400.046 191.668 465.025 163.929Z"
              fill="#EE40DC"
            />
          </g>
          <g style={{ mixBlendMode: "lighten" }} filter="url(#filter1_f_74_52)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M537.569 222.178C616.696 220.316 696.894 223.016 755.9 240.031C817.433 257.774 846.782 284.982 854.856 313.669C863.849 345.62 867.892 382.022 802.763 406.537C738.006 430.913 635.017 426.623 543.773 430.766C445.306 435.238 340.077 449.295 259.877 431.193C171.308 411.201 110.377 373.89 121.621 335.478C132.251 299.166 228.437 273.433 312.782 250.458C379.109 232.392 456.609 224.084 537.569 222.178Z"
              fill="#FFE60B"
            />
          </g>
          <g style={{ mixBlendMode: "lighten" }} filter="url(#filter2_f_74_52)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M647.193 249.681C736.58 250.052 827.024 253.894 893.064 268.075C961.932 282.864 994.15 304.081 1002.3 325.937C1011.38 350.279 1014.72 377.874 940.376 394.933C866.454 411.895 750.335 406.339 647.193 407.419C535.885 408.585 416.621 416.841 326.693 401.361C227.379 384.266 159.849 354.706 173.832 325.937C187.05 298.74 296.498 281.459 392.485 265.996C467.966 253.836 555.734 249.301 647.193 249.681Z"
              fill="#5092FE"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_f_74_52"
            x="70.6257"
            y="0.532471"
            width="859.779"
            height="663.349"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="60"
              result="effect1_foregroundBlur_74_52"
            />
          </filter>
          <filter
            id="filter1_f_74_52"
            x="0.285645"
            y="101.672"
            width="979.595"
            height="458.521"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="60"
              result="effect1_foregroundBlur_74_52"
            />
          </filter>
          <filter
            id="filter2_f_74_52"
            x="52"
            y="129.659"
            width="1075"
            height="401"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="60"
              result="effect1_foregroundBlur_74_52"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default ThreeDAnimatedBackgroundSVG;
