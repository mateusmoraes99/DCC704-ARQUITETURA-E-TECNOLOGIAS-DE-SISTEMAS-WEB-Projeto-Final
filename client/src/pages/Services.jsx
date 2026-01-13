import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Services = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página de labs (novos "serviços" são agora labs)
    navigate('/labs', { replace: true });
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <LoadingSpinner />
    </div>
  );
};

export default Services;