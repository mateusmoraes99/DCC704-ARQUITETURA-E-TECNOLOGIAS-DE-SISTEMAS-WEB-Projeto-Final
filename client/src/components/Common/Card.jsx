import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  headerClass = '',
  bodyClass = '',
  footerClass = ''
}) => {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className={`card-header ${headerClass}`}>
          {title && <h5 className="card-title mb-0">{title}</h5>}
          {subtitle && <p className="card-text text-muted mb-0">{subtitle}</p>}
        </div>
      )}
      <div className={`card-body ${bodyClass}`}>
        {children}
      </div>
      {footer && (
        <div className={`card-footer ${footerClass}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;