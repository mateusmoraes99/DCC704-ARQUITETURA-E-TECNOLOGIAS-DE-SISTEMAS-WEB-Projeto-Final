const Equipment = require("../models/Equipment");
const Lab = require("../models/Lab");

// GET equipamentos de um lab
exports.getLabEquipment = async (req, res) => {
  try {
    const { labId } = req.params;

    const equipment = await Equipment.find({ labId, ativo: true })
      .sort({ nome: 1 });

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar equipamentos", 
      error: error.message 
    });
  }
};

// GET equipamento específico
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
      .populate("labId", "nome");

    if (!equipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao buscar equipamento", 
      error: error.message 
    });
  }
};

// POST criar equipamento (labAdmin)
exports.createEquipment = async (req, res) => {
  try {
    const { labId } = req.params;
    const { nome, descricao, quantidade } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome do equipamento é obrigatório" });
    }

    // Verificar se lab existe
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: "Lab não encontrado" });
    }

    // Validar permissão
    if (req.user.role === "labAdmin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para adicionar equipamentos" });
    }

    const novoEquipamento = new Equipment({
      nome,
      descricao,
      labId,
      quantidade: quantidade || 1
    });

    await novoEquipamento.save();

    // Adicionar equipamento ao lab
    lab.equipamentos.push(novoEquipamento._id);
    await lab.save();

    res.status(201).json({
      message: "Equipamento criado com sucesso",
      equipment: novoEquipamento
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao criar equipamento", 
      error: error.message 
    });
  }
};

// PUT atualizar equipamento
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, quantidade, ativo } = req.body;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }

    // Verificar permissão
    const lab = await Lab.findById(equipment.labId);
    if (req.user.role === "labAdmin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para editar este equipamento" });
    }

    if (nome) equipment.nome = nome;
    if (descricao !== undefined) equipment.descricao = descricao;
    if (quantidade) equipment.quantidade = quantidade;
    if (ativo !== undefined) equipment.ativo = ativo;

    await equipment.save();

    res.json({
      message: "Equipamento atualizado com sucesso",
      equipment
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao atualizar equipamento", 
      error: error.message 
    });
  }
};

// DELETE equipamento
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }

    // Verificar permissão
    const lab = await Lab.findById(equipment.labId);
    if (req.user.role === "labAdmin" && lab.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sem permissão para deletar este equipamento" });
    }

    await Equipment.findByIdAndDelete(id);

    // Remover do lab
    await Lab.findByIdAndUpdate(equipment.labId, {
      $pull: { equipamentos: id }
    });

    res.json({ message: "Equipamento deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao deletar equipamento", 
      error: error.message 
    });
  }
};
