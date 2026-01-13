const Appointment = require("../models/Appointment");
const Lab = require("../models/Lab");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const {
  sendEmail,
  appointmentCreatedTemplate,
  appointmentConfirmedTemplate,
  appointmentCancelledTemplate
} = require("../utils/emailService");

// GET agendamentos do usuário logado
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ usuarioId: req.user.id })
      .populate("labId", "nome localizacao adminId")
      .populate("equipmentIds", "nome")
      .sort({ datas: -1 });

    // Transformar datas para ISO string para garantir compatibilidade
    const appointmentsFormatted = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.datas && Array.isArray(aptObj.datas)) {
        aptObj.datas = aptObj.datas.map(d => {
          if (d instanceof Date) {
            return d.toISOString();
          }
          return d;
        });
      }
      return aptObj;
    });

    res.json(appointmentsFormatted);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar agendamentos",
      error: error.message
    });
  }
};

// GET agendamento específico
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("usuarioId", "name email phone")
      .populate("labId", "nome localizacao")
      .populate("equipmentIds", "nome")
      .populate("confirmadoPor", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    // Validar permissão
    if (
      req.user.role !== "admin" &&
      appointment.usuarioId._id.toString() !== req.user.id &&
      (req.user.role !== "labAdmin" ||
        appointment.labId.adminId.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Sem permissão para ver este agendamento" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar agendamento",
      error: error.message
    });
  }
};

// GET agendamentos de um laboratório específico (para labAdmin gerenciar seu lab)
exports.getLabAppointments = async (req, res) => {
  try {
    const { labId } = req.params;

    // Validar se o lab existe
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: "Laboratório não encontrado" });
    }

    // Validar permissão: apenas admin ou o labAdmin do lab
    if (req.user.role !== "admin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para ver agendamentos deste laboratório" });
    }

    // Buscar agendamentos do laboratório
    const appointments = await Appointment.find({ labId: labId })
      .populate("usuarioId", "name email phone")
      .populate("labId", "nome localizacao")
      .populate("equipmentIds", "nome")
      .populate("confirmadoPor", "name email")
      .sort({ datas: -1 });

    // Transformar datas para ISO string para garantir compatibilidade
    const appointmentsFormatted = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.datas && Array.isArray(aptObj.datas)) {
        aptObj.datas = aptObj.datas.map(d => {
          if (d instanceof Date) {
            return d.toISOString();
          }
          return d;
        });
      }
      return aptObj;
    });

    res.json(appointmentsFormatted);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar agendamentos do laboratório",
      error: error.message
    });
  }
};

