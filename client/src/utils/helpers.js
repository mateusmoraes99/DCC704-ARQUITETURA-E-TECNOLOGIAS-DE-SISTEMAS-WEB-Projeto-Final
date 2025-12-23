// Formatar data para exibição
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Formatar hora
  export const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };
  
  // Formatar preço
  export const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Formatar duração
  export const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };
  
  // Verificar se é admin
  export const isAdmin = (user) => {
    return user?.role === 'admin';
  };
  
  // Verificar se é profissional
  export const isProfessional = (user) => {
    return user?.role === 'professional';
  };
  
  // Verificar se é cliente
  export const isClient = (user) => {
    return user?.role === 'client';
  };