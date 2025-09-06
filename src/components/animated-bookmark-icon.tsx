export function AnimatedBookmarkIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path 
          d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          fillOpacity="0"
        >
          <animate 
            attributeName="fill-opacity" 
            values="0;0.8;0" 
            dur="2s" 
            repeatCount="indefinite" 
            begin="0s"
          />
          <animate 
            attributeName="fill" 
            values="transparent;currentColor;transparent" 
            dur="2s" 
            repeatCount="indefinite" 
            begin="0s"
          />
        </path>
      </g>
    </svg>
  );
}