// src/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const moment = require('moment');
const {
  sendEmail,
  appointmentCreatedTemplate,
  appointmentConfirmedTemplate,
  appointmentCancelledTemplate,
  newAppointmentForProfessionalTemplate
} = require('../utils/emailService');

// @desc    Obter todos os agendamentos
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { date, professional, status, client } = req.query;
    
    let query = {};
    
    // Filtros baseados no role do usuário
    if (req.user.role === 'client') {
      query.usuarioId = req.user.id;
    } else if (req.user.role === 'professional') {
      query.professional = req.user.id;
    }
    
    // Filtros adicionais
    if (date) {
      const startDate = moment(date).startOf('day').toDate();
      const endDate = moment(date).endOf('day').toDate();
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (professional && (req.user.role === 'admin' || req.user.role === 'professional')) {
      query.professional = professional;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (client && req.user.role === 'admin') {
      query.usuarioId = client;
    }
    // Buscar agendamentos
    const appointments = await Appointment.find(query)
      .populate('usuarioId', 'name email phone')
      .populate('labId', 'nome localizacao')
      .sort({ date: 1, startTime: 1 });
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamentos.'
    });
  }
};

// @desc    Obter agendamento por ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('service', 'name duration price category')
      .populate('professional', 'name email phone');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado.'
      });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && 
        appointment.client._id.toString() !== req.user.id &&
        (!appointment.professional || appointment.professional._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a acessar este agendamento.'
      });
    }
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamento.'
    });
  }
};

// @desc    Criar agendamento
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { service, professional, date, startTime, notes } = req.body;
    
    // Verificar se serviço existe
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    // Verificar se profissional existe (se especificado)
    if (professional) {
      const professionalExists = await User.findById(professional);
      if (!professionalExists || professionalExists.role !== 'professional') {
        return res.status(404).json({
          success: false,
          message: 'Profissional não encontrado.'
        });
      }
    }
    
    // Verificar disponibilidade de horário
    const appointmentDate = moment(date).startOf('day').toDate();
    const existingAppointment = await Appointment.findOne({
      professional: professional || serviceExists.professional,
      date: appointmentDate,
      startTime: startTime,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Horário já reservado.'
      });
    }
    
    // Criar agendamento
    const appointment = await Appointment.create({
      client: req.user.id,
      service,
      professional: professional || serviceExists.professional,
      date: appointmentDate,
      startTime,
      notes
    });
    
    // Popular dados para retorno
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'name email phone')
      .populate('service', 'name duration price')
      .populate('professional', 'name email phone');
    
    // Enviar emails (não bloqueante)
    const dateFormatted = moment(appointment.date).format('DD/MM/YYYY');
    
    // Email para o cliente
    sendEmail(
      populatedAppointment.client.email,
      appointmentCreatedTemplate(
        populatedAppointment.client.name,
        populatedAppointment.service.name,
        dateFormatted,
        appointment.startTime,
        populatedAppointment.professional?.name || 'A ser designado'
      )
    );
    
    // Email para o profissional
    if (populatedAppointment.professional?.email) {
      sendEmail(
        populatedAppointment.professional.email,
        newAppointmentForProfessionalTemplate(
          populatedAppointment.professional.name,
          populatedAppointment.client.name,
          populatedAppointment.service.name,
          dateFormatted,
          appointment.startTime
        )
      );
    }
    
    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar agendamento.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Atualizar agendamento
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { status, notes, date, startTime } = req.body;
    
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado.'
      });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && 
        appointment.client.toString() !== req.user.id &&
        (!appointment.professional || appointment.professional.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a atualizar este agendamento.'
      });
    }
    
    // Apenas admin pode mudar data/hora
    if ((date || startTime) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem alterar data/hora.'
      });
    }
    
    // Atualizar campos permitidos
    const previousStatus = appointment.status;
    const statusChanged = status && status !== previousStatus;
    
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      appointment.status = status;
    }
    
    if (notes !== undefined) appointment.notes = notes;
    if (date) appointment.date = moment(date).startOf('day').toDate();
    if (startTime) appointment.startTime = startTime;
    
    await appointment.save();
    
    // Popular dados para retorno
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'name email phone')
      .populate('service', 'name duration price')
      .populate('professional', 'name email phone');
    
    // Enviar emails quando o status muda (não bloqueante)
    if (statusChanged && populatedAppointment.client?.email) {
      const dateFormatted = moment(appointment.date).format('DD/MM/YYYY');
      
      if (appointment.status === 'confirmed') {
        sendEmail(
          populatedAppointment.client.email,
          appointmentConfirmedTemplate(
            populatedAppointment.client.name,
            populatedAppointment.service.name,
            dateFormatted,
            appointment.startTime
          )
        );
      } else if (appointment.status === 'cancelled') {
        sendEmail(
          populatedAppointment.client.email,
          appointmentCancelledTemplate(
            populatedAppointment.client.name,
            populatedAppointment.service.name,
            dateFormatted,
            appointment.startTime
          )
        );
      }
    }
    
    res.json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar agendamento.'
    });
  }
};

