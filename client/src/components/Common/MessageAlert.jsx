import React from 'react';
import { BiCheckCircle, BiErrorCircle, BiInfoCircle } from 'react-icons/bi';

const MessageAlert = ({ type = 'info', message, onClose }) => {
  const getAlertClass = () => {
    switch (type) {
      case 'success': return 'alert-success';
      case 'error': return 'alert-danger';
      case 'warning': return 'alert-warning';
      default: return 'alert-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <BiCheckCircle className="me-2" />;
      case 'error': return <BiErrorCircle className="me-2" />;
      case 'warning': return <BiErrorCircle className="me-2" />;
      default: return <BiInfoCircle className="me-2" />;
    }
  };

  if (!message) return null;

  return (
    <div className={`alert ${getAlertClass()} d-flex align-items-center justify-content-between`}>
      <div className="d-flex align-items-center">
        {getIcon()}
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Fechar"
        ></button>
      )}
    </div>
  );
};

export default MessageAlert;