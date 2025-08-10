// Import the API configuration
import { API_CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // Tab switching functionality
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active form
            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${targetTab}-form`).classList.add('active');
            
            // Clear message
            hideMessage();
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = {
            action: 'login',
            name: formData.get('name'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/.netlify/functions/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                // Store login state in localStorage for simple session management
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', data.name);
                setTimeout(() => {
                    window.location.href = '/hello.html';
                }, 1000);
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('An error occurred. Please try again.', 'error');
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const data = {
            action: 'signup',
            name: formData.get('name'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/.netlify/functions/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                // Store login state in localStorage for simple session management
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', data.name);
                setTimeout(() => {
                    window.location.href = '/hello.html';
                }, 1000);
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('An error occurred. Please try again.', 'error');
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    }

    function hideMessage() {
        messageDiv.style.display = 'none';
        messageDiv.className = 'message';
    }

    // Add smooth input animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});
