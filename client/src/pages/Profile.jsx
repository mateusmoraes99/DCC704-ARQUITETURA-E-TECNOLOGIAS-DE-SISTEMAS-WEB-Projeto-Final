import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageAlert from '../components/Common/MessageAlert';
import { BiUser, BiEnvelope, BiPhone, BiLock, BiSave } from 'react-icons/bi';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone
      };
      
      updateUserProfile(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2">Meu Perfil</h1>
        <p className="text-muted">Gerencie suas informações pessoais e senha</p>
      </div>

      {error && (
        <MessageAlert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <MessageAlert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px' }}>
                  <BiUser size={48} />
                </div>
              </div>
              <h4 className="card-title">{user.name}</h4>
              <p className="card-text text-muted">{user.email}</p>
              <div className="mb-3">
                <span className={`badge ${
                  user.role === 'admin' ? 'bg-danger' :
                  user.role === 'professional' ? 'bg-warning' : 'bg-primary'
                }`}>
                  {user.role === 'admin' && 'Administrador'}
                  {user.role === 'professional' && 'Profissional'}
                  {user.role === 'client' && 'Cliente'}
                </span>
              </div>
              {user.phone && (
                <p className="card-text">
                  <BiPhone className="me-2" />
                  {user.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    Informações Pessoais
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    Alterar Senha
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="card-body">
              {activeTab === 'info' ? (
                <form onSubmit={handleInfoSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <BiUser className="me-2" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <BiEnvelope className="me-2" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                    <small className="form-text text-muted">
                      O e-mail não pode ser alterado.
                    </small>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="phone" className="form-label">
                      <BiPhone className="me-2" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <BiSave className="me-2" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      <BiLock className="me-2" />
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      <BiLock className="me-2" />
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <BiLock className="me-2" />
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength="6"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Alterando...
                      </>
                    ) : (
                      <>
                        <BiSave className="me-2" />
                        Alterar Senha
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;