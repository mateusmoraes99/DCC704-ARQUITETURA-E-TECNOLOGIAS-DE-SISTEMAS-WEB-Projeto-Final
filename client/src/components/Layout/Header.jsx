import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BiCalendar, BiUser, BiLogOut, BiLogIn, BiUserPlus, BiAdjust } from 'react-icons/bi';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <BiCalendar className="me-2" size={24} />
          AgendaFácil
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated ? (
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
              
              {/* Labs - disponível para todos */}
              <li className="nav-item">
                <Link to="/labs" className="nav-link">
                  🔬 Laboratórios
                </Link>
              </li>

              {/* Meus Agendamentos em Labs */}
              <li className="nav-item">
                <Link to="/my-lab-appointments" className="nav-link">
                  📅 Meus Agendamentos em Labs
                </Link>
              </li>
              
              {/* Lab Admin - apenas para labAdmin */}
              {user?.role === 'labAdmin' && (
                <li className="nav-item">
                  <Link to="/my-lab" className="nav-link">
                    ⚙️ Meu Lab
                  </Link>
                </li>
              )}
              
              {isAdmin && (
                <li className="nav-item">
                  <Link to="/admin/dashboard" className="nav-link">
                    <BiAdjust className="me-1" />
                    Admin
                  </Link>
                </li>
              )}
              
              <li className="nav-item">
                <Link to="/services" className="nav-link">
                  Serviços
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/appointments" className="nav-link">
                  Agendamentos
                </Link>
              </li>
              <li className="nav-item dropdown">
                <button 
                  className="nav-link dropdown-toggle d-flex align-items-center btn btn-link p-0 border-0"
                  id="navbarDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <BiUser className="me-1" />
                  {user?.name}
                </button>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      Perfil
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item text-danger"
                    >
                      <BiLogOut className="me-1" />
                      Sair
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav ms-auto">
              {/* Labs - visível mesmo sem autenticação */}
              <li className="nav-item">
                <Link to="/labs" className="nav-link">
                  🔬 Laboratórios
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="btn btn-primary me-2">
                  <BiLogIn className="me-1" />
                  Entrar
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="btn btn-outline-primary">
                  <BiUserPlus className="me-1" />
                  Cadastrar
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;