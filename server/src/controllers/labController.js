const Lab = require("../models/Lab");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

// GET todos os labs públicos (clientes veem)
exports.getAllLabs = async (req, res) => {
  try {
    const labs = await Lab.find({ ativo: true })
      .populate("adminId", "name email")
      .populate("equipamentos");

    res.json(labs);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar labs", 
      error: error.message 
    });
  }
};

// GET um lab específico
exports.getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
      .populate("adminId", "name email")
      .populate("equipamentos");

    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    res.json(lab);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar lab", 
      error: error.message 
    });
  }
};

// GET labs do usuário logado (se for labAdmin)
exports.getMyLab = async (req, res) => {
  try {
    const lab = await Lab.findOne({ adminId: req.user.id })
      .populate("adminId", "name email")
      .populate("equipamentos");

    if (!lab) {
      return res.status(404).json({ message: "Você não administra nenhum lab" });
    }

    res.json(lab);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar seu lab", 
      error: error.message 
    });
  }
};

// POST criar novo lab (apenas admin)
exports.createLab = async (req, res) => {
  try {
    const { nome, descricao, localizacao, adminId, horarioAbertura, horarioFechamento, diasFuncionamento } = req.body;

    // Validações
    if (!nome || !localizacao) {
      return res.status(400).json({ 
        message: "Nome e localização são obrigatórios" 
      });
    }

    // Verificar se usuário existe e tem role correto
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Administrador não encontrado" });
    }

    // Criar lab
    const novoLab = new Lab({
      nome,
      descricao,
      localizacao,
      adminId,
      horarioAbertura: horarioAbertura || '08:00',
      horarioFechamento: horarioFechamento || '18:00',
      diasFuncionamento: diasFuncionamento || ['segunda', 'terça', 'quarta', 'quinta', 'sexta']
    });

    // Se houver upload de foto
    if (req.file) {
      novoLab.fotoUrl = `/uploads/labs/${req.file.filename}`;
    }

    await novoLab.save();

    // Atualizar user para ter o labId
    admin.labId = novoLab._id;
    admin.role = "labAdmin";
    await admin.save();

    res.status(201).json({
      message: "Lab criado com sucesso",
      lab: novoLab
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao criar lab", 
      error: error.message 
    });
  }
};

// PUT atualizar lab (labAdmin ou admin)
exports.updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, localizacao, ativo } = req.body;

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Validar permissão (apenas admin do lab ou super admin)
    if (req.user.role === "labAdmin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para editar este lab" });
    }

    // Atualizar campos
    if (nome) lab.nome = nome;
    if (descricao !== undefined) lab.descricao = descricao;
    if (localizacao) lab.localizacao = localizacao;
    if (ativo !== undefined) lab.ativo = ativo;

    // Se houver novo upload de foto
    if (req.file) {
      lab.fotoUrl = `/uploads/labs/${req.file.filename}`;
    }

    await lab.save();

    res.json({
      message: "Lab atualizado com sucesso",
      lab
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao atualizar lab", 
      error: error.message 
    });
  }
};

// DELETE lab (apenas admin)
exports.deleteLab = async (req, res) => {
  try {
    const { id } = req.params;

    const lab = await Lab.findByIdAndDelete(id);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Remover equipamentos associados
    await Equipment.deleteMany({ labId: id });

    // Limpar agendamentos associados
    await Appointment.deleteMany({ labId: id });

    // Remover labId do user admin
    await User.findByIdAndUpdate(lab.adminId, { 
      labId: null, 
      role: "client" 
    });

    res.json({ message: "Lab deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao deletar lab", 
      error: error.message 
    });
  }
};

// POST bloquear dia no lab
exports.blockDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, motivo } = req.body;

    if (!data) {
      return res.status(400).json({ message: "Data é obrigatória" });
    }

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Validar permissão
    if (req.user.role === "labAdmin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para bloquear dias" });
    }

    // Verificar se dia já está bloqueado
    const diaBloqueado = lab.diasBloqueados.some(d => 
      new Date(d.data).toDateString() === new Date(data).toDateString()
    );

    if (diaBloqueado) {
      return res.status(400).json({ message: "Este dia já está bloqueado" });
    }

    // Adicionar dia bloqueado
    lab.diasBloqueados.push({
      data: new Date(data),
      motivo: motivo || "Manutenção"
    });

    await lab.save();

    res.json({
      message: "Dia bloqueado com sucesso",
      lab
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao bloquear dia", 
      error: error.message 
    });
  }
};

// DELETE desbloquear dia
exports.unblockDay = async (req, res) => {
  try {
    const { id, data } = req.params;

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Validar permissão
    if (req.user.role === "labAdmin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para desbloquear dias" });
    }

    // Remover dia bloqueado
    lab.diasBloqueados = lab.diasBloqueados.filter(d => 
      new Date(d.data).toDateString() !== new Date(decodeURIComponent(data)).toDateString()
    );

    await lab.save();

    res.json({
      message: "Dia desbloqueado com sucesso",
      lab
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao desbloquear dia", 
      error: error.message 
    });
  }
};

// GET dias bloqueados
exports.getBlockedDays = async (req, res) => {
  try {
    const { id } = req.params;

    const lab = await Lab.findById(id).select("diasBloqueados");
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    res.json(lab.diasBloqueados);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar dias bloqueados", 
      error: error.message 
    });
  }
};

// GET agendamentos de um lab (apenas labAdmin)
exports.getLabAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Validar permissão
    if (req.user.role === "labAdmin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para ver estes agendamentos" });
    }

    let query = { labId: id };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("usuarioId", "name email phone")
      .populate("equipmentIds", "nome")
      .sort({ datas: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar agendamentos", 
      error: error.message 
    });
  }
};

// GET estatísticas de um lab
exports.getLabStats = async (req, res) => {
  try {
    const { id } = req.params;

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    const appointments = await Appointment.find({ labId: id });

    const stats = {
      totalAgendamentos: appointments.length,
      confirmados: appointments.filter(a => a.status === "confirmed").length,
      pendentes: appointments.filter(a => a.status === "pending").length,
      cancelados: appointments.filter(a => a.status === "cancelled").length,
      completos: appointments.filter(a => a.status === "completed").length,
      equipamentosTotal: lab.equipamentos.length,
      diasBloqueados: lab.diasBloqueados.length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar estatísticas", 
      error: error.message 
    });
  }
};
