import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import labService from '../services/labService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { formatDate, safeParseDate } from '../utils/dateFormatter';
import './LabAdminBlockedDates.css';

const LabAdminBlockedDates = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lab, setLab] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    data: '',
    motivo: ''
  });

  useEffect(() => {
    fetchData();
  }, [labId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const labData = await labService.getLabById(labId);

      if (labData.adminId._id !== user.id) {
        navigate('/');
        return;
      }

      setLab(labData);
      const datas = await labService.getBlockedDays(labId);
      setBlockedDates(datas || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlockDay = async (e) => {
    e.preventDefault();

    if (!formData.data) {
      setError('Selecione uma data');
      return;
    }

    try {
      await labService.blockDay(labId, formData.data, formData.motivo);
      setSuccess('Dia bloqueado com sucesso!');
      setFormData({ data: '', motivo: '' });
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao bloquear dia');
    }
  };

  const handleUnblockDay = async (data) => {
    if (window.confirm(`Tem certeza que deseja desbloquear ${formatFullDate(data)}?`)) {
      try {
        await labService.unblockDay(labId, data);
        setSuccess('Dia desbloqueado com sucesso!');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Erro ao desbloquear dia');
      }
    }
  };

  const formatFullDate = (dateString) => {
    const date = safeParseDate(dateString);
    if (!date) return 'Data inválida';
    
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString) => {
    return formatDate(dateString);
  };

  const getDayOfWeek = (dateString) => {
    const date = safeParseDate(dateString);
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  };

  const sortedBlockedDates = [...blockedDates].sort((a, b) => new Date(a) - new Date(b));

  if (loading) return <LoadingSpinner />;
  if (!lab) return <MessageAlert message="Laboratório não encontrado" type="error" />;

  return (
    <div className="lab-admin-blocked-dates">
      <div className="blocked-header">
        <button className="btn-back" onClick={() => navigate(`/lab-admin/${labId}`)}>
          ← Voltar
        </button>
        <h1>📅 Gerenciar Dias Bloqueados</h1>
      </div>

      {error && <MessageAlert message={error} type="error" />}
      {success && <MessageAlert message={success} type="success" />}

      <div className="blocked-content">
        {/* Formulário */}
        <div className="block-form-section">
          <h2>🔒 Bloquear um Novo Dia</h2>
          
          <form onSubmit={handleBlockDay} className="block-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="data">Selecione o Dia:</label>
                <input
                  type="date"
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="motivo">Motivo (Opcional):</label>
                <input
                  type="text"
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  placeholder="Ex: Manutenção, Feriado, Evento"
                  maxLength="100"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              🔒 Bloquear Dia
            </button>
          </form>
        </div>

        {/* Lista de Dias Bloqueados */}
        <div className="blocked-list-section">
          <h2>
            📋 Dias Bloqueados ({sortedBlockedDates.length})
          </h2>

          {sortedBlockedDates.length === 0 ? (
            <div className="empty-state">
              <p>✓ Nenhum dia bloqueado</p>
              <p className="subtitle">O laboratório está disponível em todos os dias</p>
            </div>
          ) : (
            <div className="blocked-list">
              {sortedBlockedDates.map((date, index) => (
                <div key={index} className="blocked-item">
                  <div className="blocked-info">
                    <div className="date-header">
                      <span className="date-main">{formatDateShort(date)}</span>
                      <span className="day-name">{getDayOfWeek(date)}</span>
                    </div>
                    <p className="date-full">{formatFullDate(date)}</p>
                  </div>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleUnblockDay(date)}
                    title="Desbloquear este dia"
                  >
                    🔓 Desbloquear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="info-section">
          <h3>ℹ️ Informações Importantes</h3>
          <ul>
            <li>
              <strong>Bloquear dias:</strong> Use para marcar dias quando o laboratório não está disponível 
              (manutenção, feriados, eventos)
            </li>
            <li>
              <strong>Horas fixas:</strong> O laboratório funciona de {lab.horarioAbertura} a {lab.horarioFechamento}
            </li>
            <li>
              <strong>Agendamentos:</strong> Usuários não poderão agendar em dias bloqueados
            </li>
            <li>
              <strong>Desbloquear:</strong> Clique em "Desbloquear" para permitir agendamentos novamente
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LabAdminBlockedDates;
