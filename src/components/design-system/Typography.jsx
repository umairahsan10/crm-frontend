import React from 'react';

const Typography = {
  h1: ({ children, className = '', ...props }) => (
    <h1 className={`text-4xl font-bold text-gray-900 ${className}`} {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, className = '', ...props }) => (
    <h2 className={`text-3xl font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, className = '', ...props }) => (
    <h3 className={`text-2xl font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  ),
  
  h4: ({ children, className = '', ...props }) => (
    <h4 className={`text-xl font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h4>
  ),
  
  h5: ({ children, className = '', ...props }) => (
    <h5 className={`text-lg font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h5>
  ),
  
  h6: ({ children, className = '', ...props }) => (
    <h6 className={`text-base font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h6>
  ),
  
  body1: ({ children, className = '', ...props }) => (
    <p className={`text-base text-gray-700 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  ),
  
  body2: ({ children, className = '', ...props }) => (
    <p className={`text-sm text-gray-600 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  ),
  
  caption: ({ children, className = '', ...props }) => (
    <span className={`text-xs text-gray-500 ${className}`} {...props}>
      {children}
    </span>
  ),
  
  button: ({ children, className = '', ...props }) => (
    <span className={`text-sm font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </span>
  ),
  
  overline: ({ children, className = '', ...props }) => (
    <span className={`text-xs font-medium uppercase tracking-wide text-gray-500 ${className}`} {...props}>
      {children}
    </span>
  )
};

export default Typography; 