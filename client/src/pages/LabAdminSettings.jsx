import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import labService from '../services/labService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import './LabAdminSettings.css';

const LabAdminSettings = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    localizacao: '',
    horarioAbertura: '08:00',
    horarioFechamento: '18:00',
    ativo: true
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    fetchLab();
  }, [labId]);

  const fetchLab = async () => {
    try {
      setLoading(true);
      const data = await labService.getLabById(labId);
      
      if (data.adminId._id !== user.id) {
        navigate('/');
        return;
      }

      setLab(data);
      setFormData({
        nome: data.nome,
        descricao: data.descricao,
        localizacao: data.localizacao,
        horarioAbertura: data.horarioAbertura,
        horarioFechamento: data.horarioFechamento,
        ativo: data.ativo
      });
      
      if (data.fotoUrl) {
        setFotoPreview(data.fotoUrl);
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar laboratório');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.nome);
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('localizacao', formData.localizacao);
      formDataToSend.append('horarioAbertura', formData.horarioAbertura);
      formDataToSend.append('horarioFechamento', formData.horarioFechamento);
      formDataToSend.append('ativo', formData.ativo);

      if (fotoFile) {
        formDataToSend.append('foto', fotoFile);
      }

      await labService.updateLab(labId, formDataToSend);
      setSuccess('Laboratório atualizado com sucesso!');
      fetchLab();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar laboratório');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lab) return <MessageAlert message="Laboratório não encontrado" type="error" />;

  return (
    <div className="lab-admin-settings">
      <div className="settings-header">
        <button className="btn-back" onClick={() => navigate(`/lab-admin/${labId}`)}>
          ← Voltar
        </button>
        <h1>⚙️ Configurações do Laboratório</h1>
      </div>

      {error && <MessageAlert message={error} type="error" />}
      {success && <MessageAlert message={success} type="success" />}

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Foto */}
        <div className="form-section">
          <h2>Foto do Laboratório</h2>
          
          <div className="foto-section">
            <div className="foto-preview">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" />
              ) : (
                <div className="no-foto">📷 Nenhuma foto</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="foto">Escolher Foto:</label>
              <input
                type="file"
                id="foto"
                accept="image/*"
                onChange={handleFotoChange}
                className="file-input"
              />
              <small>Formatos: JPG, PNG, GIF (máx 5MB)</small>
            </div>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="form-section">
          <h2>Informações Básicas</h2>

          <div className="form-group">
            <label htmlFor="nome">Nome do Laboratório:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              minLength="3"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="localizacao">Localização:</label>
            <input
              type="text"
              id="localizacao"
              name="localizacao"
              value={formData.localizacao}
              onChange={handleInputChange}
              required
              placeholder="Ex: Bloco C - Sala 205, CCS"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição:</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              rows="4"
              maxLength="1000"
              placeholder="Descreva o laboratório, equipamentos e finalidade"
            />
            <small>{formData.descricao.length}/1000 caracteres</small>
          </div>
        </div>

        {/* Horários */}
        <div className="form-section">
          <h2>Horários de Funcionamento</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="horarioAbertura">Abertura:</label>
              <input
                type="time"
                id="horarioAbertura"
                name="horarioAbertura"
                value={formData.horarioAbertura}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="horarioFechamento">Fechamento:</label>
              <input
                type="time"
                id="horarioFechamento"
                name="horarioFechamento"
                value={formData.horarioFechamento}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <small className="info-text">
            ⏰ Horários fixos: {formData.horarioAbertura} - {formData.horarioFechamento}
          </small>
        </div>

        {/* Status */}
        <div className="form-section">
          <h2>Status</h2>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleInputChange}
              />
              <span>Laboratório Ativo</span>
            </label>
            <small className="info-text">
              Se desmarcado, o lab não aparecerá na busca de laboratórios
            </small>
          </div>
        </div>

        {/* Botões */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/lab-admin/${labId}`)}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            💾 Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabAdminSettings;
