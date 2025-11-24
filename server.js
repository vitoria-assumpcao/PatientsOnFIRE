const express = require('express');
const cors = require('cors');
const fs = require('fs');
const DB_FILE = './patients_db.json';

// Função para carregar o banco de dados do arquivo
function loadDatabase() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir ou for inválido, começa um novo BD
    console.log('Arquivo de banco de dados não encontrado. Criando um novo.');
    // Usaremos um objeto simples, pois é mais fácil de serializar/deserializar
    return { patients: {}, nextId: 1 };
  }
}

// Função para salvar o estado atual do banco de dados no arquivo
function saveDatabase(data) {
  try {
    // Usamos JSON.stringify com 'null, 2' para formatar o JSON de forma legível
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('ERRO AO SALVAR NO BANCO DE DADOS:', error);
  }
}

const app = express();
app.use(cors());

let db = loadDatabase();

const PORT = 3000;

// Middleware essencial: Habilita o Express para entender JSON
app.use(express.json());

// --- Nossas rotas da API virão aqui ---

// Rota de "saúde" básica para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.status(200).send('Servidor PatientsOnFIRE está rodando!');
});

/*
 * ==========================================================
 * 4. OPERAÇÃO CREATE (POST /Patient)
 * ==========================================================
 */
app.post('/Patient', (req, res) => {
  const patientData = req.body;

  if (!patientData || !patientData.name) {
    return res.status(400).send('Corpo da requisição inválido ou faltando.');
  }

  // 1. Gerar o novo ID a partir do BD
  const newId = db.nextId++; // Usa o nextId do objeto db
  
  // 2. Adicionar o ID
  patientData.identifier = patientData.identifier || [];
  patientData.identifier.push({ "system": "http://ufcspa.edu.br/patients-on-fire", "value": newId });
  
  // 3. Garantir o resourceType
  patientData.resourceType = "Patient";

  // 4. Salvar no nosso "banco de dados" (agora um objeto)
  db.patients[newId] = patientData; // Adiciona ao objeto 'patients'

  // 5. SALVAR NO ARQUIVO
  saveDatabase(db);

  // 6. Retornar resposta
  res.setHeader('Location', `/Patient/${newId}`);
  res.status(201).json(patientData);
});

/*
 * ==========================================================
 * 6. OPERAÇÃO READ (GET /Patient/:id)
 * ==========================================================
 */
app.get('/Patient/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Busca o paciente no objeto 'patients'
  const patient = db.patients[id];

  if (patient) {
    res.status(200).json(patient);
  } else {
    res.status(404).send('Paciente não encontrado.');
  }
});

/*
 * ==========================================================
 * 5. OPERAÇÃO UPDATE (PUT /Patient/:id)
 * ==========================================================
 */
app.put('/Patient/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const patientData = req.body;

  // 1. Verificar se o recurso existe
  if (!db.patients[id]) { // Verifica se a chave 'id' existe em 'db.patients'
    return res.status(404).send('Paciente não encontrado para atualização.');
  }

  // 2. Validar se o ID na URL é o mesmo do corpo
  const hasMatchingIdInBody = patientData.identifier?.some(idObj => idObj.value === id);
  
  if (!hasMatchingIdInBody) {
    return res.status(400).send('O <ID> na URL não corresponde ao identifier no corpo da requisição.');
  }

  // 3. Atualizar o recurso no "banco de dados"
  db.patients[id] = patientData;

  // 4. SALVAR NO ARQUIVO
  saveDatabase(db);

  // 5. Retornar 200 OK
  res.status(200).json(patientData);
});

/*
 * ==========================================================
 * 7. OPERAÇÃO DELETE (DELETE /Patient/:id)
 * ==========================================================
 */
app.delete('/Patient/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (db.patients[id]) { // Verifica se a chave 'id' existe
    // 1. Remover o recurso do objeto
    delete db.patients[id];
    
    // 2. SALVAR NO ARQUIVO
    saveDatabase(db);
    
    // 3. Retornar 204 No Content
    res.status(204).end();
  } else {
    res.status(404).send('Paciente não encontrado.');
  }
});

/*
 * ==========================================================
 * 8. OPERAÇÃO CUSTOMIZADA (GET /PatientIDs)
 * ==========================================================
 */
app.get('/PatientIDs', (req, res) => {
  // 1. Recuperar todas as chaves (IDs) do objeto 'db.patients'
  const allIds = Object.keys(db.patients).map(id => parseInt(id, 10));

  if (allIds.length > 0) {
    // 2. Se houver IDs, retornar 200 OK com a lista JSON
    res.status(200).json(allIds);
  } else {
    // 3. Se não houver recursos, retornar 204 No Content
    res.status(204).end();
  }
});

// Iniciar o servidor e fazê-lo "ouvir" na porta definida
app.listen(PORT, () => {
  console.log(`Servidor PatientsOnFIRE (Node.js) rodando em http://localhost:${PORT}`);
});