// src/utils/emailService.js
const nodemailer = require('nodemailer');

// Configurar o transporter com as variáveis de ambiente
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar conexão ao iniciar
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email service not configured properly:', error.message);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

// Template: Boas-vindas ao registrar
const welcomeEmailTemplate = (name) => ({
  subject: 'Bem-vindo ao Sistema de Agendamento!',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          .button { 
            background-color: #007bff; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo, ${name}! 👋</h1>
          </div>
          <div class="content">
            <p>Sua conta foi criada com sucesso no <strong>Sistema de Agendamento</strong>.</p>
            <p>Você já pode:</p>
            <ul>
              <li>📅 Agendar serviços</li>
              <li>👤 Gerenciar seu perfil</li>
              <li>📋 Visualizar seus agendamentos</li>
            </ul>
            <p>Se você não criou essa conta, ignore este email.</p>
            <p><strong>Atenciosamente,</strong><br>
            Sistema de Agendamento</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Sistema de Agendamento. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
});

// Template: Novo agendamento criado
const appointmentCreatedTemplate = (userName, serviceName, date, time, professional) => ({
  subject: '✅ Agendamento Confirmado',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          .details { background: white; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
          .detail-line { padding: 5px 0; }
          .label { font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agendamento Confirmado! 🎉</h1>
          </div>
          <div class="content">
            <p>Olá ${userName},</p>
            <p>Seu agendamento foi criado com sucesso!</p>
            
            <div class="details">
              <div class="detail-line">
                <span class="label">📅 Serviço:</span> ${serviceName}
              </div>
              <div class="detail-line">
                <span class="label">📆 Data:</span> ${date}
              </div>
              <div class="detail-line">
                <span class="label">⏰ Horário:</span> ${time}
              </div>
              ${professional ? `<div class="detail-line">
                <span class="label">👨‍💼 Profissional:</span> ${professional}
              </div>` : ''}
            </div>
            
            <p><strong>Status:</strong> Pendente de confirmação</p>
            <p>Você receberá uma notificação assim que o profissional confirmar seu agendamento.</p>
            
            <p><strong>Dúvidas?</strong> Entre em contato conosco.</p>
            <p><strong>Atenciosamente,</strong><br>
            Sistema de Agendamento</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Sistema de Agendamento. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
});

// Template: Agendamento confirmado pelo profissional
const appointmentConfirmedTemplate = (userName, serviceName, date, time) => ({
  subject: '🎉 Agendamento Confirmado pelo Profissional',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          .details { background: white; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
          .detail-line { padding: 5px 0; }
          .label { font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agendamento Confirmado! ✨</h1>
          </div>
          <div class="content">
            <p>Olá ${userName},</p>
            <p>Ótimas notícias! Seu agendamento foi confirmado pelo profissional! 🎊</p>
            
            <div class="details">
              <div class="detail-line">
                <span class="label">📅 Serviço:</span> ${serviceName}
              </div>
              <div class="detail-line">
                <span class="label">📆 Data:</span> ${date}
              </div>
              <div class="detail-line">
                <span class="label">⏰ Horário:</span> ${time}
              </div>
              <div class="detail-line">
                <span class="label">Status:</span> <strong style="color: #28a745;">Confirmado</strong>
              </div>
            </div>
            
            <p>Não se esqueça da data! Você pode consultar todos os seus agendamentos no sistema.</p>
            
            <p><strong>Atenciosamente,</strong><br>
            Sistema de Agendamento</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Sistema de Agendamento. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
});

// Template: Agendamento cancelado
const appointmentCancelledTemplate = (userName, serviceName, date, time) => ({
  subject: '❌ Agendamento Cancelado',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          .details { background: white; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0; }
          .detail-line { padding: 5px 0; }
          .label { font-weight: bold; color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agendamento Cancelado</h1>
          </div>
          <div class="content">
            <p>Olá ${userName},</p>
            <p>Seu agendamento foi cancelado.</p>
            
            <div class="details">
              <div class="detail-line">
                <span class="label">📅 Serviço:</span> ${serviceName}
              </div>
              <div class="detail-line">
                <span class="label">📆 Data:</span> ${date}
              </div>
              <div class="detail-line">
                <span class="label">⏰ Horário:</span> ${time}
              </div>
              <div class="detail-line">
                <span class="label">Status:</span> <strong style="color: #dc3545;">Cancelado</strong>
              </div>
            </div>
            
            <p>Se deseja reagendar, acesse o sistema novamente.</p>
            
            <p><strong>Atenciosamente,</strong><br>
            Sistema de Agendamento</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Sistema de Agendamento. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
});

// Template: Novo agendamento para o profissional
const newAppointmentForProfessionalTemplate = (professionalName, clientName, serviceName, date, time) => ({
  subject: '📅 Novo Agendamento Solicitado',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          .details { background: white; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
          .detail-line { padding: 5px 0; }
          .label { font-weight: bold; color: #007bff; }
          .button { 
            background-color: #007bff; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Novo Agendamento! 📅</h1>
          </div>
          <div class="content">
            <p>Olá ${professionalName},</p>
            <p>Você tem um novo agendamento pendente de confirmação!</p>
            
            <div class="details">
              <div class="detail-line">
                <span class="label">👤 Cliente:</span> ${clientName}
              </div>
              <div class="detail-line">
                <span class="label">📅 Serviço:</span> ${serviceName}
              </div>
              <div class="detail-line">
                <span class="label">📆 Data:</span> ${date}
              </div>
              <div class="detail-line">
                <span class="label">⏰ Horário:</span> ${time}
              </div>
              <div class="detail-line">
                <span class="label">Status:</span> <strong style="color: #ffc107;">Pendente</strong>
              </div>
            </div>
            
            <p>Acesse o sistema para confirmar ou recusar este agendamento.</p>
            
            <p><strong>Atenciosamente,</strong><br>
            Sistema de Agendamento</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Sistema de Agendamento. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
});

// Função para enviar email
const sendEmail = async (to, template) => {
  try {
    // Se email não está configurado, apenas logar
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️  Email service not configured. Would send email to:', to);
      console.log('📧 Subject:', template.subject);
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      ...template
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to', to, '- Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email to', to, ':', error.message);
    return { success: false, message: error.message };
  }
};

// Exportar funções
module.exports = {
  sendEmail,
  welcomeEmailTemplate,
  appointmentCreatedTemplate,
  appointmentConfirmedTemplate,
  appointmentCancelledTemplate,
  newAppointmentForProfessionalTemplate
};
