import React from 'react';
import { useNavigate } from 'react-router-dom';

const LabCard = ({ lab }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/lab/${lab._id}`);
  };

  return (
    <div className="lab-card">
      {lab.fotoUrl && (
        <div className="lab-card-image">
          <img src={lab.fotoUrl} alt={lab.nome} />
        </div>
      )}

      <div className="lab-card-content">
        <h3 className="lab-name">{lab.nome}</h3>

        <p className="lab-location">📍 {lab.localizacao}</p>

        <p className="lab-description">
          {lab.descricao?.substring(0, 120)}
          {lab.descricao?.length > 120 ? '...' : ''}
        </p>

        <div className="lab-info-row">
          <span className="info-badge">
            ⏰ {lab.horarioAbertura} - {lab.horarioFechamento}
          </span>
          {lab.equipamentos && lab.equipamentos.length > 0 && (
            <span className="info-badge">
              🔧 {lab.equipamentos.length} equipamento(s)
            </span>
          )}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleViewDetails}
        >
          Ver Detalhes e Agendar
        </button>
      </div>
    </div>
  );
};

export default LabCard;
