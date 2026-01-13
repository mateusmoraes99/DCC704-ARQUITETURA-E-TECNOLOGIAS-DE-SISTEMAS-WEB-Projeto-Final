import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { BiCalendarCheck, BiClipboard, BiUser } from 'react-icons/bi';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Tentar buscar agendamentos recentes
      try {
        const appointmentsData = await appointmentService.getAppointments();
        setAppointments(appointmentsData.data || []);
      } catch (appointmentError) {
        // Se falhar ao buscar agendamentos do sistema antigo, apenas continua sem eles
        console.warn('Não foi possível carregar agendamentos do sistema antigo:', appointmentError);
        setAppointments([]);
      }

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
    totalAppointments: appointments.length,
    todayAppointments: appointments.filter(app => {
      const today = new Date().toDateString();
      const appDate = new Date(app.date).toDateString();
      return appDate === today;
    }).length
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
        <div className="col-md-4 mb-3">
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

        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <BiClipboard className="text-success fs-3" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total de Agendamentos</h6>
                  <h4 className="mb-0">{stats.totalAppointments}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <BiUser className="text-info fs-3" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Seu Papel</h6>
                  <h6 className="mb-0">
                    {user?.role === 'admin' ? 'Administrador' :
                     user?.role === 'professional' ? 'Profissional' :
                     user?.role === 'labadmin' ? 'Admin de Lab' : 'Cliente'}
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos Recentes */}
      <div className="row">
        <div className="col-md-12 mb-4">
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
      </div>
    </div>
  );
};

export default Dashboard;