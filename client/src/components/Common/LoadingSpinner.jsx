import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <div className="spinner"></div>
      <span className="ms-3">Carregando...</span>
    </div>
  );
};

export default LoadingSpinner;