import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { BiCalendarPlus, BiCalendar, BiTime, BiUser, BiCheck, BiX } from 'react-icons/bi';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const result = await appointmentService.getAppointments();
      setAppointments(result.data || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentService.updateAppointment(id, { status: newStatus });
      
      setAppointments(prev => prev.map(app => 
        app._id === id ? { ...app, status: newStatus } : app
      ));
      
      setSuccess(`Agendamento ${newStatus === 'confirmed' ? 'confirmado' : 'cancelado'} com sucesso!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar agendamento');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    try {
      await appointmentService.deleteAppointment(id);
      setAppointments(prev => prev.filter(app => app._id !== id));
      setSuccess('Agendamento excluído com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao excluir agendamento');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (!selectedDate) return true;
    const appDate = new Date(app.date).toISOString().split('T')[0];
    return appDate === selectedDate;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Agendamentos</h1>
          <p className="text-muted mb-0">
            {filteredAppointments.length} agendamento(s) encontrado(s)
          </p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => alert('Funcionalidade de novo agendamento será implementada!')}
        >
          <BiCalendarPlus className="me-1" />
          Novo Agendamento
        </button>
      </div>

      {error && (
        <MessageAlert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <MessageAlert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Filtro por data */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label htmlFor="dateFilter" className="form-label">
                <BiCalendar className="me-2" />
                Filtrar por data
              </label>
              <input
                type="date"
                id="dateFilter"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 mt-3 mt-md-0">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                >
                  Hoje
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedDate('')}
                >
                  Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="row">
        {filteredAppointments.map(appointment => (
          <div key={appointment._id} className="col-12 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0 me-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                          <BiCalendar size={24} />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1">
                          {appointment.service?.name || 'Serviço não especificado'}
                        </h5>
                        <div className="d-flex flex-wrap gap-3 mb-2">
                          <small className="text-muted">
                            <BiCalendar className="me-1" />
                            {new Date(appointment.date).toLocaleDateString('pt-BR')}
                          </small>
                          <small className="text-muted">
                            <BiTime className="me-1" />
                            {appointment.startTime} - {appointment.endTime}
                          </small>
                          {appointment.professional && (
                            <small className="text-muted">
                              <BiUser className="me-1" />
                              {appointment.professional.name}
                            </small>
                          )}
                        </div>
                        {appointment.notes && (
                          <p className="card-text text-muted mb-0">
                            <small>{appointment.notes}</small>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4 mt-3 mt-md-0">
                    <div className="d-flex flex-column align-items-end">
                      <div className="mb-2">
                        <span className={`badge ${
                          appointment.status === 'confirmed' ? 'bg-success' :
                          appointment.status === 'pending' ? 'bg-warning' :
                          appointment.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                        }`}>
                          {appointment.status === 'confirmed' ? 'Confirmado' :
                           appointment.status === 'pending' ? 'Pendente' :
                           appointment.status === 'cancelled' ? 'Cancelado' : 'Completo'}
                        </span>
                      </div>
                      
                      <div className="btn-group">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                            >
                              <BiCheck /> Confirmar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                            >
                              <BiX /> Cancelar
                            </button>
                          </>
                        )}
                        
                        {(user?.role === 'admin' || user?.id === appointment.client?._id) && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(appointment._id)}
                          >
                            <BiX /> Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-5">
          <div className="display-1 text-muted mb-3">📅</div>
          <h4>Nenhum agendamento encontrado</h4>
          <p className="text-muted">
            {selectedDate 
              ? `Não há agendamentos para a data ${new Date(selectedDate).toLocaleDateString('pt-BR')}.`
              : 'Não há agendamentos cadastrados.'}
          </p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => alert('Funcionalidade de agendamento será implementada!')}
          >
            <BiCalendarPlus className="me-1" />
            Agendar Agora
          </button>
        </div>
      )}
    </div>
  );
};

export default Appointments;