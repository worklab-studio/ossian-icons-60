export function AnimatedPlayIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      className={className}
    >
      <g fill="currentColor">
        <circle cx="12" cy="6" r="0">
          <animate 
            attributeName="r" 
            values="0;1.5;0" 
            dur="1.2s" 
            repeatCount="indefinite" 
            begin="0s"
          />
        </circle>
        <circle cx="12" cy="18" r="0">
          <animate 
            attributeName="r" 
            values="0;1.5;0" 
            dur="1.2s" 
            repeatCount="indefinite" 
            begin="0.6s"
          />
        </circle>
        <circle cx="18" cy="12" r="0">
          <animate 
            attributeName="r" 
            values="0;1.5;0" 
            dur="1.2s" 
            repeatCount="indefinite" 
            begin="0.3s"
          />
        </circle>
        <circle cx="6" cy="12" r="0">
          <animate 
            attributeName="r" 
            values="0;1.5;0" 
            dur="1.2s" 
            repeatCount="indefinite" 
            begin="0.9s"
          />
        </circle>
      </g>
    </svg>
  );
}