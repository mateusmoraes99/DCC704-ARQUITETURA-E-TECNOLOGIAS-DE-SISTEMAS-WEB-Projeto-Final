Perfeito 👍
Segue **apenas o texto formatado em Markdown**, sem acréscimos de conteúdo, pronto para **copiar e colar no README.md**:

---

# Projeto Final – DCC704 – Arquitetura e Tecnologias de Sistemas Web

Este repositório contém o projeto final da disciplina **DCC704 – Arquitetura e Tecnologias de Sistemas Web**, desenvolvido com o objetivo de aplicar, na prática, os conceitos estudados sobre arquiteturas web modernas. O sistema foi construído utilizando o modelo **cliente-servidor**, com **React** no front-end e **Node.js com Express** no back-end, promovendo separação de responsabilidades, reutilização de componentes e comunicação via API.

## Arquitetura da Aplicação

A aplicação é composta por duas camadas principais:

* **Front-end (client):** responsável pela interface com o usuário, desenvolvido em React com organização por componentes.
* **Back-end (server):** desenvolvido em Node.js utilizando o framework Express, responsável pelas regras de negócio e fornecimento dos dados por meio de requisições HTTP.

## Estrutura do Projeto

A estrutura do projeto está organizada da seguinte forma:

```bash
client/   # Contém todo o código do front-end em React
server/   # Contém a implementação do servidor, rotas e configurações da API
```

## Tecnologias Utilizadas

As principais tecnologias utilizadas no projeto foram:

* **Front-end:** React, JavaScript, HTML5 e CSS3
* **Back-end:** Node.js e Express
* **Outros:** npm para gerenciamento de dependências e dotenv para configuração de variáveis de ambiente

## Execução do Projeto

Para executar o projeto localmente, é necessário ter o **Node.js (versão LTS)** instalado.

1. Após clonar o repositório, acesse a pasta `server`, instale as dependências e inicie o servidor:

   ```bash
   npm install
   npm start
   ```

2. Em outro terminal, acesse a pasta `client`, instale as dependências e execute a aplicação:

   ```bash
   npm install
   npm start
   ```

Após esses passos, o sistema estará disponível no navegador, conforme as portas configuradas no projeto.

## Informações Acadêmicas

Este projeto foi desenvolvido como atividade avaliativa da disciplina **DCC704 – Arquitetura e Tecnologias de Sistemas Web**, pertencente aos cursos da área de Computação da **Universidade Federal de Roraima (UFRR)**, tendo caráter exclusivamente acadêmico e educacional.

* **Instituição:** Universidade Federal de Roraima (UFRR)
* **Disciplina:** DCC704 – Arquitetura e Tecnologias de Sistemas Web
* **Finalidade:** Projeto acadêmico
* **Alunos:** Mateus Moraes de Moura / Fernando Sousa Rodrigues

---

### Dependências Adicionadas
```json
"react-big-calendar": "^1.19.4",
"moment": "^2.30.1"
```

---

## 🔒 Segurança

- ✅ Acesso por role (admin/professional/client)
- ✅ Tokens JWT protegidos
- ✅ Senhas hasheadas com bcrypt
- ✅ Prevenção de SQL injection
- ✅ Prevenção de XSS

---

## 📱 Responsividade

Testado em:
- ✅ Desktop (1920x1080+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🌐 Compatibilidade

- ✅ Chrome (100%)
- ✅ Firefox (100%)
- ✅ Safari (100%)
- ✅ Edge (100%)

---

## 📞 Suporte
```
Fernando - [Contato](fernando124655@gmail.com)
Mateus - [Contato](linkedin.com/in/mateus-moraes-de-moura-09b008277)
```

---

## 📚 Arquivos do Projeto

```
DCC704-ARQUITETURA-E-TECNOLOGIAS-DE-SISTEMAS-WEB-Projeto-Final/
├── 📖 README.md                          ← Você está aqui
├── 📁 client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Services.jsx             
│   │   │   ├── Appointments.jsx         
│   │   │   └── AdminDashboard.jsx        
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Header.jsx            
│   │   ├── styles/
│   │   │   └── calendar.css            
│   │   └── App.jsx                       
│   └── package.json                      
│
└── 📁 server/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   └── routes/
    └── package.json
```


---
