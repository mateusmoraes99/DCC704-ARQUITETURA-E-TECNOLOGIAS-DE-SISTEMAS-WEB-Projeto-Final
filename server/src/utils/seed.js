// src/utils/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Lab = require('../models/Lab');
const Equipment = require('../models/Equipment');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agendamento_db');
    console.log('✅ Conectado ao MongoDB para seed');

    // Limpar dados existentes
    await User.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    await Lab.deleteMany({});
    await Equipment.deleteMany({});
    console.log('🧹 Dados antigos removidos');

    // Criar usuários
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@agendamento.com',
      password: hashedPassword,
      role: 'admin',
      phone: '(95) 99999-9999'
    });

    const professional1 = await User.create({
      name: 'João Barbeiro',
      email: 'joao@agendamento.com',
      password: hashedPassword,
      role: 'professional',
      phone: '(95) 98888-8888'
    });

    const professional2 = await User.create({
      name: 'Maria Cabeleireira',
      email: 'maria@agendamento.com',
      password: hashedPassword,
      role: 'professional',
      phone: '(95) 97777-7777'
    });

    const client1 = await User.create({
      name: 'Cliente Teste',
      email: 'cliente@agendamento.com',
      password: hashedPassword,
      role: 'client',
      phone: '(95) 96666-6666'
    });

    console.log(`👥 ${await User.countDocuments()} usuários criados`);

    // Criar serviços
    const services = await Service.create([
      {
        name: 'Corte Masculino',
        description: 'Corte de cabelo masculino com acabamento',
        duration: 30,
        price: 35.00,
        category: 'haircut',
        professional: professional1._id
      },
      {
        name: 'Barba',
        description: 'Aparar e modelar barba',
        duration: 20,
        price: 25.00,
        category: 'beard',
        professional: professional1._id
      },
      {
        name: 'Corte Feminino',
        description: 'Corte feminino com lavagem e secagem',
        duration: 60,
        price: 60.00,
        category: 'haircut',
        professional: professional2._id
      },
      {
        name: 'Coloração',
        description: 'Coloração completa com hidratação',
        duration: 120,
        price: 120.00,
        category: 'coloring',
        professional: professional2._id
      },
      {
        name: 'Consulta',
        description: 'Consulta personalizada para tratamento capilar',
        duration: 30,
        price: 0,
        category: 'consultation',
        professional: professional2._id
      }
    ]);

    console.log(`✂️ ${await Service.countDocuments()} serviços criados`);

    // Criar labs
    const lab1 = await Lab.create({
      nome: 'Laboratório de Análises Clínicas',
      descricao: 'Laboratório especializado em análises clínicas e exames de sangue',
      localizacao: 'Av. Principal, 1000 - Boa Vista, RR',
      adminId: professional1._id,
      ativo: true,
      foto: '/uploads/labs/lab1.jpg',
      telefone: '(95) 3198-1234',
      email: 'lab1@agendamento.com',
      diasFuncionamento: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
      horarioAbertura: '08:00',
      horarioFechamento: '18:00'
    });

    const lab2 = await Lab.create({
      nome: 'Laboratório de Biologia Molecular',
      descricao: 'Laboratório com tecnologia avançada para análises moleculares',
      localizacao: 'Rua das Flores, 500 - Boa Vista, RR',
      adminId: professional2._id,
      ativo: true,
      foto: '/uploads/labs/lab2.jpg',
      telefone: '(95) 3198-5678',
      email: 'lab2@agendamento.com',
      diasFuncionamento: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
      horarioAbertura: '07:00',
      horarioFechamento: '19:00'
    });

    console.log(`🏥 ${await Lab.countDocuments()} laboratórios criados`);

    // Criar equipamentos
    const equipment1 = await Equipment.create({
      nome: 'Centrífuga Automática',
      descricao: 'Equipamento para centrifugação de amostras',
      labId: lab1._id,
      status: 'ativo'
    });

    const equipment2 = await Equipment.create({
      nome: 'Analisador Bioquímico',
      descricao: 'Analisador automático para testes bioquímicos',
      labId: lab1._id,
      status: 'ativo'
    });

    const equipment3 = await Equipment.create({
      nome: 'Sequenciador Genético',
      descricao: 'Equipamento para sequenciamento de DNA',
      labId: lab2._id,
      status: 'ativo'
    });

    console.log(`🔧 ${await Equipment.countDocuments()} equipamentos criados`);

    // Criar agendamentos para labs
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Appointment.create([
      {
        usuarioId: client1._id,
        labId: lab1._id,
        equipmentIds: [equipment1._id, equipment2._id],
        datas: [tomorrow],
        horarioInicio: '09:00',
        horarioFim: '10:00',
        status: 'confirmed',
        observacoes: 'Coleta de sangue para análise de rotina'
      },
      {
        usuarioId: client1._id,
        labId: lab2._id,
        equipmentIds: [equipment3._id],
        datas: [tomorrow],
        horarioInicio: '14:00',
        horarioFim: '15:30',
        status: 'pending',
        observacoes: 'Testes de sequenciamento genético'
      }
    ]);

    console.log(`📅 ${await Appointment.countDocuments()} agendamentos criados`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n👤 Credenciais de teste:');
    console.log('   Admin: admin@agendamento.com / senha123');
    console.log('   Cliente: cliente@agendamento.com / senha123');
    console.log('   Profissional 1 (Lab Admin): joao@agendamento.com / senha123');
    console.log('   Profissional 2 (Lab Admin): maria@agendamento.com / senha123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;