// src/utils/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
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

    // Criar agendamentos
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Appointment.create([
      {
        client: client1._id,
        service: services[0]._id,
        professional: professional1._id,
        date: tomorrow,
        startTime: '09:00',
        status: 'confirmed',
        notes: 'Primeira vez no salão'
      },
      {
        client: client1._id,
        service: services[1]._id,
        professional: professional1._id,
        date: tomorrow,
        startTime: '14:00',
        status: 'pending',
        notes: 'Manutenção da barba'
      }
    ]);

    console.log(`📅 ${await Appointment.countDocuments()} agendamentos criados`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n👤 Credenciais de teste:');
    console.log('   Admin: admin@agendamento.com / senha123');
    console.log('   Cliente: cliente@agendamento.com / senha123');
    console.log('   Profissional: joao@agendamento.com / senha123');

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