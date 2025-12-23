import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { serviceService } from '../services';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageAlert from '../components/Common/MessageAlert';
import { BiPlus, BiPencil, BiTrash, BiFilter } from 'react-icons/bi';

const Services = () => {
  const { isAdmin } = useAuth(); // Removido 'user' não usado
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Removido showForm e editingService que não estavam sendo usados

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const result = await serviceService.getServices();
      setServices(result.data || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar serviços');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await serviceService.getCategories();
      setCategories(result.data || []);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    try {
      await serviceService.deleteService(id);
      setServices(services.filter(service => service._id !== id));
      setSuccess('Serviço excluído com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao excluir serviço');
    }
  };

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(service => service.category === filter);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Serviços</h1>
          <p className="text-muted mb-0">
            {filteredServices.length} serviço(s) encontrado(s)
          </p>
        </div>
        
        {isAdmin && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              // Aqui você pode implementar a lógica para abrir formulário
              alert('Funcionalidade de adicionar serviço será implementada!');
            }}
          >
            <BiPlus className="me-1" />
            Novo Serviço
          </button>
        )}
      </div>

      {error && (
        <MessageAlert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <MessageAlert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <BiFilter className="me-2" />
            <strong className="me-3">Filtrar por categoria:</strong>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                Todos
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`btn ${filter === category ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter(category)}
                >
                  {category === 'haircut' && 'Corte'}
                  {category === 'beard' && 'Barba'}
                  {category === 'coloring' && 'Coloração'}
                  {category === 'consultation' && 'Consulta'}
                  {category === 'other' && 'Outros'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="row">
        {filteredServices.map(service => (
          <div key={service._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title">{service.name}</h5>
                  <span className={`badge ${
                    service.isActive ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {service.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <p className="card-text text-muted">
                  {service.description || 'Sem descrição'}
                </p>
                
                <div className="mb-3">
                  <span className="badge bg-info me-2">
                    {service.category === 'haircut' && 'Corte'}
                    {service.category === 'beard' && 'Barba'}
                    {service.category === 'coloring' && 'Coloração'}
                    {service.category === 'consultation' && 'Consulta'}
                    {service.category === 'other' && 'Outros'}
                  </span>
                  <span className="badge bg-light text-dark">
                    {service.duration} minutos
                  </span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="text-primary mb-0">
                    R$ {service.price.toFixed(2)}
                  </h4>
                  
                  {isAdmin && (
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          // Aqui você pode implementar a lógica de edição
                          alert(`Editar serviço: ${service.name}`);
                        }}
                      >
                        <BiPencil />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(service._id)}
                      >
                        <BiTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-5">
          <div className="display-1 text-muted mb-3">📋</div>
          <h4>Nenhum serviço encontrado</h4>
          <p className="text-muted">
            {filter === 'all' 
              ? 'Não há serviços cadastrados no sistema.'
              : `Não há serviços na categoria "${filter}".`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Services;