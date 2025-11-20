const API_URL = "https://rstrip.infinityfreeapp.com/api";

const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });     

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const feedbackDiv = document.getElementById('login-feedback');
    const submitButton = this.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';
    feedbackDiv.textContent = '';

    const loginData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
    };

    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) { 
            feedbackDiv.style.color = 'green';
            feedbackDiv.textContent = result.message + ' Redirecionando...';

            localStorage.setItem('authToken', result.token);

            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 2000);

        } else { 
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = result.message;
        }

    } catch (error) {
        console.error('Erro de conexão:', error);
        feedbackDiv.style.color = 'red';
        feedbackDiv.textContent = 'Não foi possível conectar ao servidor.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
    }
});

    document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const feedbackDiv = document.getElementById('register-feedback');
    const submitButton = this.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Criando...';
    feedbackDiv.textContent = ''; 
    
    const userData = {
        name: document.getElementById('reg-name').value,
        lastname: document.getElementById('reg-lastname').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        confirmpassword: document.getElementById('reg-password2').value
    };


    try {
        const response = await fetch(`${API_URL}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData) 
        });

        const result = await response.json();   

        if (response.ok) { 
            feedbackDiv.style.color = 'green';
            feedbackDiv.textContent = result.message;
            alert(result.message)
            setTimeout(() => {
                registerContainer.classList.add('hidden');
                loginContainer.classList.remove('hidden');
            
                document.getElementById('register-form').reset();
                feedbackDiv.textContent = ''; 

            }, 2500);

        } else { 
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = result.message;
        }

    } catch (error) {
        console.error('Erro de conexão:', error);
        feedbackDiv.style.color = 'red';
        feedbackDiv.textContent = 'Não foi possível conectar ao servidor. Tente novamente.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Criar conta';
    }
});