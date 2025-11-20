const API_URL = "http://localhost/landingpage/API_landingpage_cities/backend/api"
    
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('authToken');
    let currentUserData = {}; 

    const nameValue = document.getElementById('name-value');
    const emailValue = document.getElementById('email-value');
    const bioValue = document.getElementById('bio-value');
    const feedbackDiv = document.getElementById('profile-feedback');

    async function loadUserProfile() {
        if (!token) {
            alert('Você precisa estar logado para ver esta página.');
            window.location.href = 'login.html';
            return;
        }
        try {
            const response = await fetch(`${API_URL}/user.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const user = await response.json();
                currentUserData = user; 
                displayUserData();
            } else {
                handleAuthError();
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert(feedbackDiv.textContent = 'Não foi possível carregar os dados do perfil.');
        }
    }

    function displayUserData() {
        const nameValueEl = document.getElementById('name-value');
        const emailValueEl = document.getElementById('email-value');
        const bioValueEl = document.getElementById('bio-value');

        if (nameValueEl) {
            nameValueEl.textContent = `${currentUserData.name} ${currentUserData.lastname}`;
        }
        if (emailValueEl) {
            emailValueEl.textContent = currentUserData.email;
        }
        if (bioValueEl) {
            bioValueEl.textContent = currentUserData.bio || 'Adicione uma bio...';
    }
    }

    function enterEditMode(field) {
        const container = document.getElementById(`${field}-value-container`);
        const editLink = document.querySelector(`[data-field="${field}"]`);
        
        const originalValue = (field === 'name') ? `${currentUserData.name} ${currentUserData.lastname}` : currentUserData[field];
        
        let inputHtml;
        if (field === 'bio') {
            inputHtml = `<textarea id="${field}-input" class="field-value">${currentUserData.bio || ''}</textarea>`;
        } else {
            inputHtml = `<input type="text" id="${field}-input" class="field-value" value="${originalValue}">`;
        }

        container.innerHTML = inputHtml;
        editLink.textContent = 'Salvar';
        editLink.dataset.mode = 'save'; 
    }

    async function saveField(field) {
        const input = document.getElementById(`${field}-input`);
        const newValue = input.value.trim();
        const editLink = document.querySelector(`[data-field="${field}"]`);
        
        const dataToSend = {};
        if (field === 'name') {
            const nameParts = newValue.split(' ');
            dataToSend.name = nameParts.shift(); 
            dataToSend.lastname = nameParts.join(' '); 
        } else {
            dataToSend[field] = newValue;
        }

        try {
            const response = await fetch(`${API_URL}/user_update.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (response.ok) {
                currentUserData = { ...currentUserData, ...result.user }; 
                feedbackDiv.textContent = result.message;
                feedbackDiv.style.color = 'green';
                exitEditMode(field);
            } else {
                feedbackDiv.textContent = result.message;
                feedbackDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            feedbackDiv.textContent = 'Erro de conexão ao salvar.';
        }
    }

    function exitEditMode(field) {
        const container = document.getElementById(`${field}-value-container`);
        const editLink = document.querySelector(`[data-field="${field}"]`);
        
        container.innerHTML = `<div class="field-value" id="${field}-value"></div>`;
        displayUserData(); 

        editLink.textContent = `Alterar ${field}`;
        editLink.dataset.mode = 'edit';
    }

    document.querySelector('.info-section').addEventListener('click', function(e) {
        if (e.target.classList.contains('field-edit-link')) {
            e.preventDefault();
            const field = e.target.dataset.field;
            const mode = e.target.dataset.mode;

            if (mode === 'save') {
                saveField(field);
            } else {
                enterEditMode(field);
            }
        }
    });

    function handleAuthError() {
        localStorage.removeItem('authToken');
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = 'login.html';
    }

    loadUserProfile();


    document.querySelector('.close-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});