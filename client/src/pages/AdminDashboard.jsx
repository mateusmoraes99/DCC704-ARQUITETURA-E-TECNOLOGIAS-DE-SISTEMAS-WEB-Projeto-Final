import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService, userService } from '../services';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { BiCalendar, BiUser, BiCheck, BiX, BiFilter, BiChevronDown, BiPlus } from 'react-icons/bi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtros
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterProfessional, setFilterProfessional] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAppointmentsByFilters();
  }, [filterDate, filterProfessional, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os agendamentos
      const appointmentsData = await appointmentService.getAppointments();
      setAppointments(appointmentsData.data || []);
      
      // Buscar profissionais
      const professionalsData = await userService.getProfessionals();
      setProfessionals(professionalsData.data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentsByFilters = async () => {
    try {
      const params = {};
      
      if (filterDate) {
        params.date = filterDate;
      }
      
      if (filterProfessional !== 'all') {
        params.professional = filterProfessional;
      }
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const result = await appointmentService.getAppointments();
      let filtered = result.data || [];
      
      // Aplicar filtros manualmente no frontend
      if (filterDate) {
        const targetDate = new Date(filterDate).toDateString();
        filtered = filtered.filter(app => new Date(app.date).toDateString() === targetDate);
      }
      
      if (filterProfessional !== 'all') {
        filtered = filtered.filter(app => app.professional?._id === filterProfessional);
      }
      
      if (filterStatus !== 'all') {
        filtered = filtered.filter(app => app.status === filterStatus);
      }
      
      setAppointments(filtered);
    } catch (err) {
      console.error('Erro ao filtrar:', err);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointment(appointmentId, { status: newStatus });
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, status: newStatus } : app
      ));
      setSuccess(`Agendamento ${newStatus === 'confirmed' ? 'confirmado' : 'cancelado'} com sucesso!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar agendamento');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      return;
    }

    try {
      await appointmentService.deleteAppointment(appointmentId);
      setAppointments(appointments.filter(app => app._id !== appointmentId));
      setSuccess('Agendamento deletado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao deletar agendamento');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'cancelled': return 'bg-danger';
      case 'completed': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completo';
      default: return status;
    }
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2">
          <BiCalendar className="me-2" />
          Dashboard Administrativo - Agendamentos
        </h1>
        <p className="text-muted">Gerenciamento completo de agendamentos</p>
      </div>

      <div className="mb-3">
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create-lab')}
        >
          <BiPlus className="me-1" />
          Criar Novo Laboratório
        </button>
      </div>

      {error && (
        <MessageAlert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <MessageAlert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title text-muted">Total</h6>
              <h3 className="mb-0">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body border-start border-success border-5">
              <h6 className="card-title text-muted">Confirmados</h6>
              <h3 className="mb-0 text-success">{stats.confirmed}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body border-start border-warning border-5">
              <h6 className="card-title text-muted">Pendentes</h6>
              <h3 className="mb-0 text-warning">{stats.pending}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body border-start border-danger border-5">
              <h6 className="card-title text-muted">Cancelados</h6>
              <h3 className="mb-0 text-danger">{stats.cancelled}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <BiFilter className="me-2" />
            Filtros
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Data</label>
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Profissional</label>
              <select
                className="form-select"
                value={filterProfessional}
                onChange={(e) => setFilterProfessional(e.target.value)}
              >
                <option value="all">Todos</option>
                {professionals.map(prof => (
                  <option key={prof._id} value={prof._id}>
                    {prof.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
                <option value="completed">Completo</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Visualização</label>
              <select
                className="form-select"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="cards">Cards</option>
                <option value="table">Tabela</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Visualização em Cards */}
      {viewMode === 'cards' && (
        <div className="row">
          {appointments.length > 0 ? (
            appointments.map(appointment => (
              <div key={appointment._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">
                        {appointment.service?.name || 'Serviço'}
                      </h5>
                      <span className={`badge ${getStatusBadgeColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block">
                        <BiCalendar className="me-1" />
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.startTime}
                      </small>
                      <small className="text-muted d-block">
                        <BiUser className="me-1" />
                        {appointment.client?.name || 'Cliente desconhecido'}
                      </small>
                      <small className="text-muted d-block">
                        Profissional: {appointment.professional?.name || 'Não atribuído'}
                      </small>
                    </div>

                    {appointment.notes && (
                      <p className="text-muted small mb-3">
                        <strong>Notas:</strong> {appointment.notes}
                      </p>
                    )}

                    <div className="d-flex gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success flex-grow-1"
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                          >
                            <BiCheck className="me-1" />
                            Confirmar
                          </button>
                          <button
                            className="btn btn-sm btn-danger flex-grow-1"
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                          >
                            <BiX className="me-1" />
                            Cancelar
                          </button>
                        </>
                      )}
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <button
                          className="btn btn-sm btn-outline-danger w-100"
                          onClick={() => handleDelete(appointment._id)}
                        >
                          Deletar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <h5>Nenhum agendamento encontrado com os filtros selecionados</h5>
                <p className="text-muted">Tente ajustar os filtros</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visualização em Tabela */}
      {viewMode === 'table' && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Data/Hora</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Profissional</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map(appointment => (
                    <tr key={appointment._id}>
                      <td>
                        <strong>{new Date(appointment.date).toLocaleDateString('pt-BR')}</strong>
                        <br />
                        <small className="text-muted">{appointment.startTime}</small>
                      </td>
                      <td>{appointment.client?.name || '-'}</td>
                      <td>{appointment.service?.name || '-'}</td>
                      <td>{appointment.professional?.name || '-'}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td>
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                              title="Confirmar"
                            >
                              <BiCheck />
                            </button>
                            <button
                              className="btn btn-sm btn-danger me-2"
                              onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                              title="Cancelar"
                            >
                              <BiX />
                            </button>
                          </>
                        )}
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(appointment._id)}
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Nenhum agendamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