// @desc    Deletar agendamento
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado.'
      });
    }
    
    // Verificar permissão
    if (req.user.role !== 'admin' && appointment.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a deletar este agendamento.'
      });
    }
    
    // Não permitir deletar agendamentos confirmados ou completos
    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar agendamentos confirmados ou completos.'
      });
    }
    
    await appointment.deleteOne();
    
    res.json({
      success: true,
      message: 'Agendamento removido com sucesso.'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar agendamento.'
    });
  }
};

// @desc    Obter horários disponíveis
// @route   GET /api/appointments/available-slots
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { date, serviceId, professionalId } = req.query;
    
    if (!date || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Data e serviço são obrigatórios.'
      });
    }
    
    // Buscar serviço
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado.'
      });
    }
    
    // Definir profissional
    const professional = professionalId || service.professional;
    
    // Buscar agendamentos existentes para o dia
    const appointmentDate = moment(date).startOf('day').toDate();
    const existingAppointments = await Appointment.find({
      professional,
      date: appointmentDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');
    
    // Gerar horários disponíveis (das 08:00 às 18:00, intervalo de 30min)
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    const slotDuration = service.duration || 30; // em minutos
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Verificar conflito com agendamentos existentes
        const isAvailable = !existingAppointments.some(app => {
          const appStart = moment(app.startTime, 'HH:mm');
          const appEnd = moment(app.endTime, 'HH:mm');
          const slotStartTime = moment(slotStart, 'HH:mm');
          const slotEndTime = moment(slotStart, 'HH:mm').add(slotDuration, 'minutes');
          
          return slotStartTime.isBetween(appStart, appEnd, null, '[)') ||
                 slotEndTime.isBetween(appStart, appEnd, null, '(]') ||
                 appStart.isBetween(slotStartTime, slotEndTime, null, '[)');
        });
        
        if (isAvailable) {
          slots.push({
            startTime: slotStart,
            endTime: moment(slotStart, 'HH:mm').add(slotDuration, 'minutes').format('HH:mm'),
            available: true
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        date: date,
        service: service.name,
        professional,
        slots: slots
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar horários disponíveis.'
    });
  }
};

// @desc    Obter estatísticas (apenas admin)
// @route   GET /api/appointments/stats
// @access  Private/Admin
const getAppointmentStats = async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores.'
      });
    }
    
    const today = moment().startOf('day').toDate();
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    
    // Estatísticas gerais
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({ date: today });
    const monthAppointments = await Appointment.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Agendamentos por status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Agendamentos por profissional
    const appointmentsByProfessional = await Appointment.aggregate([
      {
        $match: { professional: { $ne: null } }
      },
      {
        $group: {
          _id: '$professional',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'professional'
        }
      },
      {
        $unwind: '$professional'
      },
      {
        $project: {
          professional: '$professional.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Agendamentos por serviço
    const appointmentsByService = await Appointment.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: '$service'
      },
      {
        $project: {
          service: '$service.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Receita mensal
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: '$service'
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$service.price' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totals: {
          all: totalAppointments,
          today: todayAppointments,
          month: monthAppointments
        },
        byStatus: appointmentsByStatus,
        byProfessional: appointmentsByProfessional,
        byService: appointmentsByService,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas.'
    });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getAppointmentStats
};