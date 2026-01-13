/**
 * Utilitário para formatar datas de forma confiável
 * Lida com diferentes formatos de data retornados pelo servidor
 */

/**
 * Parse de data seguro que lida com strings ISO, objetos Date, e formatos MongoDB
 * @param {string|Date|Object} dateValue - Valor da data em diversos formatos
 * @returns {Date|null} - Objeto Date ou null se inválido
 */
export const safeParseDate = (dateValue) => {
  try {
    if (!dateValue) return null;

    // Se já for Date válido
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    // String ISO ou formato padrão
    if (typeof dateValue === 'string') {
      // Remover hora e timezone se houver
      const dateStr = dateValue.split('T')[0];
      const [year, month, day] = dateStr.split('-');

      if (!year || !month || !day) {
        return null;
      }

      const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Formato MongoDB com $date
    if (typeof dateValue === 'object' && dateValue.$date) {
      const parsed = new Date(dateValue.$date);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Tentar parse direto
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.error('Erro ao fazer parse da data:', error, dateValue);
    return null;
  }
};

/**
 * Formata data para string em formato local (pt-BR)
 * @param {string|Date|Object} dateValue - Valor da data
 * @param {string} fallback - Valor padrão se a data for inválida
 * @returns {string} - Data formatada em pt-BR ou fallback
 */
export const formatDate = (dateValue, fallback = 'Data inválida') => {
  const date = safeParseDate(dateValue);

  if (!date) {
    return fallback;
  }

  try {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return fallback;
  }
};

/**
 * Formata data para string em formato ISO (YYYY-MM-DD)
 * @param {string|Date|Object} dateValue - Valor da data
 * @returns {string} - Data em formato ISO
 */
export const formatDateISO = (dateValue) => {
  const date = safeParseDate(dateValue);

  if (!date) {
    return null;
  }

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Erro ao formatar data ISO:', error);
    return null;
  }
};

/**
 * Compara duas datas (ignora hora e timezone)
 * @param {string|Date|Object} date1 - Primeira data
 * @param {string|Date|Object} date2 - Segunda data
 * @returns {boolean} - True se as datas são iguais
 */
export const isSameDate = (date1, date2) => {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);

  if (!d1 || !d2) return false;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default {
  safeParseDate,
  formatDate,
  formatDateISO,
  isSameDate
};
