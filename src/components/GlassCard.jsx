import { forwardRef } from 'react';

const GlassCard = forwardRef(({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'p-6',
  ...props 
}, ref) => {
  const baseClasses = 'glass-card';
  const hoverClasses = hover ? 'glass-card-hover' : '';
  
  return (
    <div
      ref={ref}
      className={`${baseClasses} ${hoverClasses} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
