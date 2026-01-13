import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext';
import { appointmentService, serviceService } from '../services';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { BiCalendarPlus, BiCalendar, BiTime, BiUser, BiCheck, BiX, BiGlasses } from 'react-icons/bi';

const localizer = momentLocalizer(moment);

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' ou 'list'
  
  // Estado do formulário de novo agendamento
  const [formData, setFormData] = useState({
    service: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, []);

  // Fetch horários disponíveis quando serviço e data mudam
  useEffect(() => {
    if (formData.service && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.service, formData.date]);

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

  const fetchServices = async () => {
    try {
      const result = await serviceService.getServices();
      setServices(result.data || []);
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const result = await appointmentService.getAvailableSlots(
        formData.date,
        formData.service
      );
      setAvailableSlots(result.data?.slots || []);
      setFormData(prev => ({ ...prev, startTime: '' })); // Limpa o horário selecionado
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    if (!formData.service || !formData.date || !formData.startTime) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        service: formData.service,
        date: formData.date,
        startTime: formData.startTime,
        notes: formData.notes
      };

      const result = await appointmentService.createAppointment(appointmentData);
      
      setSuccess('Agendamento criado com sucesso! Você receberá um email de confirmação.');
      setAppointments([...appointments, result.data]);
      setShowModal(false);
      
      // Resetar formulário
      setFormData({
        service: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        notes: ''
      });
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || 'Erro ao criar agendamento');
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

  const handleSelectEvent = (event) => {
    // Quando clica em um evento no calendário
    console.log('Evento selecionado:', event);
  };

  // Converter agendamentos para formato do react-big-calendar
  const calendarEvents = appointments.map(app => ({
    id: app._id,
    title: app.service?.name || 'Agendamento',
    start: new Date(`${app.date.split('T')[0]}T${app.startTime}`),
    end: new Date(`${app.date.split('T')[0]}T${app.endTime}`),
    resource: app,
    backgroundColor: app.status === 'confirmed' ? '#28a745' : 
                     app.status === 'pending' ? '#ffc107' : 
                     app.status === 'cancelled' ? '#dc3545' : '#6c757d'
  }));

  // Estilo personalizado para eventos
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Agendamentos</h1>
          <p className="text-muted mb-0">
            {appointments.length} agendamento(s) no total
          </p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
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

      {/* Modo de visualização */}
      <div className="mb-3">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('calendar')}
          >
            <BiCalendar className="me-1" />
            Calendário
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
          >
            <BiGlasses className="me-1" />
            Lista
          </button>
        </div>
      </div>

      {/* Calendário Visual */}
      {viewMode === 'calendar' && (
        <div className="card mb-4">
          <div className="card-body p-0" style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              popup
              views={['month', 'week', 'day']}
              defaultView="month"
            />
          </div>
        </div>
      )}

      {/* Lista de Agendamentos */}
      {viewMode === 'list' && (
        <div className="row">
          {appointments.length > 0 ? (
            appointments.map(appointment => (
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
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <div className="display-1 text-muted mb-3">📅</div>
                <h4>Nenhum agendamento encontrado</h4>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => setShowModal(true)}
                >
                  <BiCalendarPlus className="me-1" />
                  Agendar Agora
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para Novo Agendamento */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Novo Agendamento</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <MessageAlert type="error" message={error} onClose={() => setError(null)} />
              )}

              <form onSubmit={handleCreateAppointment}>
                {/* Serviço */}
                <div className="mb-3">
                  <label htmlFor="service" className="form-label">
                    <BiCalendar className="me-2" />
                    Serviço *
                  </label>
                  <select
                    className="form-select"
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data */}
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    <BiCalendar className="me-2" />
                    Data *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Horário */}
                <div className="mb-3">
                  <label htmlFor="startTime" className="form-label">
                    <BiTime className="me-2" />
                    Horário *
                  </label>
                  
                  {loadingSlots ? (
                    <div className="alert alert-info">
                      <LoadingSpinner /> Carregando horários disponíveis...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="d-grid gap-2">
                      <label className="form-label">Selecione um horário:</label>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {availableSlots.map((slot, index) => (
                          <div key={index} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id={`slot-${index}`}
                              name="startTime"
                              value={slot.startTime}
                              checked={formData.startTime === slot.startTime}
                              onChange={handleFormChange}
                            />
                            <label className="form-check-label" htmlFor={`slot-${index}`}>
                              {slot.startTime} - {slot.endTime}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : formData.service && formData.date ? (
                    <div className="alert alert-warning">
                      Nenhum horário disponível para esta data. Escolha outra data.
                    </div>
                  ) : (
                    <div className="alert alert-secondary">
                      Selecione um serviço e uma data para ver os horários disponíveis.
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Observações</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Adicione observações sobre o agendamento (opcional)"
                  ></textarea>
                  <small className="text-muted">Máximo 500 caracteres</small>
                </div>

                {/* Resumo */}
                {formData.service && (
                  <div className="alert alert-info">
                    <strong>Resumo do Agendamento:</strong>
                    <ul className="mb-0 mt-2">
                      <li>
                        <strong>Serviço:</strong> {services.find(s => s._id === formData.service)?.name}
                      </li>
                      <li>
                        <strong>Data:</strong> {new Date(formData.date).toLocaleDateString('pt-BR')}
                      </li>
                      <li>
                        <strong>Horário:</strong> {formData.startTime ? `${formData.startTime}` : 'Não selecionado'}
                      </li>
                    </ul>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading || !formData.service || !formData.date || !formData.startTime}
                >
                  {loading ? 'Criando agendamento...' : 'Confirmar Agendamento'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop do modal */}
      {showModal && (
        <div 
          className="modal-backdrop fade show"
          onClick={() => setShowModal(false)}
        ></div>
      )}
    </div>
  );
};

export default Appointments;