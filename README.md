
# PatientsOnFIRE - Trabalho Prático de Sistemas Distribuídos

Este projeto é a implementação do Trabalho 2 da disciplina de Fundamento de Redes e Sistemas Distribuídos (2025/02).

O objetivo é desenvolver uma aplicação de rede cliente/servidor chamada **PatientsOnFIRE** (Patients On FHIR Information Retrieval Environment). O sistema é baseado na arquitetura de serviços web REST para gerenciar registros de pacientes.

## 🖥️ Componentes do Sistema

O sistema é formado por dois componentes principais:

1.  **Servidor PatientsOnFIRE (Backend):**
    
    -   O núcleo do sistema, implementado em **Node.js** com Express.js.
        
    -   Oferece um serviço web REST que suporta operações CRUD (Create, Read, Update, Delete) sobre registros de pacientes.
        
    -   Segue o padrão **HL7 FHIR v5.0.0** para os recursos `Patient`.
        
    -   Utiliza um arquivo `patients_db.json` local para persistência de dados.
        
2.  **Cliente CRUDEPatients (Frontend):**
    
    -   Uma página HTML dinâmica com JavaScript que fornece a interface de usuário.
        
    -   Consome a API RESTful do servidor PatientsOnFIRE para gerenciar os pacientes.
        

## 🛠️ Tecnologias Utilizadas (Backend)

-   **Node.js**
    
-   **Express.js:** Framework web para criação da API RESTful.
    
-   **CORS:** Middleware para habilitar requisições cross-origin (do cliente HTML para o servidor).
    
-   **fs (File System):** Módulo nativo do Node.js para persistência de dados em um arquivo JSON.
    

## 🚀 Como Rodar o Projeto

### Pré-requisitos

Para executar este projeto, você precisará ter instalados:

-   [Node.js](https://nodejs.org/ "null") (que inclui o npm)
    
-   Um navegador web moderno (para o cliente)
    
-   Um cliente de API (como Postman, Insomnia ou `curl`) para testar o backend.
    

### 1. Backend (Servidor PatientsOnFIRE)

1.  **Clone o repositório** (ou navegue até a pasta do servidor):
    
    ```
    # Assumindo que a pasta se chama 'patients-on-fire-server'
    cd patients-on-fire-server
    
    ```
    
2.  **Instale as dependências** do Node.js:
    
    ```
    npm install
    
    ```
    
3.  **Inicie o servidor:**
    
    -   Para modo de desenvolvimento (reinicia automaticamente ao salvar):
        
        ```
        npm run dev
        
        ```
        
    -   Para modo de produção:
        
        ```
        npm start
        
        ```
        
4.  **Verificação:**
    
    -   O servidor estará rodando em `http://localhost:3000`.
        
    -   Ao iniciar, ele criará (ou carregará) o arquivo `patients_db.json` na raiz do diretório do servidor.
        

### 2. Frontend (Cliente CRUDEPatients)

1.  Navegue até a pasta do cliente (ex: `patients-on-fire-client` ou a raiz do projeto, dependendo de onde o `index.html` estiver).
    
2.  **Abra o arquivo `index.html`** diretamente no seu navegador web.
    
3.  O JavaScript no cliente fará as requisições para o servidor (que deve estar rodando em `http://localhost:3000`).
    
