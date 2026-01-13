import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import labService from '../services/labService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import './CreateLab.css';

const CreateLab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    localizacao: '',
    horarioAbertura: '08:00',
    horarioFechamento: '18:00',
    diasFuncionamento: ['segunda', 'terça', 'quarta', 'quinta', 'sexta']
  });

  useEffect(() => {
    // Verificar se usuário é admin
    if (!user || (user.role !== 'admin' && user.role !== 'labAdmin')) {
      setError('Acesso negado. Apenas administradores podem criar laboratórios.');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiaChange = (dia) => {
    setFormData(prev => ({
      ...prev,
      diasFuncionamento: prev.diasFuncionamento.includes(dia)
        ? prev.diasFuncionamento.filter(d => d !== dia)
        : [...prev.diasFuncionamento, dia]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      setError('Nome do laboratório é obrigatório');
      return;
    }

    if (!formData.localizacao.trim()) {
      setError('Localização é obrigatória');
      return;
    }

    if (formData.diasFuncionamento.length === 0) {
      setError('Selecione pelo menos um dia de funcionamento');
      return;
    }

    try {
      setLoading(true);
      
      // Criar FormData para suportar upload de arquivo
      const labFormData = new FormData();
      labFormData.append('nome', formData.nome);
      labFormData.append('descricao', formData.descricao);
      labFormData.append('localizacao', formData.localizacao);
      labFormData.append('adminId', user._id);
      labFormData.append('horarioAbertura', formData.horarioAbertura);
      labFormData.append('horarioFechamento', formData.horarioFechamento);
      formData.diasFuncionamento.forEach(dia => {
        labFormData.append('diasFuncionamento', dia);
      });

      const response = await labService.createLab(labFormData);

      setSuccess('Laboratório criado com sucesso!');
      setTimeout(() => {
        navigate(`/lab-admin/${response.lab._id}`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao criar laboratório');
    } finally {
      setLoading(false);
    }
  };

  const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">🏢 Criar Novo Laboratório</h2>
            </div>

            <div className="card-body p-4">
              {error && (
                <MessageAlert type="error" message={error} onClose={() => setError(null)} />
              )}

              {success && (
                <MessageAlert type="success" message={success} onClose={() => setSuccess(null)} />
              )}

              {loading ? (
                <LoadingSpinner />
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Nome do Laboratório */}
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">
                      Nome do Laboratório *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder="Ex: Laboratório de Química Analítica"
                      required
                    />
                    <small className="text-muted">
                      Nome que identificará seu laboratório
                    </small>
                  </div>

                  {/* Descrição */}
                  <div className="mb-3">
                    <label htmlFor="descricao" className="form-label">
                      Descrição
                    </label>
                    <textarea
                      className="form-control"
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Descreva seu laboratório, equipamentos disponíveis, especialidades, etc."
                      maxLength="1000"
                    />
                    <small className="text-muted">
                      {formData.descricao.length}/1000 caracteres
                    </small>
                  </div>

                  {/* Localização */}
                  <div className="mb-3">
                    <label htmlFor="localizacao" className="form-label">
                      Localização *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="localizacao"
                      name="localizacao"
                      value={formData.localizacao}
                      onChange={handleInputChange}
                      placeholder="Ex: Prédio A, Sala 101"
                      required
                    />
                    <small className="text-muted">
                      Localização exata dentro da instituição
                    </small>
                  </div>

                  {/* Horários */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="horarioAbertura" className="form-label">
                        Horário de Abertura
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        id="horarioAbertura"
                        name="horarioAbertura"
                        value={formData.horarioAbertura}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="horarioFechamento" className="form-label">
                        Horário de Fechamento
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        id="horarioFechamento"
                        name="horarioFechamento"
                        value={formData.horarioFechamento}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Dias de Funcionamento */}
                  <div className="mb-4">
                    <label className="form-label">
                      Dias de Funcionamento *
                    </label>
                    <div className="dias-funcionamento">
                      {diasSemana.map(dia => (
                        <label key={dia} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.diasFuncionamento.includes(dia)}
                            onChange={() => handleDiaChange(dia)}
                          />
                          <span className="capitalize">
                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                    <small className="text-muted d-block mt-2">
                      Selecione os dias em que o laboratório funcionará
                    </small>
                  </div>

                  {/* Botões */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg flex-grow-1"
                      disabled={loading}
                    >
                      {loading ? 'Criando...' : '✓ Criar Laboratório'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-lg"
                      onClick={() => navigate('/labs')}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Informações adicionais */}
                  <div className="alert alert-info mt-4" role="alert">
                    <h6 className="alert-heading">ℹ️ Próximos Passos</h6>
                    <ul className="mb-0">
                      <li>Após criar o laboratório, você poderá adicionar equipamentos</li>
                      <li>Configure datas bloqueadas para feriados e manutenção</li>
                      <li>Aproveite para adicionar fotos dos equipamentos e espaços</li>
                      <li>Você receberá notificações de novos agendamentos para confirmação</li>
                    </ul>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLab;
