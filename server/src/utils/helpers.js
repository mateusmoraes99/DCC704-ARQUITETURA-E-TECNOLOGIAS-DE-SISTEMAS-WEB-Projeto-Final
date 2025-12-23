// src/utils/helpers.js
const moment = require('moment');

// Formatar data para exibição
const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

// Formatar hora
const formatTime = (time) => {
  return moment(time, 'HH:mm').format('HH:mm');
};

// Calcular hora de término
const calculateEndTime = (startTime, durationMinutes) => {
  return moment(startTime, 'HH:mm')
    .add(durationMinutes, 'minutes')
    .format('HH:mm');
};

// Verificar se data está no futuro
const isFutureDate = (date) => {
  return moment(date).isAfter(moment().startOf('day'));
};

// Verificar conflito de horário
const hasTimeConflict = (existingSlots, newStart, newEnd) => {
  const newStartTime = moment(newStart, 'HH:mm');
  const newEndTime = moment(newEnd, 'HH:mm');
  
  return existingSlots.some(slot => {
    const slotStart = moment(slot.startTime, 'HH:mm');
    const slotEnd = moment(slot.endTime, 'HH:mm');
    
    return (newStartTime.isBetween(slotStart, slotEnd, null, '[)') ||
            newEndTime.isBetween(slotStart, slotEnd, null, '(]') ||
            slotStart.isBetween(newStartTime, newEndTime, null, '[)'));
  });
};

// Gerar slots de tempo
const generateTimeSlots = (startHour = 8, endHour = 18, interval = 30) => {
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }
  }
  
  return slots;
};

// Filtrar dados sensíveis do usuário
const sanitizeUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  const { password, __v, ...sanitized } = userObj;
  
  return sanitized;
};

module.exports = {
  formatDate,
  formatTime,
  calculateEndTime,
  isFutureDate,
  hasTimeConflict,
  generateTimeSlots,
  sanitizeUser
};