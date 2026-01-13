import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import labService from '../services/labService';
import appointmentLabService from '../services/appointmentLabService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { formatDate } from '../utils/dateFormatter';
import { BiCalendarPlus, BiCalendar, BiTime, BiUser, BiCheck, BiX, BiGlasses } from 'react-icons/bi';

const AppointmentsLabs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'calendar' ou 'list'
  
  useEffect(() => {
    fetchAppointments();
    fetchLabs();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const result = await appointmentLabService.getMyAppointments();
      setAppointments(result || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabs = async () => {
    try {
      const result = await labService.getAllLabs();
      setLabs(result || []);
    } catch (err) {
      console.error('Erro ao buscar laboratórios:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'confirmed') {
        await appointmentLabService.confirmAppointment(id);
      } else if (newStatus === 'cancelled') {
        await appointmentLabService.cancelAppointment(id);
      }
      
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
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await appointmentLabService.cancelAppointment(id);
      setAppointments(prev => prev.filter(app => app._id !== id));
      setSuccess('Agendamento cancelado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao cancelar agendamento');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">🔬 Agendamentos de Laboratórios</h1>
          <p className="text-muted mb-0">
            {appointments.length} agendamento(s) no total
          </p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/labs')}
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

      {/* Lista de Agendamentos */}
      {appointments.length > 0 ? (
        <div className="row">
          {appointments.map(appointment => (
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
                            {appointment.labId?.nome || 'Laboratório não especificado'}
                          </h5>
                          <div className="d-flex flex-wrap gap-3 mb-2">
                            <small className="text-muted">
                              <BiCalendar className="me-1" />
                              {appointment.datas?.length > 0 
                                ? appointment.datas
                                    .map(d => formatDate(d))
                                    .filter(d => d !== 'Data inválida')
                                    .length > 0
                                  ? appointment.datas
                                      .map(d => formatDate(d))
                                      .filter(d => d !== 'Data inválida')
                                      .join(', ')
                                  : 'Datas sem formato válido'
                                : 'Data não especificada'
                              }
                            </small>
                            <small className="text-muted">
                              <BiTime className="me-1" />
                              {appointment.horarioInicio} - {appointment.horarioFim}
                            </small>
                            {appointment.labId?.adminId && (
                              <small className="text-muted">
                                <BiUser className="me-1" />
                                {appointment.labId.adminId.name}
                              </small>
                            )}
                          </div>
                          {appointment.observacoes && (
                            <p className="card-text text-muted mb-0">
                              <small>{appointment.observacoes}</small>
                            </p>
                          )}
                          {appointment.equipmentIds?.length > 0 && (
                            <div className="mt-2">
                              <small className="text-muted">
                                <strong>Equipamentos:</strong> {appointment.equipmentIds.map(e => e.nome || 'Equipamento').join(', ')}
                              </small>
                            </div>
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
                        
                        <div className="btn-group mt-2" role="group">
                          {appointment.status === 'pending' && (user?.role === 'labAdmin' || user?.role === 'admin') && (
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
                          
                          {(user?.role === 'admin' || user?._id === appointment.usuarioId?._id) && (
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
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="display-1 text-muted mb-3">📅</div>
              <h4>Nenhum agendamento encontrado</h4>
              <p className="text-muted mb-3">Você ainda não tem agendamentos de laboratórios.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/labs')}
              >
                <BiCalendarPlus className="me-1" />
                Agendar um Laboratório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsLabs;