// POST criar novo agendamento
exports.createAppointment = async (req, res) => {
  try {
    const { labId, datas, horarioInicio, horarioFim, equipmentIds, observacoes } = req.body;

    // Validações
    if (!labId || !datas || !horarioInicio || !horarioFim) {
      return res.status(400).json({
        message: "Lab, datas, horários são obrigatórios"
      });
    }

    if (!Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        message: "Datas deve ser um array não vazio"
      });
    }

    // Verificar se lab existe
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Verificar dias bloqueados
    for (const data of datas) {
      const dataStr = new Date(data).toDateString();
      const diaBloqueadoObj = lab.diasBloqueados.find(
        d => new Date(d.data).toDateString() === dataStr
      );

      if (diaBloqueadoObj) {
        const motivo = diaBloqueadoObj.motivo ? ` - ${diaBloqueadoObj.motivo}` : '';
        return res.status(400).json({
          message: `Dia ${dataStr} está bloqueado para agendamentos${motivo}`,
          blockedDate: true,
          reason: diaBloqueadoObj.motivo || 'Laboratório indisponível'
        });
      }
    }

    // Verificar se equipamentos existem (se fornecidos)
    if (equipmentIds && Array.isArray(equipmentIds) && equipmentIds.length > 0) {
      for (const eqId of equipmentIds) {
        const eq = await Equipment.findById(eqId);
        if (!eq || eq.labId.toString() !== labId) {
          return res.status(400).json({
            message: `Equipamento inválido: ${eqId}`
          });
        }
      }
    }

    // Criar agendamento
    const novoAgendamento = new Appointment({
      usuarioId: req.user.id,
      labId,
      datas,
      horarioInicio,
      horarioFim,
      equipmentIds: equipmentIds || [],
      observacoes
    });

    await novoAgendamento.save();

    // Buscar dados completos para email
    const agendamentoPopulado = await Appointment.findById(novoAgendamento._id)
      .populate("usuarioId", "name email")
      .populate("labId", "nome localizacao adminId")
      .populate("equipmentIds", "nome");

    // Enviar email para cliente
    const datasFormatadas = datas
      .map(d => new Date(d).toLocaleDateString("pt-BR"))
      .join(", ");

    try {
      await sendEmail(
        agendamentoPopulado.usuarioId.email,
        `Agendamento enviado para confirmação - ${agendamentoPopulado.labId.nome}`,
        `
        Olá ${agendamentoPopulado.usuarioId.name},
        
        Seu agendamento foi enviado para confirmação:
        
        Lab: ${agendamentoPopulado.labId.nome}
        Localização: ${agendamentoPopulado.labId.localizacao}
        Datas: ${datasFormatadas}
        Horário: ${horarioInicio} - ${horarioFim}
        Equipamentos: ${agendamentoPopulado.equipmentIds.map(e => e.nome).join(", ") || "Nenhum"}
        Observações: ${observacoes || "Nenhuma"}
        
        Status: Pendente de confirmação
        
        Você será notificado quando o administrador do lab confirmar sua solicitação.
        `
      );
    } catch (emailError) {
      console.error("Erro ao enviar email para cliente:", emailError);
    }

    // Enviar email para Lab Admin
    const labAdmin = await User.findById(lab.adminId);
    if (labAdmin && labAdmin.email) {
      try {
        await sendEmail(
          labAdmin.email,
          `NOVO AGENDAMENTO - ${lab.nome}`,
          `
          Novo agendamento aguardando confirmação:
          
          Cliente: ${agendamentoPopulado.usuarioId.name}
          Email: ${agendamentoPopulado.usuarioId.email}
          
          Lab: ${lab.nome}
          Datas: ${datasFormatadas}
          Horário: ${horarioInicio} - ${horarioFim}
          Equipamentos: ${agendamentoPopulado.equipmentIds.map(e => e.nome).join(", ") || "Nenhum"}
          
          Observações: ${observacoes || "Nenhuma"}
          
          Acesse o dashboard para confirmar ou rejeitar este agendamento.
          `
        );
      } catch (emailError) {
        console.error("Erro ao enviar email para lab admin:", emailError);
      }
    }

    // Registrar última data de agendamento
    lab.dataUltimoAgendamento = new Date();
    await lab.save();

    res.status(201).json({
      message: "Agendamento criado com sucesso. Aguarde confirmação.",
      appointment: agendamentoPopulado
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao criar agendamento",
      error: error.message
    });
  }
};

// PUT confirmar agendamento (labAdmin)
exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate("labId")
      .populate("usuarioId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    // Validar permissão
    if (
      req.user.role !== "admin" &&
      (req.user.role !== "labAdmin" ||
        appointment.labId.adminId.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        message: "Sem permissão para confirmar agendamentos"
      });
    }

    appointment.status = "confirmed";
    appointment.confirmadoPor = req.user.id;
    appointment.dataConfirmacao = new Date();
    await appointment.save();

    // Enviar email para cliente
    try {
      const datasFormatadas = appointment.datas
        .map(d => new Date(d).toLocaleDateString("pt-BR"))
        .join(", ");

      await sendEmail(
        appointment.usuarioId.email,
        `Agendamento Confirmado - ${appointment.labId.nome}`,
        `
        Olá ${appointment.usuarioId.name},
        
        Seu agendamento foi CONFIRMADO!
        
        Lab: ${appointment.labId.nome}
        Datas: ${datasFormatadas}
        Horário: ${appointment.horarioInicio} - ${appointment.horarioFim}
        
        Por favor, chegue com 10 minutos de antecedência.
        `
      );
    } catch (emailError) {
      console.error("Erro ao enviar email de confirmação:", emailError);
    }

    res.json({
      message: "Agendamento confirmado com sucesso",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao confirmar agendamento",
      error: error.message
    });
  }
};

