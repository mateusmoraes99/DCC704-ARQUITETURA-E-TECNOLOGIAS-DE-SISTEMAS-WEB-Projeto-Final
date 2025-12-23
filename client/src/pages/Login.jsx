import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiEnvelope, BiLock } from 'react-icons/bi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Entrar no Sistema</h2>
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show">
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError('')}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  <BiEnvelope className="me-2" />
                  E-mail
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  <BiLock className="me-2" />
                  Senha
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Carregando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="mb-0">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-primary text-decoration-none">
                  Cadastre-se
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-light rounded">
              <p className="mb-2 small text-muted">Credenciais para teste:</p>
              <div className="small">
                <p className="mb-1">
                  <strong>Admin:</strong> admin@agendamento.com / senha123
                </p>
                <p className="mb-0">
                  <strong>Cliente:</strong> cliente@agendamento.com / senha123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;