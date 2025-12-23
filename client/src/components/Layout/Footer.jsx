import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Sistema de Agendamento</h5>
            <p className="mb-0">Desenvolvido como projeto final de arquitetura web.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              © {new Date().getFullYear()} - Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;