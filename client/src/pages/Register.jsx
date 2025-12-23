import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MessageAlert from '../components/Common/MessageAlert';
import { BiUser, BiEnvelope, BiLock, BiPhone } from 'react-icons/bi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await register(formData);
    
    if (result.success) {
      setSuccess('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Criar Nova Conta</h2>
            
            {error && (
              <MessageAlert type="error" message={error} onClose={() => setError('')} />
            )}
            
            {success && (
              <MessageAlert type="success" message={success} />
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
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
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
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
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">
                    <BiLock className="me-2" />
                    Senha
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    minLength="6"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
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
              </div>

              <div className="mb-4">
                <label htmlFor="role" className="form-label">
                  Tipo de Conta
                </label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="client">Cliente</option>
                  <option value="professional">Profissional</option>
                  <option value="admin">Administrador</option>
                </select>
                <small className="form-text text-muted">
                  * Apenas administradores podem criar contas de administrador
                </small>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="mb-0">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary text-decoration-none">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;