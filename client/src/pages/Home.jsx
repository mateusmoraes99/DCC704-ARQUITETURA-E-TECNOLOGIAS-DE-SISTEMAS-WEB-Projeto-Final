import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiCalendarCheck, BiClipboard, BiUserCheck, BiStar } from 'react-icons/bi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero bg-primary text-white py-5 rounded mb-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">
            Sistema de Agendamento Online
          </h1>
          <p className="lead mb-4">
            Agende serviços de forma rápida e fácil. Gerencie sua agenda em um só lugar.
          </p>
          {!isAuthenticated ? (
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/register" className="btn btn-light btn-lg">
                Começar Agora
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Entrar
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="btn btn-light btn-lg">
              Ir para Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features mb-5">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <BiCalendarCheck className="display-4 text-primary mb-3" />
                <h4 className="card-title">Agendamento Fácil</h4>
                <p className="card-text">
                  Agende serviços em poucos cliques. Escolha data, horário e profissional.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <BiClipboard className="display-4 text-primary mb-3" />
                <h4 className="card-title">Gestão Completa</h4>
                <p className="card-text">
                  Gerencie serviços, profissionais e agendamentos em um painel intuitivo.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <BiUserCheck className="display-4 text-primary mb-3" />
                <h4 className="card-title">Multi-perfil</h4>
                <p className="card-text">
                  Diferentes tipos de usuário: cliente, profissional e administrador.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <BiStar className="display-4 text-primary mb-3" />
                <h4 className="card-title">Totalmente Grátis</h4>
                <p className="card-text">
                  Sistema completo sem custos. Ideal para pequenos negócios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta bg-light py-5 rounded text-center">
        <div className="container">
          <h2 className="mb-4">Pronto para começar?</h2>
          <p className="lead mb-4">
            Cadastre-se gratuitamente e descubra como podemos ajudar seu negócio.
          </p>
          {!isAuthenticated ? (
            <Link to="/register" className="btn btn-primary btn-lg px-5">
              Cadastrar Agora
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-lg px-5">
              Ver Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;