import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import labService from '../services/labService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import './LabsHome.css';

const LabsHome = () => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const data = await labService.getAllLabs();
      setLabs(data);
    } catch (err) {
      setError(err.message || 'Erro ao buscar laboratórios');
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = labs.filter(lab =>
    lab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="labs-home">
      <div className="labs-header">
        <h1>🔬 Laboratórios Disponíveis</h1>
        <p>Selecione um laboratório para agendar</p>
      </div>

      {error && <MessageAlert message={error} type="error" />}

      <div className="labs-search">
        <input
          type="text"
          placeholder="Buscar por nome ou localização..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="labs-grid">
        {filteredLabs.length > 0 ? (
          filteredLabs.map(lab => (
            <div key={lab._id} className="lab-card">
              {lab.fotoUrl && (
                <div className="lab-card-image">
                  <img src={lab.fotoUrl} alt={lab.nome} />
                </div>
              )}
              <div className="lab-card-content">
                <h2>{lab.nome}</h2>
                <p className="lab-location">
                  📍 {lab.localizacao}
                </p>
                <p className="lab-description">{lab.descricao}</p>
                
                <div className="lab-info">
                  <span className="lab-info-item">
                    <strong>⏰</strong> {lab.horarioAbertura} - {lab.horarioFechamento}
                  </span>
                  <span className="lab-info-item">
                    <strong>🔧</strong> {lab.equipamentos?.length || 0} equipamentos
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/lab/${lab._id}`)}
                  className="btn btn-primary btn-block"
                >
                  Ver Detalhes e Agendar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-labs">
            <p>Nenhum laboratório encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabsHome;
