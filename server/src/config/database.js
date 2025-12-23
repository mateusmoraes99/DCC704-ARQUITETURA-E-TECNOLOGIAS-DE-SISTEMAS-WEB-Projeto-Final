const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use valor padrão se MONGODB_URI não estiver definido
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agendamento_db";
    
    if (!uri) {
      throw new Error("MONGODB_URI não definido no .env");
    }
    
    console.log("🔗 Tentando conectar ao MongoDB...");
    const conn = await mongoose.connect(uri);
    console.log("✅ MongoDB conectado: " + conn.connection.host);
  } catch (error) {
    console.error("❌ Erro ao conectar MongoDB: " + error.message);
    console.log("💡 Dica: Verifique se o MongoDB está rodando e o .env está configurado");
    process.exit(1);
  }
};

module.exports = connectDB;