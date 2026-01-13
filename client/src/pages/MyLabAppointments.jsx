import React, { useState, useEffect } from 'react';
import appointmentLabService from '../services/appointmentLabService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { formatDate, safeParseDate } from '../utils/dateFormatter';
import './MyLabAppointments.css';

const MyLabAppointments = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentLabService.getMyAppointments();
      setAppointments(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await appointmentLabService.cancelAppointment(appointmentId, 'Cancelado pelo usuário');
        setSuccess('Agendamento cancelado com sucesso!');
        fetchAppointments();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Erro ao cancelar agendamento');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Pendente';
      case 'confirmed':
        return '✓ Confirmado';
      case 'cancelled':
        return '✕ Cancelado';
      case 'completed':
        return '✓ Concluído';
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  const canCancel = (status) => {
    return ['pending', 'confirmed'].includes(status);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="my-lab-appointments">
      <div className="appointments-header">
        <h1>📅 Meus Agendamentos em Laboratórios</h1>
        <p className="subtitle">Visualize e gerencie seus agendamentos</p>
      </div>

      {error && <MessageAlert message={error} type="error" />}
      {success && <MessageAlert message={success} type="success" />}

      {/* Filtro */}
      <div className="filter-section">
        <label htmlFor="statusFilter">Filtrar por Status:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos</option>
          <option value="pending">⏳ Pendentes</option>
          <option value="confirmed">✓ Confirmados</option>
          <option value="cancelled">✕ Cancelados</option>
          <option value="completed">✓ Concluídos</option>
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>📭 Nenhum agendamento encontrado</p>
          {filterStatus === 'all' && (
            <p className="subtitle">Você ainda não fez nenhum agendamento em laboratórios</p>
          )}
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map(appointment => (
            <div key={appointment._id} className="appointment-card">
              <div className="card-header">
                <div className="left">
                  <h3>{appointment.labId.nome}</h3>
                  <p className="location">📍 {appointment.labId.localizacao}</p>
                </div>
                <span className={`badge badge-${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className="card-body">
                {/* Datas */}
                <div className="info-section">
                  <h4>📅 Datas</h4>
                  <div className="dates-list">
                    {appointment.datas && appointment.datas.map((date, idx) => (
                      <div key={idx} className="date-item">
                        <span className="date-value">{formatDate(date)}</span>
                        <span className="date-full">({formatFullDate(date)})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horário */}
                <div className="info-row">
                  <span className="label">⏰ Horário:</span>
                  <span className="value">{appointment.horarioInicio} - {appointment.horarioFim}</span>
                </div>

                {/* Equipamentos */}
                {appointment.equipmentIds && appointment.equipmentIds.length > 0 && (
                  <div className="info-section">
                    <h4>🔧 Equipamentos</h4>
                    <div className="equipment-list">
                      {appointment.equipmentIds.map((equip, idx) => (
                        <span key={idx} className="equipment-tag">
                          {equip.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {appointment.observacoes && (
                  <div className="info-section">
                    <h4>📝 Observações</h4>
                    <p className="observations">{appointment.observacoes}</p>
                  </div>
                )}

                {/* Data de Agendamento */}
                <div className="info-row meta">
                  <span className="label">Agendado em:</span>
                  <span className="value">
                    {new Date(appointment.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Motivo Cancelamento */}
                {appointment.status === 'cancelled' && appointment.motivoCancelamento && (
                  <div className="info-section cancelled-reason">
                    <h4>Motivo do Cancelamento:</h4>
                    <p>{appointment.motivoCancelamento}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="card-footer">
                {canCancel(appointment.status) && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleCancel(appointment._id)}
                  >
                    ✕ Cancelar Agendamento
                  </button>
                )}
                {appointment.status === 'pending' && (
                  <p className="help-text">
                    Este agendamento está aguardando confirmação do laboratório
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <div className="stats-section">
        <h3>📊 Resumo</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{appointments.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {appointments.filter(a => a.status === 'pending').length}
            </span>
            <span className="stat-label">Pendentes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {appointments.filter(a => a.status === 'confirmed').length}
            </span>
            <span className="stat-label">Confirmados</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {appointments.filter(a => a.status === 'cancelled').length}
            </span>
            <span className="stat-label">Cancelados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLabAppointments;
