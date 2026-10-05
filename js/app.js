// ============================================================
// app.js — Lógica exclusiva del formulario de registro
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // 0. VERIFICACIÓN DE SESIÓN
    // ============================================================
    if (!Auth.estaLogueado()) {
        window.location.replace('index.html');
        return;
    }

    document.getElementById('btnSalir').addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            Auth.cerrarSesion();
            window.location.replace('index.html');
        }
    });

    // ============================================================
    // 1. FECHA Y DÍA
    // ============================================================
    const inputFecha = document.getElementById('fecha');
    const inputDia = document.getElementById('dia');
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const hoyLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
    inputFecha.value = hoyLocal.toISOString().split('T')[0];

    function actualizarDia() {
        if (inputFecha.value) {
            const fechaObj = new Date(inputFecha.value + 'T12:00:00');
            inputDia.value = diasSemana[fechaObj.getDay()];
        }
    }

    actualizarDia();
    inputFecha.addEventListener('change', actualizarDia);

    // ============================================================
    // 2. CHIPS DE CULTIVO
    // ============================================================
    const chips = document.querySelectorAll('.chip');
    const inputCultivo = document.getElementById('cultivo');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            inputCultivo.value = chip.dataset.value;
            if (navigator.vibrate) navigator.vibrate(20);
        });
    });

    // ============================================================
    // 3. TOAST
    // ============================================================
    let toastTimeout;
    function mostrarToast(mensaje, tipo) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMsg');

        toastMsg.textContent = mensaje;
        toast.className = 'show ' + tipo;

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }

    // ============================================================
    // 4. ENVÍO DE REGISTROS
    // ============================================================
    const SCRIPT_URL = Auth.getScriptUrl(); // ← URL centralizada en auth.js
    const form = document.getElementById('registroForm');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!inputCultivo.value) {
            mostrarToast('Seleccioná un cultivo', 'error');
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            return;
        }

        const sesionActual = Auth.obtenerSesion();
        if (!sesionActual) {
            mostrarToast('Sesión expirada', 'error');
            setTimeout(() => window.location.replace('index.html'), 1500);
            return;
        }

        btnText.textContent = 'Guardando...';
        spinner.style.display = 'block';
        btnGuardar.disabled = true;

        const datos = {
            accion: 'guardar',
            token: sesionActual.token,
            fecha: inputFecha.value,
            dia: inputDia.value,
            lote: document.getElementById('lote').value,
            cultivo: inputCultivo.value,
            hectareas: document.getElementById('hectareas').value,
            gasoil: document.getElementById('gasoil').value
        };

        try {
            const respuesta = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            if (!resultado.ok) {
                if (resultado.error && resultado.error.includes('Sesión')) {
                    mostrarToast('Sesión expirada, redirigiendo...', 'error');
                    Auth.cerrarSesion();
                    setTimeout(() => window.location.replace('index.html'), 1500);
                    return;
                }
                throw new Error(resultado.error || 'Error al guardar');
            }

            mostrarToast('¡Guardado con éxito!', 'success');
            if (navigator.vibrate) navigator.vibrate(100);

            // Limpiar
            document.getElementById('lote').value = '';
            document.getElementById('hectareas').value = '';
            document.getElementById('gasoil').value = '';
            inputCultivo.value = '';
            chips.forEach(c => c.classList.remove('selected'));

        } catch (error) {
            console.error('Error:', error);
            mostrarToast(error.message || 'Error de conexión', 'error');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } finally {
            btnText.textContent = 'Guardar Registro';
            spinner.style.display = 'none';
            btnGuardar.disabled = false;
        }
    });
});