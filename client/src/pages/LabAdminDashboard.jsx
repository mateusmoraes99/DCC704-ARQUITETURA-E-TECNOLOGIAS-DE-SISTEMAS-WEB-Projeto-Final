import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import labService from '../services/labService';
import appointmentLabService from '../services/appointmentLabService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import './LabAdminDashboard.css';

const LabAdminDashboard = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lab, setLab] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [labId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar lab
      const labData = await labService.getLabById(labId);
      if (labData.adminId._id !== user.id) {
        navigate('/');
        return;
      }
      setLab(labData);

      // Buscar agendamentos
      const apptData = await labService.getLabAppointments(labId);
      setAppointments(apptData);

      // Buscar estatísticas
      const statsData = await labService.getLabStats(labId);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await appointmentLabService.confirmAppointment(appointmentId);
      setSuccess('Agendamento confirmado!');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao confirmar agendamento');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    const motivo = prompt('Motivo da rejeição:');
    if (!motivo) return;

    try {
      await appointmentLabService.rejectAppointment(appointmentId, motivo);
      setSuccess('Agendamento rejeitado!');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao rejeitar agendamento');
    }
  };

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === filterStatus);

  if (loading) return <LoadingSpinner />;
  if (!lab) return <MessageAlert message="Laboratório não encontrado" type="error" />;

  return (
    <div className="lab-admin-dashboard">
      <div className="dashboard-header">
        <h1>🔬 Dashboard - {lab.nome}</h1>
        <p>{lab.localizacao}</p>
        <div className="dashboard-actions">
          <Link to={`/lab-admin/${labId}/settings`} className="btn btn-secondary">
            ⚙️ Configurações
          </Link>
          <Link to={`/lab-admin/${labId}/equipment`} className="btn btn-secondary">
            🔧 Equipamentos
          </Link>
          <Link to={`/lab-admin/${labId}/blocked-dates`} className="btn btn-secondary">
            📅 Bloquear Dias
          </Link>
        </div>
      </div>

      {error && <MessageAlert message={error} type="error" />}
      {success && <MessageAlert message={success} type="success" />}

      {/* Estatísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total</h3>
            <p className="stat-number">{stats.totalAgendamentos}</p>
            <small>Agendamentos</small>
          </div>
          <div className="stat-card confirmed">
            <h3>Confirmados</h3>
            <p className="stat-number">{stats.confirmados}</p>
            <small>✓ Confirmados</small>
          </div>
          <div className="stat-card pending">
            <h3>Pendentes</h3>
            <p className="stat-number">{stats.pendentes}</p>
            <small>⏳ Aguardando confirmação</small>
          </div>
          <div className="stat-card cancelled">
            <h3>Cancelados</h3>
            <p className="stat-number">{stats.cancelados}</p>
            <small>✗ Cancelados</small>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Agendamentos
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          <h2>Resumo do Laboratório</h2>
          <div className="lab-info-grid">
            <div className="info-card">
              <label>Horários</label>
              <p>{lab.horarioAbertura} - {lab.horarioFechamento}</p>
            </div>
            <div className="info-card">
              <label>Equipamentos</label>
              <p>{lab.equipamentos?.length || 0} itens</p>
            </div>
            <div className="info-card">
              <label>Dias Bloqueados</label>
              <p>{lab.diasBloqueados?.length || 0} dias</p>
            </div>
            <div className="info-card">
              <label>Status</label>
              <p>{lab.ativo ? '🟢 Ativo' : '🔴 Inativo'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="tab-content">
          <div className="appointments-header">
            <h2>Agendamentos</h2>
            <div className="filter-group">
              <label>Filtrar por Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Todos</option>
                <option value="pending">⏳ Pendentes</option>
                <option value="confirmed">✓ Confirmados</option>
                <option value="cancelled">✗ Cancelados</option>
                <option value="completed">✔ Completos</option>
              </select>
            </div>
          </div>

          <div className="appointments-list">
            {filteredAppointments.length > 0 ? (
              <div className="table-responsive">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Datas</th>
                      <th>Horário</th>
                      <th>Equipamentos</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(apt => (
                      <tr key={apt._id} className={`status-${apt.status}`}>
                        <td>
                          <strong>{apt.usuarioId.name}</strong>
                          <br />
                          <small>{apt.usuarioId.email}</small>
                        </td>
                        <td>
                          {apt.datas.map(d =>
                            new Date(d).toLocaleDateString('pt-BR')
                          ).join(', ')}
                        </td>
                        <td>{apt.horarioInicio} - {apt.horarioFim}</td>
                        <td>
                          {apt.equipmentIds.length > 0
                            ? apt.equipmentIds.map(eq => eq.nome).join(', ')
                            : 'Nenhum'}
                        </td>
                        <td>
                          <span className={`badge badge-${apt.status}`}>
                            {apt.status === 'pending' && '⏳ Pendente'}
                            {apt.status === 'confirmed' && '✓ Confirmado'}
                            {apt.status === 'cancelled' && '✗ Cancelado'}
                            {apt.status === 'completed' && '✔ Completo'}
                          </span>
                        </td>
                        <td className="actions">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleConfirmAppointment(apt._id)}
                              >
                                Confirmar
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRejectAppointment(apt._id)}
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleRejectAppointment(apt._id)}
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <p>Nenhum agendamento encontrado</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabAdminDashboard;
