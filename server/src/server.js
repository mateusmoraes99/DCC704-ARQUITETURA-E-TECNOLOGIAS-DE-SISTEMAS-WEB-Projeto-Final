// src/server.js
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Configurações iniciais
const PORT = process.env.PORT || 5001;

// Inicializar app
const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Sistema de Agendamento',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      services: '/api/services',
      appointments: '/api/appointments',
      docs: 'https://github.com/seu-usuario/agendamento-backend'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// Handler de erros (DEVE ser o último middleware)
app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar ao banco
    await connectDB();
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 SERVIDOR INICIADO COM SUCESSO!');
      console.log('='.repeat(50));
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
      console.log('📚 Endpoints disponíveis:');
      console.log(`   🔐 Auth:     http://localhost:${PORT}/api/auth`);
      console.log(`   👥 Users:    http://localhost:${PORT}/api/users`);
      console.log(`   ✂️  Services: http://localhost:${PORT}/api/services`);
      console.log(`   📅 Appointments: http://localhost:${PORT}/api/appointments`);
      console.log('='.repeat(50));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🧪 Para testar:');
        console.log('   npm run seed  # Popular banco com dados de teste');
        console.log('   Use: admin@agendamento.com / senha123');
        console.log('\n🛑 Para parar: Ctrl + C');
      }
    });

    // Handler de erro do servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️  Porta ${PORT} ocupada, tentando ${PORT + 1}...`);
        app.listen(PORT + 1);
      } else {
        console.error('❌ Erro no servidor:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Executar
startServer();

module.exports = app; // Para testes