import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import labService from '../services/labService';
import appointmentLabService from '../services/appointmentLabService';
import equipmentService from '../services/equipmentService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './LabProfile.css';

const localizer = momentLocalizer(moment);

const LabProfile = () => {
  const { id: labId } = useParams();
  const { user } = useAuth();
  const [lab, setLab] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [blockedDates, setBlockedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [blockedDateAlert, setBlockedDateAlert] = useState(null);
  const [formData, setFormData] = useState({
    datas: [],
    horarioInicio: '08:00',
    horarioFim: '09:00',
    observacoes: ''
  });

  useEffect(() => {
    fetchLabData();
  }, [labId]);

  // Atualizar visual dos dias selecionados no calendário
  useEffect(() => {
    // Pequeño delay para garantir que o DOM foi atualizado
    const timer = setTimeout(() => {
      // Remover destaque anterior de todos os dias
      const allDateCells = document.querySelectorAll('.rbc-date-cell');
      allDateCells.forEach(cell => {
        cell.classList.remove('selected-date');
      });

      // Obter o mês/ano atual do calendário
      const toolbarLabel = document.querySelector('.rbc-toolbar-label');
      if (!toolbarLabel) return;

      const labelText = toolbarLabel.textContent; // Ex: "January 2026"
      const [monthStr, yearStr] = labelText.split(' ');
      
      // Mapear nome do mês para número
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const currentMonth = monthNames.indexOf(monthStr); // 0-11
      const currentYear = parseInt(yearStr);

      console.log('Calendário exibindo:', { mês: monthStr, monthNum: currentMonth, year: currentYear });
      console.log('Datas selecionadas:', formData.datas);

      // Adicionar destaque aos dias selecionados
      formData.datas.forEach(dateStr => {
        // dateStr é YYYY-MM-DD
        const [yearStr, monthStr, dayStr] = dateStr.split('-');
        const selectedMonth = parseInt(monthStr) - 1; // Converter para 0-11
        const selectedYear = parseInt(yearStr);
        const selectedDay = parseInt(dayStr);

        console.log('Processando data:', { dateStr, selectedDay, selectedMonth, selectedYear });

        // Só destacar se for o mês/ano atual do calendário
        if (selectedMonth === currentMonth && selectedYear === currentYear) {
          allDateCells.forEach(cell => {
            const button = cell.querySelector('.rbc-button-link');
            const isOffRange = cell.classList.contains('rbc-off-range');
            
            if (button && !isOffRange) {
              const dayText = parseInt(button.textContent);
              if (dayText === selectedDay) {
                console.log('Marcando dia:', selectedDay);
                cell.classList.add('selected-date');
              }
            }
          });
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [formData.datas]);

  const fetchLabData = async () => {
    try {
      setLoading(true);
      const labData = await labService.getLabById(labId);
      setLab(labData);

      const equipData = await equipmentService.getLabEquipment(labId);
      setEquipment(equipData);

      // Buscar datas bloqueadas
      const blockedDaysData = await labService.getBlockedDays(labId);
      // Criar um mapa com as datas bloqueadas e seus motivos
      const blockedMap = {};
      if (blockedDaysData && Array.isArray(blockedDaysData)) {
        blockedDaysData.forEach(item => {
          if (item.data) {
            const date = new Date(item.data);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            blockedMap[key] = item.motivo || 'Laboratório indisponível';
          }
        });
      }
      setBlockedDates(blockedMap);
    } catch (err) {
      setError(err.message || 'Erro ao buscar dados do laboratório');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (slotInfo) => {
    try {
      // Garantir que temos um objeto de data válido
      let date;
      
      if (slotInfo && slotInfo.start) {
        // Se start é uma string, converter para Date
        if (typeof slotInfo.start === 'string') {
          date = new Date(slotInfo.start);
        } else {
          // Se já é um objeto Date, usar diretamente
          date = new Date(slotInfo.start.getTime());
        }
      } else {
        console.error('slotInfo.start inválido:', slotInfo);
        return;
      }

      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', slotInfo.start);
        setError('Data inválida selecionada');
        return;
      }

      // Usar getFullYear, getMonth, getDate para evitar problemas de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      console.log('Data selecionada:', { original: slotInfo.start, convertida: dateStr, dayOfMonth: date.getDate() });

      // Verificar se a data está bloqueada
      if (blockedDates[dateStr]) {
        setBlockedDateAlert({
          date: dateStr,
          formattedDate: date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          reason: blockedDates[dateStr]
        });
        setError(null);
        return;
      } else {
        setBlockedDateAlert(null);
      }

      setFormData(prev => {
        const newDatas = prev.datas.includes(dateStr)
          ? prev.datas.filter(d => d !== dateStr)
          : [...prev.datas, dateStr];
        return { ...prev, datas: newDatas.sort() };
      });
    } catch (err) {
      console.error('Erro ao selecionar data:', err);
      setError('Erro ao selecionar a data');
    }
  };

  const openModal = () => {
    // Preservar datas selecionadas no calendário, resetar apenas outros campos
    setFormData(prev => ({
      ...prev,
      horarioInicio: '08:00',
      horarioFim: '09:00',
      observacoes: ''
    }));
    setSelectedEquipment([]);
    setShowModal(true);
  };

  const closeModal = () => {
    // Limpar dados ao fechar o modal
    setFormData({
      datas: [],
      horarioInicio: '08:00',
      horarioFim: '09:00',
      observacoes: ''
    });
    setSelectedEquipment([]);
    setShowModal(false);
  };

  const handleEquipmentToggle = (equipId) => {
    setSelectedEquipment(prev =>
      prev.includes(equipId)
        ? prev.filter(id => id !== equipId)
        : [...prev, equipId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.datas.length) {
      setError('Selecione pelo menos um dia');
      return;
    }

    try {
      await appointmentLabService.createAppointment(labId, {
        labId: labId,
        datas: formData.datas.map(d => new Date(d)),
        horarioInicio: formData.horarioInicio,
        horarioFim: formData.horarioFim,
        equipmentIds: selectedEquipment,
        observacoes: formData.observacoes
      });

      setSuccess('Agendamento enviado com sucesso! Você será notificado sobre a confirmação.');
      setShowModal(false);
      setFormData({ datas: [], horarioInicio: '08:00', horarioFim: '09:00', observacoes: '' });
      setSelectedEquipment([]);

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || 'Erro ao criar agendamento');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lab) return <MessageAlert message="Laboratório não encontrado" type="error" />;

  return (
    <div className="lab-profile">
      <div className="lab-profile-header">
        {lab.fotoUrl && (
          <img src={lab.fotoUrl} alt={lab.nome} className="lab-profile-image" />
        )}
        <div className="lab-profile-info">
          <h1>{lab.nome}</h1>
          <p className="lab-location">📍 {lab.localizacao}</p>
          <p className="lab-description">{lab.descricao}</p>
          <div className="lab-hours">
            <span>⏰ {lab.horarioAbertura} - {lab.horarioFechamento}</span>
          </div>
        </div>
      </div>

      {error && <MessageAlert message={error} type="error" />}
      {success && <MessageAlert message={success} type="success" />}

      {/* Equipamentos */}
      <div className="lab-equipment-section">
        <h2>🔧 Equipamentos Disponíveis</h2>
        <div className="equipment-grid">
          {equipment.length > 0 ? (
            equipment.map(eq => (
              <div key={eq._id} className="equipment-card">
                <h3>{eq.nome}</h3>
                <p>{eq.descricao}</p>
                <small>Quantidade: {eq.quantidade}</small>
              </div>
            ))
          ) : (
            <p>Nenhum equipamento cadastrado</p>
          )}
        </div>
      </div>

      {/* Calendário */}
      <div className="lab-calendar-section">
        <h2>📅 Dias Disponíveis</h2>
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700, minHeight: 700 }}
            onSelectSlot={(slotInfo) => handleDateSelect(slotInfo)}
            selectable
            defaultDate={new Date()}
            views={['month', 'week']}
            defaultView="month"
          />
        </div>
      </div>

      {/* Espaçador */}
      <div style={{ marginBottom: 30 }}></div>

      {/* Botão Agendar */}
      <div className="lab-actions">
        {user ? (
          <button
            onClick={openModal}
            className="btn btn-primary btn-lg"
            type="button"
          >
            Agendar Laboratório
          </button>
        ) : (
          <MessageAlert message="Faça login para agendar" type="info" />
        )}
      </div>

      {/* Modal de Agendamento */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agendar {lab.nome}</h2>
              <button
                className="close-btn"
                onClick={closeModal}
                type="button"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Alerta de Data Bloqueada */}
              {blockedDateAlert && (
                <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
                  <strong>⚠️ Data Indisponível!</strong>
                  <p style={{ marginBottom: '10px', marginTop: '10px' }}>
                    <strong>{blockedDateAlert.formattedDate}</strong> está bloqueada para agendamentos.
                  </p>
                  <p style={{ marginBottom: '0' }}>
                    <strong>Motivo:</strong> {blockedDateAlert.reason}
                  </p>
                </div>
              )}

              {/* Datas selecionadas */}
              <div className="form-group">
                <label>Datas Selecionadas:</label>
                {formData.datas.length > 0 ? (
                  <ul className="dates-list">
                    {formData.datas.map(d => (
                      <li key={d}>
                        {formatDate(d)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Clique no calendário para selecionar datas</p>
                )}
              </div>

              {/* Horários */}
              <div className="form-row">
                <div className="form-group">
                  <label>Horário de Início:</label>
                  <input
                    type="time"
                    value={formData.horarioInicio}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      horarioInicio: e.target.value
                    }))}
                    min="08:00"
                    max="18:00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Horário de Término:</label>
                  <input
                    type="time"
                    value={formData.horarioFim}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      horarioFim: e.target.value
                    }))}
                    min="08:00"
                    max="18:00"
                    required
                  />
                </div>
              </div>

              {/* Equipamentos */}
              <div className="form-group">
                <label>Equipamentos a Usar:</label>
                <div className="equipment-checkboxes">
                  {equipment.map(eq => (
                    <label key={eq._id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(eq._id)}
                        onChange={() => handleEquipmentToggle(eq._id)}
                      />
                      {eq.nome}
                    </label>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div className="form-group">
                <label>Observações (opcional):</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    observacoes: e.target.value
                  }))}
                  rows="3"
                  placeholder="Ex: Preparar amostras, necessário treinamento..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Enviar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabProfile;
