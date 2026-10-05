// ============================================================
// login.js — Lógica exclusiva de la pantalla de login
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const errorMsg = document.getElementById('errorMsg');
    const inputUsuario = document.getElementById('usuario');
    const inputPassword = document.getElementById('password');

    // Si ya está logueado → directo a app.html
    if (Auth.estaLogueado()) {
        window.location.replace('app.html');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.classList.remove('show');

        btnText.textContent = "Verificando...";
        spinner.style.display = "block";
        btnLogin.disabled = true;

        const resultado = await Auth.login(
            inputUsuario.value.trim(),
            inputPassword.value
        );

        if (resultado.ok) {
            if (navigator.vibrate) navigator.vibrate(80);
            window.location.replace('app.html');
        } else {
            errorMsg.textContent = resultado.error || "Usuario o contraseña incorrectos";
            errorMsg.classList.add('show');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            btnText.textContent = "Ingresar";
            spinner.style.display = "none";
            btnLogin.disabled = false;
            inputPassword.value = '';
            inputPassword.focus();
        }
    });
});