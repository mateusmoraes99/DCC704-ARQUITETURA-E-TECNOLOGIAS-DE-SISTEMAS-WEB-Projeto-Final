// test-moment.js
try {
    const moment = require('moment');
    console.log('✅ Moment instalado corretamente!');
    console.log(`📦 Versão: ${moment.version}`);
    console.log(`📅 Data atual: ${moment().format('DD/MM/YYYY HH:mm:ss')}`);
  } catch (error) {
    console.error('❌ Erro ao carregar moment:', error.message);
    console.log('\n💡 Soluções:');
    console.log('1. Execute: npm install moment');
    console.log('2. Verifique se está no diretório correto');
    console.log('3. Verifique se node_modules contém moment');
  }