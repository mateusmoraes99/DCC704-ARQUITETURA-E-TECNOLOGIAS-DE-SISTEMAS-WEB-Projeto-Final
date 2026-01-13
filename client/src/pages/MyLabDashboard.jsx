import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import labService from '../services/labService';
import appointmentLabService from '../services/appointmentLabService';
import equipmentService from '../services/equipmentService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { BiCog, BiCalendar, BiBox, BiCalendarX, BiCheck, BiX, BiChevronRight, BiTrash, BiEdit, BiPlus } from 'react-icons/bi';
import './LabAdminDashboard.css';

const MyLabDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados principais
  const [lab, setLab] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estados para edição de Lab
  const [editingLab, setEditingLab] = useState(false);
  const [labForm, setLabForm] = useState({
    nome: '',
    descricao: '',
    localizacao: '',
    horarioAbertura: '',
    horarioFechamento: ''
  });

  // Estados para equipamentos
  const [editingEquipment, setEditingEquipment] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    nome: '',
    descricao: '',
    quantidade: 1
  });
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);

  // Estados para datas bloqueadas
  const [blockingDate, setBlockingDate] = useState(false);
  const [blockDateForm, setBlockDateForm] = useState({
    data: '',
    motivo: ''
  });

  // Carrega dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // Busca todos os dados
  const fetchData = async () => {
    try {
      setLoading(true);
      const labData = await labService.getMyLab();
      
      if (!labData) {
        setError('Você ainda não administra nenhum laboratório. Crie um para começar!');
        return;
      }
      
      setLab(labData);
      setLabForm({
        nome: labData.nome || '',
        descricao: labData.descricao || '',
        localizacao: labData.localizacao || '',
        horarioAbertura: labData.horarioAbertura || '',
        horarioFechamento: labData.horarioFechamento || ''
      });

      // Buscar agendamentos
      const apptData = await appointmentLabService.getLabAppointments(labData._id);
      setAppointments(apptData || []);

      // Buscar equipamentos
      const equipData = await equipmentService.getLabEquipment(labData._id);
      setEquipment(equipData || []);

      // Buscar datas bloqueadas
      const blockedData = await labService.getBlockedDays(labData._id);
      setBlockedDates(blockedData || []);

      // Buscar estatísticas
      try {
        const statsData = await labService.getLabStats(labData._id);
        setStats(statsData);
      } catch (statsErr) {
        console.warn('Erro ao buscar estatísticas:', statsErr);
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar dados do laboratório');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNÇÕES DE AGENDAMENTOS =====
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const endpoint = newStatus === 'confirmed' ? 'confirmAppointment' : 'rejectAppointment';
      await appointmentLabService[endpoint](appointmentId);
      setSuccess(`Agendamento ${newStatus === 'confirmed' ? 'confirmado' : 'rejeitado'} com sucesso!`);
      fetchData();
    } catch (err) {
      setError(err.message || `Erro ao ${newStatus === 'confirmed' ? 'confirmar' : 'rejeitar'} agendamento`);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return labels[status] || status;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-success',
      cancelled: 'bg-danger',
      completed: 'bg-info'
    };
    return colors[status] || 'bg-secondary';
  };

  // ===== FUNÇÕES DE CONFIGURAÇÕES DO LAB =====
  const handleLabFormChange = (e) => {
    const { name, value } = e.target;
    setLabForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveLab = async () => {
    try {
      const formData = new FormData();
      formData.append('nome', labForm.nome);
      formData.append('descricao', labForm.descricao);
      formData.append('localizacao', labForm.localizacao);
      formData.append('horarioAbertura', labForm.horarioAbertura);
      formData.append('horarioFechamento', labForm.horarioFechamento);
      
      await labService.updateLab(lab._id, formData);
      setSuccess('Laboratório atualizado com sucesso!');
      setEditingLab(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar laboratório');
    }
  };

  // ===== FUNÇÕES DE EQUIPAMENTOS =====
  const handleEquipmentFormChange = (e) => {
    const { name, value } = e.target;
    setEquipmentForm(prev => ({
      ...prev,
      [name]: name === 'quantidade' ? parseInt(value) : value
    }));
  };

  const handleAddEquipment = async () => {
    try {
      if (!equipmentForm.nome) {
        setError('Nome do equipamento é obrigatório');
        return;
      }

      const data = {
        nome: equipmentForm.nome,
        descricao: equipmentForm.descricao,
        quantidade: equipmentForm.quantidade
      };

      await equipmentService.createEquipment(lab._id, data);
      setSuccess('Equipamento adicionado com sucesso!');
      setEquipmentForm({ nome: '', descricao: '', quantidade: 1 });
      setEditingEquipment(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Erro ao adicionar equipamento');
    }
  };

  const handleEditEquipment = (equip) => {
    setEditingEquipmentId(equip._id);
    setEquipmentForm({
      nome: equip.nome,
      descricao: equip.descricao || '',
      quantidade: equip.quantidade
    });
    setEditingEquipment(true);
  };

  const handleUpdateEquipment = async () => {
    try {
      const data = {
        nome: equipmentForm.nome,
        descricao: equipmentForm.descricao,
        quantidade: equipmentForm.quantidade
      };

      await equipmentService.updateEquipment(editingEquipmentId, data);
      setSuccess('Equipamento atualizado com sucesso!');
      setEquipmentForm({ nome: '', descricao: '', quantidade: 1 });
      setEditingEquipment(false);
      setEditingEquipmentId(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar equipamento');
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('Tem certeza que deseja deletar este equipamento?')) {
      try {
        await equipmentService.deleteEquipment(equipmentId);
        setSuccess('Equipamento deletado com sucesso!');
        fetchData();
      } catch (err) {
        setError(err.message || 'Erro ao deletar equipamento');
      }
    }
  };

  const handleCancelEditEquipment = () => {
    setEditingEquipment(false);
    setEditingEquipmentId(null);
    setEquipmentForm({ nome: '', descricao: '', quantidade: 1 });
  };

  // ===== FUNÇÕES DE DATAS BLOQUEADAS =====
  const handleBlockDateFormChange = (e) => {
    const { name, value } = e.target;
    setBlockDateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlockDate = async () => {
    try {
      if (!blockDateForm.data) {
        setError('Data é obrigatória');
        return;
      }

      await labService.blockDay(lab._id, blockDateForm.data, blockDateForm.motivo);
      setSuccess('Data bloqueada com sucesso!');
      setBlockDateForm({ data: '', motivo: '' });
      setBlockingDate(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Erro ao bloquear data');
    }
  };

  const handleUnblockDate = async (data) => {
    if (window.confirm('Tem certeza que deseja desbloquear esta data?')) {
      try {
        await labService.unblockDay(lab._id, data);
        setSuccess('Data desbloqueada com sucesso!');
        fetchData();
      } catch (err) {
        setError(err.message || 'Erro ao desbloquear data');
      }
    }
  };

  // Dados para estatísticas
  const stats_data = {
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

  if (!lab) {
    return (
      <div className="container mt-5">
        <MessageAlert type="warning" message={error || 'Laboratório não encontrado'} />
        <button className="btn btn-primary mt-3" onClick={() => navigate('/create-lab')}>
          Criar Meu Laboratório
        </button>
      </div>
    );
  }

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2">
          <BiCalendar className="me-2" />
          Meu Laboratório: {lab.nome}
        </h1>
        <p className="text-muted">Gerenciamento de agendamentos e configurações</p>
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
              <h3 className="mb-0">{stats_data.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body border-start border-success border-5">
              <h6 className="card-title text-muted">Confirmados</h6>
              <h3 className="mb-0 text-success">{stats_data.confirmed}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body border-start border-warning border-5">
              <h6 className="card-title text-muted">Pendentes</h6>
              <h3 className="mb-0 text-warning">{stats_data.pending}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body border-start border-danger border-5">
              <h6 className="card-title text-muted">Cancelados</h6>
              <h3 className="mb-0 text-danger">{stats_data.cancelled}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BiCalendar className="me-1" />
            Agendamentos
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('settings')}
          >
            <BiCog className="me-1" />
            Configurações
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'equipment' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('equipment')}
          >
            <BiBox className="me-1" />
            Equipamentos
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'blocked-dates' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('blocked-dates')}
          >
            <BiCalendarX className="me-1" />
            Datas Bloqueadas
          </button>
        </div>
      </div>

      {/* ===== ABA: AGENDAMENTOS ===== */}
      {activeTab === 'dashboard' && (
        <>
          <div className="mb-3">
            <label htmlFor="statusFilter" className="form-label">Filtrar por Status:</label>
            <select
              id="statusFilter"
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="confirmed">Confirmados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="list-group">
              {filteredAppointments.map(appointment => (
                <div key={appointment._id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-2">
                        {appointment.usuarioId?.name || 'Usuário desconhecido'}
                        <span className={`badge ${getStatusBadgeColor(appointment.status)} ms-2`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </h6>
                      <p className="mb-1 text-muted">
                        <small>
                          📅 Datas: {appointment.datas?.map(d => new Date(d).toLocaleDateString('pt-BR')).join(', ') || 'N/A'}
                        </small>
                      </p>
                      <p className="mb-1 text-muted">
                        <small>
                          🕐 Horário: {appointment.horarioInicio} - {appointment.horarioFim}
                        </small>
                      </p>
                      {appointment.observacoes && (
                        <p className="mb-0 text-muted">
                          <small>📝 {appointment.observacoes}</small>
                        </p>
                      )}
                    </div>
                    
                    <div className="ms-3">
                      {appointment.status === 'pending' && (
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-success"
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                            title="Confirmar"
                          >
                            <BiCheck /> Confirmar
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                            title="Rejeitar"
                          >
                            <BiX /> Rejeitar
                          </button>
                        </div>
                      )}
                      {appointment.status !== 'pending' && (
                        <span className="text-muted">
                          <BiChevronRight />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              Nenhum agendamento {filterStatus !== 'all' ? `com status "${filterStatus}"` : ''}
            </div>
          )}
        </>
      )}

      {/* ===== ABA: CONFIGURAÇÕES ===== */}
      {activeTab === 'settings' && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Configurações do Laboratório</h5>
          </div>
          <div className="card-body">
            {!editingLab ? (
              <>
                <div className="mb-3">
                  <h6 className="text-muted">Nome do Lab</h6>
                  <p>{lab?.nome || 'N/A'}</p>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted">Descrição</h6>
                  <p>{lab?.descricao || 'N/A'}</p>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted">Localização</h6>
                  <p>{lab?.localizacao || 'N/A'}</p>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Horário de Abertura</h6>
                    <p>{lab?.horarioAbertura || 'N/A'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Horário de Fechamento</h6>
                    <p>{lab?.horarioFechamento || 'N/A'}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setEditingLab(true)}
                >
                  <BiEdit className="me-2" />
                  Editar Configurações
                </button>
              </>
            ) : (
              <form>
                <div className="mb-3">
                  <label htmlFor="labName" className="form-label">Nome do Lab</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="labName"
                    name="nome"
                    value={labForm.nome}
                    onChange={handleLabFormChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="labDesc" className="form-label">Descrição</label>
                  <textarea 
                    className="form-control" 
                    id="labDesc" 
                    rows="4"
                    name="descricao"
                    value={labForm.descricao}
                    onChange={handleLabFormChange}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="labLoc" className="form-label">Localização</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="labLoc"
                    name="localizacao"
                    value={labForm.localizacao}
                    onChange={handleLabFormChange}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="labOpen" className="form-label">Horário de Abertura</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      id="labOpen"
                      name="horarioAbertura"
                      value={labForm.horarioAbertura}
                      onChange={handleLabFormChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="labClose" className="form-label">Horário de Fechamento</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      id="labClose"
                      name="horarioFechamento"
                      value={labForm.horarioFechamento}
                      onChange={handleLabFormChange}
                    />
                  </div>
                </div>
                <div className="btn-group" role="group">
                  <button 
                    type="button"
                    className="btn btn-success"
                    onClick={handleSaveLab}
                  >
                    <BiCheck className="me-2" />
                    Salvar
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingLab(false)}
                  >
                    <BiX className="me-2" />
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===== ABA: EQUIPAMENTOS ===== */}
      {activeTab === 'equipment' && (
        <div>
          <div className="mb-3">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingEquipment(true);
                setEditingEquipmentId(null);
                setEquipmentForm({ nome: '', descricao: '', quantidade: 1 });
              }}
            >
              <BiPlus className="me-2" />
              Adicionar Equipamento
            </button>
          </div>

          {editingEquipment && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">
                  {editingEquipmentId ? 'Editar Equipamento' : 'Novo Equipamento'}
                </h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="equipName" className="form-label">Nome *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="equipName"
                      name="nome"
                      value={equipmentForm.nome}
                      onChange={handleEquipmentFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="equipDesc" className="form-label">Descrição</label>
                    <textarea 
                      className="form-control" 
                      id="equipDesc" 
                      rows="3"
                      name="descricao"
                      value={equipmentForm.descricao}
                      onChange={handleEquipmentFormChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="equipQty" className="form-label">Quantidade</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="equipQty"
                      name="quantidade"
                      min="1"
                      value={equipmentForm.quantidade}
                      onChange={handleEquipmentFormChange}
                    />
                  </div>
                  <div className="btn-group" role="group">
                    <button 
                      type="button"
                      className="btn btn-success"
                      onClick={editingEquipmentId ? handleUpdateEquipment : handleAddEquipment}
                    >
                      <BiCheck className="me-2" />
                      {editingEquipmentId ? 'Atualizar' : 'Adicionar'}
                    </button>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEditEquipment}
                    >
                      <BiX className="me-2" />
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {equipment.length > 0 ? (
            <div className="list-group">
              {equipment.map(equip => (
                <div key={equip._id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{equip.nome}</h6>
                      {equip.descricao && (
                        <p className="mb-1 text-muted">
                          <small>{equip.descricao}</small>
                        </p>
                      )}
                      <p className="mb-0 text-muted">
                        <small>📦 Quantidade: {equip.quantidade}</small>
                      </p>
                    </div>
                    <div className="ms-3">
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEditEquipment(equip)}
                        title="Editar"
                      >
                        <BiEdit />
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteEquipment(equip._id)}
                        title="Deletar"
                      >
                        <BiTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              Nenhum equipamento registrado. Clique em "Adicionar Equipamento" para começar.
            </div>
          )}
        </div>
      )}

      {/* ===== ABA: DATAS BLOQUEADAS ===== */}
      {activeTab === 'blocked-dates' && (
        <div>
          <div className="mb-3">
            <button 
              className="btn btn-primary"
              onClick={() => setBlockingDate(true)}
            >
              <BiPlus className="me-2" />
              Bloquear Data
            </button>
          </div>

          {blockingDate && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Bloquear Data</h5>
                <form>
                  <div className="mb-3">
                    <label htmlFor="blockDate" className="form-label">Data *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="blockDate"
                      name="data"
                      value={blockDateForm.data}
                      onChange={handleBlockDateFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="blockMotive" className="form-label">Motivo *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="blockMotive"
                      name="motivo"
                      placeholder="Ex: Manutenção, Feriado, Evento especial"
                      value={blockDateForm.motivo}
                      onChange={handleBlockDateFormChange}
                      required
                    />
                  </div>
                  <div className="btn-group" role="group">
                    <button 
                      type="button"
                      className="btn btn-success"
                      onClick={handleBlockDate}
                    >
                      <BiCheck className="me-2" />
                      Bloquear
                    </button>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setBlockingDate(false);
                        setBlockDateForm({ data: '', motivo: '' });
                      }}
                    >
                      <BiX className="me-2" />
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {blockedDates.length > 0 ? (
            <div className="list-group">
              {blockedDates.map((blocked, idx) => (
                <div key={idx} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        📅 {new Date(blocked.data || blocked).toLocaleDateString('pt-BR')}
                      </h6>
                      {blocked.motivo && (
                        <p className="mb-0 text-muted">
                          <small>{blocked.motivo}</small>
                        </p>
                      )}
                    </div>
                    <div className="ms-3">
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleUnblockDate(blocked.data || blocked)}
                        title="Desbloquear"
                      >
                        <BiTrash /> Desbloquear
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              Nenhuma data bloqueada. Clique em "Bloquear Data" para adicionar uma.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLabDashboard;
