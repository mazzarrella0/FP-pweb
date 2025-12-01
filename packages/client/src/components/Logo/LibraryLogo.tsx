export const LibraryLogo = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Book Stack */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Bottom Book */}
          <rect
            x="10"
            y="50"
            width="60"
            height="12"
            rx="2"
            fill="#4682A9"
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '3s' }}
          />
          <rect
            x="10"
            y="50"
            width="4"
            height="12"
            rx="1"
            fill="#3a6b8f"
          />
          
          {/* Middle Book */}
          <rect
            x="15"
            y="35"
            width="50"
            height="12"
            rx="2"
            fill="#749BC2"
            className="animate-pulse"
            style={{ animationDelay: '0.5s', animationDuration: '3s' }}
          />
          <rect
            x="15"
            y="35"
            width="4"
            height="12"
            rx="1"
            fill="#5f84a8"
          />
          
          {/* Top Book */}
          <rect
            x="20"
            y="20"
            width="40"
            height="12"
            rx="2"
            fill="#91C8E4"
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '3s' }}
          />
          <rect
            x="20"
            y="20"
            width="4"
            height="12"
            rx="1"
            fill="#7ab5d4"
          />
          
          {/* Open Book on Top */}
          <g transform="translate(25, 8)">
            {/* Left Page */}
            <path
              d="M 0 5 Q 0 0 5 0 L 12 0 L 12 15 L 5 15 Q 0 15 0 10 Z"
              fill="#F6F4EB"
              stroke="#4682A9"
              strokeWidth="1.5"
            />
            {/* Right Page */}
            <path
              d="M 18 5 Q 18 0 23 0 L 30 0 L 30 15 L 23 15 Q 18 15 18 10 Z"
              fill="#F6F4EB"
              stroke="#4682A9"
              strokeWidth="1.5"
            />
            {/* Page Lines */}
            <line x1="3" y1="5" x2="9" y2="5" stroke="#91C8E4" strokeWidth="0.8" />
            <line x1="3" y1="8" x2="9" y2="8" stroke="#91C8E4" strokeWidth="0.8" />
            <line x1="3" y1="11" x2="9" y2="11" stroke="#91C8E4" strokeWidth="0.8" />
            
            <line x1="21" y1="5" x2="27" y2="5" stroke="#91C8E4" strokeWidth="0.8" />
            <line x1="21" y1="8" x2="27" y2="8" stroke="#91C8E4" strokeWidth="0.8" />
            <line x1="21" y1="11" x2="27" y2="11" stroke="#91C8E4" strokeWidth="0.8" />
          </g>
        </svg>
        
        {/* Sparkle Effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-blue rounded-full animate-ping" 
             style={{ animationDuration: '2s' }}></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-medium-blue rounded-full animate-ping" 
             style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};
