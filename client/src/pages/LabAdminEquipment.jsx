import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import equipmentService from '../services/equipmentService';
import labService from '../services/labService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import './LabAdminEquipment.css';

const LabAdminEquipment = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lab, setLab] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidade: 1,
    ativo: true
  });

  useEffect(() => {
    fetchData();
  }, [labId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const labData = await labService.getLabById(labId);

      // Verificar se é admin do lab
      if (labData.adminId._id !== user.id) {
        navigate('/');
        return;
      }

      setLab(labData);
      const equipData = await equipmentService.getLabEquipment(labId);
      setEquipment(equipData);
    } catch (err) {
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'quantidade' ? parseInt(value) : value)
    }));
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      quantidade: 1,
      ativo: true
    });
    setEditingId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        nome: item.nome,
        descricao: item.descricao,
        quantidade: item.quantidade,
        ativo: item.ativo
      });
      setEditingId(item._id);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      setError('Nome do equipamento é obrigatório');
      return;
    }

    try {
      if (editingId) {
        // Editar
        await equipmentService.updateEquipment(editingId, formData);
        setSuccess('Equipamento atualizado com sucesso!');
      } else {
        // Criar novo
        await equipmentService.createEquipment(labId, formData);
        setSuccess('Equipamento adicionado com sucesso!');
      }

      handleCloseModal();
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao salvar equipamento');
    }
  };

  const handleDelete = async (equipId) => {
    if (window.confirm('Tem certeza que deseja deletar este equipamento?')) {
      try {
        await equipmentService.deleteEquipment(equipId);
        setSuccess('Equipamento deletado com sucesso!');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Erro ao deletar equipamento');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lab) return <MessageAlert message="Laboratório não encontrado" type="error" />;

  return (
    <div className="lab-admin-equipment">
      <div className="equipment-header">
        <button className="btn-back" onClick={() => navigate(`/lab-admin/${labId}`)}>
          ← Voltar
        </button>
        <h1>🔧 Gerenciar Equipamentos</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          ➕ Adicionar Equipamento
        </button>
      </div>

      {error && <MessageAlert message={error} type="error" />}
      {success && <MessageAlert message={success} type="success" />}

      {equipment.length === 0 ? (
        <div className="empty-state">
          <p>📭 Nenhum equipamento cadastrado</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            ➕ Adicionar o Primeiro Equipamento
          </button>
        </div>
      ) : (
        <div className="equipment-grid">
          {equipment.map(item => (
            <div key={item._id} className="equipment-card">
              <div className="card-header">
                <h3>{item.nome}</h3>
                {!item.ativo && <span className="badge-inactive">Inativo</span>}
              </div>

              <p className="card-description">{item.descricao || 'Sem descrição'}</p>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Quantidade:</span>
                  <span className="value">{item.quantidade}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status ${item.ativo ? 'active' : 'inactive'}`}>
                    {item.ativo ? '✓ Ativo' : '✗ Inativo'}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleOpenModal(item)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(item._id)}
                >
                  🗑️ Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? '✏️ Editar Equipamento' : '➕ Novo Equipamento'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nome">Nome do Equipamento:</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  minLength="2"
                  maxLength="100"
                  placeholder="Ex: Microscópio Eletrônico"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição:</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="500"
                  placeholder="Detalhes sobre o equipamento"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantidade">Quantidade:</label>
                <input
                  type="number"
                  id="quantidade"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="999"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleInputChange}
                  />
                  <span>Equipamento Ativo</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? '💾 Atualizar' : '✓ Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabAdminEquipment;
