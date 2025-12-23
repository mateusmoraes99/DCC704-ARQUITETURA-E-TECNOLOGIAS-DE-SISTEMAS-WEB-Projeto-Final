import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { serviceService, appointmentService } from '../services';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { BiCalendarCheck, BiClipboard, BiUser, BiDollar } from 'react-icons/bi';

const Dashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar serviços
      const servicesData = await serviceService.getServices({
        activeOnly: true
      });
      setServices(servicesData.data || []);

      // Buscar agendamentos recentes
      const appointmentsData = await appointmentService.getAppointments();
      setAppointments(appointmentsData.data || []);

    } catch (err) {
      setError(err.message || 'Erro ao carregar dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Calcular estatísticas simples
  const stats = {
    totalServices: services.length,
    totalAppointments: appointments.length,
    todayAppointments: appointments.filter(app => {
      const today = new Date().toDateString();
      const appDate = new Date(app.date).toDateString();
      return appDate === today;
    }).length,
    totalRevenue: services.reduce((sum, service) => sum + service.price, 0)
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2">Dashboard</h1>
        <p className="text-muted">
          Bem-vindo, <strong>{user?.name}</strong>! 
          {user?.role === 'admin' && ' (Administrador)'}
          {user?.role === 'professional' && ' (Profissional)'}
          {user?.role === 'client' && ' (Cliente)'}
        </p>
      </div>

      {error && (
        <MessageAlert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <BiCalendarCheck className="text-primary fs-3" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Agendamentos Hoje</h6>
                  <h4 className="mb-0">{stats.todayAppointments}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <BiClipboard className="text-success fs-3" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total Agendamentos</h6>
                  <h4 className="mb-0">{stats.totalAppointments}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <BiUser className="text-info fs-3" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Serviços Ativos</h6>
                  <h4 className="mb-0">{stats.totalServices}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <BiDollar className="text-warning fs-3" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Valor Total</h6>
                  <h4 className="mb-0">R$ {stats.totalRevenue.toFixed(2)}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos Recentes */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Agendamentos Recentes</h5>
            </div>
            <div className="card-body">
              {appointments.length > 0 ? (
                <div className="list-group list-group-flush">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment._id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            {appointment.service?.name || 'Serviço não especificado'}
                          </h6>
                          <small className="text-muted">
                            {new Date(appointment.date).toLocaleDateString('pt-BR')} 
                            às {appointment.startTime}
                          </small>
                        </div>
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">Nenhum agendamento encontrado.</p>
              )}
            </div>
          </div>
        </div>

        {/* Serviços Disponíveis */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Serviços Disponíveis</h5>
            </div>
            <div className="card-body">
              {services.length > 0 ? (
                <div className="list-group list-group-flush">
                  {services.slice(0, 5).map((service) => (
                    <div key={service._id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{service.name}</h6>
                          <small className="text-muted">
                            {service.duration} min • {service.category || 'Outro'}
                          </small>
                        </div>
                        <div className="text-end">
                          <h6 className="mb-0 text-primary">
                            R$ {service.price.toFixed(2)}
                          </h6>
                          <small className={`badge ${
                            service.isActive ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {service.isActive ? 'Ativo' : 'Inativo'}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">Nenhum serviço encontrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;