// PUT rejeitar agendamento (labAdmin)
exports.rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const appointment = await Appointment.findById(id)
      .populate("labId")
      .populate("usuarioId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    // Validar permissão
    if (
      req.user.role !== "admin" &&
      (req.user.role !== "labAdmin" ||
        appointment.labId.adminId.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        message: "Sem permissão para rejeitar agendamentos"
      });
    }

    appointment.status = "cancelled";
    appointment.dataCancelamento = new Date();
    appointment.motivoCancelamento = motivo || "Rejeitado pelo administrador";
    await appointment.save();

    // Enviar email para cliente
    try {
      await sendEmail(
        appointment.usuarioId.email,
        `Agendamento Rejeitado - ${appointment.labId.nome}`,
        `
        Olá ${appointment.usuarioId.name},
        
        Lamentavelmente, seu agendamento foi rejeitado.
        
        Motivo: ${appointment.motivoCancelamento}
        
        Por favor, tente novamente em outra data.
        `
      );
    } catch (emailError) {
      console.error("Erro ao enviar email de rejeição:", emailError);
    }

    res.json({
      message: "Agendamento rejeitado com sucesso",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao rejeitar agendamento",
      error: error.message
    });
  }
};

// DELETE cancelar agendamento (cliente ou labAdmin)
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const appointment = await Appointment.findById(id)
      .populate("labId")
      .populate("usuarioId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    // Validar permissão
    if (
      req.user.role === "labAdmin" &&
      appointment.labId.adminId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Sem permissão para cancelar este agendamento"
      });
    }

    if (
      req.user.role === "client" &&
      appointment.usuarioId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Você só pode cancelar seus próprios agendamentos"
      });
    }

    appointment.status = "cancelled";
    appointment.dataCancelamento = new Date();
    appointment.motivoCancelamento = motivo || "Cancelado pelo usuário";
    await appointment.save();

    // Enviar email para Lab Admin se foi cancelado pelo cliente
    if (req.user.role === "client" && appointment.labId.adminId) {
      const admin = await User.findById(appointment.labId.adminId);
      if (admin && admin.email) {
        try {
          await sendEmail(
            admin.email,
            `Agendamento Cancelado - ${appointment.labId.nome}`,
            `
            Um agendamento foi cancelado:
            
            Cliente: ${appointment.usuarioId.name}
            Datas: ${appointment.datas.map(d => new Date(d).toLocaleDateString("pt-BR")).join(", ")}
            Motivo: ${motivo || "Não informado"}
            `
          );
        } catch (emailError) {
          console.error("Erro ao enviar email de cancelamento:", emailError);
        }
      }
    }

    res.json({
      message: "Agendamento cancelado com sucesso",
      appointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao cancelar agendamento",
      error: error.message
    });
  }
};

// GET agendamentos disponíveis por dia (para calendário)
exports.getAvailableDays = async (req, res) => {
  try {
    const { labId, month, year } = req.query;

    if (!labId || !month || !year) {
      return res.status(400).json({
        message: "labId, month e year são obrigatórios"
      });
    }

    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Conseguir todos os dias do mês
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);

    // Conseguir agendamentos do mês
    const appointments = await Appointment.find({
      labId,
      status: "confirmed",
      datas: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Mapear dias bloqueados com motivos
    const blockedDaysWithReasons = lab.diasBloqueados
      .filter(d => {
        const d2 = new Date(d.data);
        return d2.getMonth() === startDate.getMonth() &&
               d2.getFullYear() === startDate.getFullYear();
      })
      .reduce((acc, d) => {
        const day = new Date(d.data).getDate();
        acc[day] = {
          blocked: true,
          reason: d.motivo || 'Laboratório indisponível'
        };
        return acc;
      }, {});

    // Mapear dias com agendamentos
    const appointmentDays = new Set();
    appointments.forEach(apt => {
      apt.datas.forEach(d => {
        if (new Date(d).getMonth() === startDate.getMonth()) {
          appointmentDays.add(new Date(d).getDate());
        }
      });
    });

    res.json({
      blockedDaysWithReasons,
      blockedDays: Object.keys(blockedDaysWithReasons).map(Number),
      appointmentDays: Array.from(appointmentDays),
      totalDays: endDate.getDate()
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar dias disponíveis",
      error: error.message
    });
  }
};
