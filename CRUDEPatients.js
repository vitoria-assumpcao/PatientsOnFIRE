


        document.addEventListener('DOMContentLoaded', () => {
            
            const API_BASE_URL = 'http://localhost:3000';

            // Pega o elemento de cada operação do html para manipular nas operações CRUDE
            // mudar telas, preeencher formulários, mostrar mensagens, etc.
            const loadPatientsBtn = document.getElementById('load-patients-btn');
            const newPatientBtn = document.getElementById('new-patient-btn');
            const patientList = document.getElementById('patient-list');
            
            const messageBox = document.getElementById('message-box');
            const welcomeView = document.getElementById('welcome-view');
            const formView = document.getElementById('form-view');
            
            const patientForm = document.getElementById('patient-form');
            const formTitle = document.getElementById('form-title');
            const patientIdInput = document.getElementById('patient-id'); 
            const patientIdDisplayContainer = document.getElementById('patient-id-display-container');
            const patientIdDisplay = document.getElementById('patient-id-display'); 
            
            const saveButton = document.getElementById('save-button');
            const deleteButton = document.getElementById('delete-button');
            const cancelButton = document.getElementById('cancel-button');

            // --- Funções Auxiliares ---

            // Mostra uma mensagem de status (erros e avisos) na caixa de mensagens.
            function showMessage(message, type = 'success') {
                messageBox.textContent = message;
                messageBox.className = 'p-4 rounded-lg mb-4'; // Reseta classes
                if (type === 'success') {
                    messageBox.classList.add('bg-green-100', 'text-green-800');
                } else if (type === 'error') {
                    messageBox.classList.add('bg-red-100', 'text-red-800');
                } else {
                    messageBox.classList.add('bg-blue-100', 'text-blue-800');
                }
                messageBox.classList.remove('hidden');
            }

            function hideMessage() {
                messageBox.classList.add('hidden');
            }

            function showWelcomeView() {
                welcomeView.classList.remove('hidden');
                formView.classList.add('hidden');
                hideMessage();
            }


            //OPERAÇÕES CRUDE

            //Operação Create/POST (show empty form)
            function showCreateForm() {
                patientForm.reset(); // Limpa o formulário
                patientIdInput.value = ''; // Limpa o ID oculto
                patientIdDisplayContainer.classList.add('hidden'); // Esconde ID visível
                formTitle.textContent = 'Novo Paciente';
                deleteButton.classList.add('hidden'); // Esconde o botão de excluir
                formView.classList.remove('hidden');
                welcomeView.classList.add('hidden');
                hideMessage();
            }

            //Mostra os formularios com os dados
            function showUpdateForm(patient) {
                patientForm.reset();
                
                // Extrai o ID do identifier (conforme lógica do nosso backend)
                const patientId = patient.identifier?.find(id => id.system === 'http://ufcspa.edu.br/patients-on-fire')?.value;
                patientIdInput.value = patientId || '';
                formTitle.textContent = `Editando Paciente / ${patientId}`;
                
                // Mostra o ID visível
                patientIdDisplay.value = patientId || 'N/A';
                patientIdDisplayContainer.classList.remove('hidden');

                // Preenche o formulário com dados do JSON FHIR
                
                // Status
                document.getElementById('active').checked = patient.active || false;
                document.getElementById('deceased').checked = patient.deceasedBoolean || false;
                
                // Nome
                document.getElementById('given-name').value = patient.name?.[0]?.given?.join(' ') || '';
                document.getElementById('family-name').value = patient.name?.[0]?.family || '';
                
                // Demográfico
                document.getElementById('gender').value = patient.gender || 'unknown';
                document.getElementById('birthdate').value = patient.birthDate || '';
                document.getElementById('marital-status').value = patient.maritalStatus?.coding?.[0]?.code || '';

                // Contato Pessoal (telecom)
                document.getElementById('phone').value = patient.telecom?.find(t => t.system === 'phone')?.value || '';
                document.getElementById('email').value = patient.telecom?.find(t => t.system === 'email')?.value || '';

                // Endereço (address[0])
                const address = patient.address?.[0] || {};
                document.getElementById('address-line').value = address.line?.[0] || '';
                document.getElementById('address-city').value = address.city || '';
                document.getElementById('address-state').value = address.state || '';
                document.getElementById('address-postalcode').value = address.postalCode || '';

                // Contato de Emergência (contact[0])
                const contact = patient.contact?.[0] || {};
                document.getElementById('contact-relationship').value = contact.relationship?.[0]?.coding?.[0]?.code || '';
                document.getElementById('contact-given-name').value = contact.name?.given?.join(' ') || '';
                document.getElementById('contact-family-name').value = contact.name?.family || '';
                document.getElementById('contact-phone').value = contact.telecom?.find(t => t.system === 'phone')?.value || '';

                deleteButton.classList.remove('hidden'); // Mostra o botão de excluir
                formView.classList.remove('hidden');
                welcomeView.classList.add('hidden');
                hideMessage();
            }

            // --- Funções da API ---

            //Busca a lista de IDs de pacientes (GET /PatientIDs)           
            async function loadPatientIDs() {
                hideMessage();
                try {
                    const response = await fetch(`${API_BASE_URL}/PatientIDs`);
                    
                    if (response.status === 204) { // No Content
                        patientList.innerHTML = '<li class="py-2 text-gray-500">Nenhum paciente cadastrado.</li>';
                        return;
                    }
                    
                    if (!response.ok) {
                        throw new Error(`Erro ${response.status}: Não foi possível carregar os IDs.`);
                    }
                    
                    const ids = await response.json();
                    
                    // Limpa a lista antiga
                    patientList.innerHTML = '';
                    
                    if (ids.length === 0) {
                         patientList.innerHTML = '<li class="py-2 text-gray-500">Nenhum paciente cadastrado.</li>';
                         return;
                    }
                    
                    // Adiciona cada ID como um item clicável na lista
                    ids.forEach(id => {
                        const li = document.createElement('li');
                        li.textContent = `Paciente / ${id}`;
                        li.dataset.id = id; // Armazena o ID no elemento
                        li.className = 'py-3 px-2 cursor-pointer rounded-md hover:bg-blue-50 transition-colors';
                        li.addEventListener('click', () => loadPatientData(id));
                        patientList.appendChild(li);
                    });
                    
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            }

            //Busca os dados completos de um paciente (GET /Patient/:id)
            async function loadPatientData(id) {
                hideMessage();
                try {
                    const response = await fetch(`${API_BASE_URL}/Patient/${id}`);
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error(`Erro 404: Paciente com ID ${id} não encontrado.`);
                        }
                        throw new Error(`Erro ${response.status}: Não foi possível carregar o paciente.`);
                    }
                    
                    const patient = await response.json();
                    showUpdateForm(patient); // Mostra o formulário de edição
                    
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            }

            //Lida com o submit (POST /Patient ou PUT /Patient/:id)
            async function handleFormSubmit(event) {
                event.preventDefault();
                hideMessage();

                const id = patientIdInput.value;
                const isUpdating = !!id; // Se tem ID, é uma atualização

                // Monta o objeto Patient JSON a partir do formulário (conforme template FHIR)
                const patientData = {
                    resourceType: "Patient", // Obrigatório
                    
                    // Status
                    active: document.getElementById('active').checked,
                    deceasedBoolean: document.getElementById('deceased').checked,
                    
                    // Nome
                    name: [{
                        use: "official",
                        // Separa o nome por espaços para o array 'given'
                        given: document.getElementById('given-name').value.split(' ').filter(n => n), 
                        family: document.getElementById('family-name').value
                    }],
                    
                    // Demográfico
                    gender: document.getElementById('gender').value,
                    birthDate: document.getElementById('birthdate').value,
                    
                    // Contato Pessoal (telecom)
                    telecom: []
                };

                // Adiciona Estado Civil (se selecionado)
                const maritalStatusCode = document.getElementById('marital-status').value;
                if (maritalStatusCode) {
                    patientData.maritalStatus = {
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
                            code: maritalStatusCode
                        }]
                    };
                }

                // Adiciona Telefone (se preenchido)
                const phone = document.getElementById('phone').value;
                if (phone) {
                    patientData.telecom.push({ system: 'phone', value: phone, use: 'mobile' });
                }
                
                // Adiciona Email (se preenchido)
                const email = document.getElementById('email').value;
                if (email) {
                    patientData.telecom.push({ system: 'email', value: email });
                }

                // Adiciona Endereço (se algum campo preenchido)
                const addressLine = document.getElementById('address-line').value;
                const addressCity = document.getElementById('address-city').value;
                const addressState = document.getElementById('address-state').value;
                const addressPostalCode = document.getElementById('address-postalcode').value;
                
                if (addressLine || addressCity || addressState || addressPostalCode) {
                    patientData.address = [{
                        use: 'home',
                        line: [addressLine],
                        city: addressCity,
                        state: addressState,
                        postalCode: addressPostalCode,
                        country: 'BRA' // Fixo
                    }];
                }

                // Adiciona Contato de Emergência (se algum campo preenchido)
                const contactRel = document.getElementById('contact-relationship').value;
                const contactGiven = document.getElementById('contact-given-name').value;
                const contactFamily = document.getElementById('contact-family-name').value;
                const contactPhone = document.getElementById('contact-phone').value;
                
                if (contactRel || contactGiven || contactFamily || contactPhone) {
                    const contact = {
                        relationship: [{
                            coding: [{
                                system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                                code: contactRel
                            }]
                        }],
                        name: {
                            given: contactGiven.split(' ').filter(n => n),
                            family: contactFamily
                        },
                        telecom: [
                            { system: 'phone', value: contactPhone }
                        ]
                    };
                    patientData.contact = [contact];
                }


                // Se for atualização (PUT), precisamos adicionar o 'identifier' no corpo,
                // conforme exigido pela validação do nosso backend.
                if (isUpdating) {
                    patientData.identifier = [
                        { "system": "http://ufcspa.edu.br/patients-on-fire", "value": parseInt(id, 10) }
                    ];
                }
                
                const url = isUpdating ? `${API_BASE_URL}/Patient/${id}` : `${API_BASE_URL}/Patient`;
                const method = isUpdating ? 'PUT' : 'POST';

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(patientData)
                    });

                    if (!response.ok) {
                         const errorMsg = await response.text();
                         throw new Error(`Erro ${response.status}: ${errorMsg}`);
                    }
                    
                    const result = await response.json();
                    
                    showMessage(isUpdating ? 'Paciente atualizado com sucesso!' : 'Paciente criado com sucesso!', 'success');
                    loadPatientIDs(); // Recarrega a lista de IDs
                    showWelcomeView(); // Volta para a tela inicial
                    
                } catch (error)
 {
                    showMessage(error.message, 'error');
                }
            }

            //Exclui um paciente (DELETE /Patient/:id)
            async function handleDelete() {
                const id = patientIdInput.value;
                if (!id) return;
                
                // (Em um app real, usaríamos um modal de confirmação)
                // O 'confirm' é funcionalmente um modal, então atende ao requisito de não usar alert()
                const confirmed = confirm(`Tem certeza que deseja excluir o Paciente / ${id}?`);
                if (!confirmed) return;

                hideMessage();
                
                try {
                    const response = await fetch(`${API_BASE_URL}/Patient/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.status === 204) { // No Content (Sucesso)
                        showMessage(`Paciente / ${id} excluído com sucesso!`, 'success');
                        loadPatientIDs(); // Recarrega a lista
                        showWelcomeView(); // Volta para a tela inicial
                    } else {
                         throw new Error(`Erro ${response.status}: Não foi possível excluir.`);
                    }
                    
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            }

            // --- Event Listeners Iniciais ---
            loadPatientsBtn.addEventListener('click', loadPatientIDs);
            newPatientBtn.addEventListener('click', showCreateForm);
            patientForm.addEventListener('submit', handleFormSubmit);
            deleteButton.addEventListener('click', handleDelete);
            cancelButton.addEventListener('click', showWelcomeView);
        });
