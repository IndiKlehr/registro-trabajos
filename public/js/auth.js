// ============================================================
// auth.js — Lógica de autenticación compartida
// ============================================================

const Auth = (() => {
    
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbMclzbXQJZLNtSKXeZ-VnjgG-qmBSQ_FhQfPRyfLLIGi05zqxC9hjPZgzAEmnuVpl/exec";

    const SESSION_KEY = "rt_session";

    // --- Hash SHA-256 del lado del cliente ---
    async function sha256(texto) {
        const buf = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(texto)
        );
        return Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    // --- Login ---
    async function login(usuario, password) {
        try {
            const hash = await sha256(password);

            const respuesta = await fetch(SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    accion: "login",
                    usuario: usuario,
                    passwordHash: hash
                })
            });

            const data = await respuesta.json();

            if (data.ok) {
                guardarSesion(usuario, data.token);
                return { ok: true };
            } else {
                return { ok: false, error: data.error || "Credenciales inválidas" };
            }
        } catch (err) {
            console.error("Error de login:", err);
            return { ok: false, error: "Error de conexión. Revisá tu internet." };
        }
    }

    // --- Guardar sesión (SIEMPRE en localStorage) ---
    function guardarSesion(usuario, token) {
        const sesion = {
            usuario: usuario,
            token: token,
            guardado: Date.now()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    }

    // --- Verificar si hay sesión válida ---
    function estaLogueado() {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return false;
        try {
            const sesion = JSON.parse(raw);
            return !!(sesion.token && sesion.usuario);
        } catch {
            return false;
        }
    }

    // --- Obtener datos de sesión ---
    function obtenerSesion() {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    // --- Cerrar sesión ---
    function cerrarSesion() {
        localStorage.removeItem(SESSION_KEY);
    }

    // --- URL pública por si la necesitás en app.js ---
    function getScriptUrl() {
        return SCRIPT_URL;
    }

    return { login, estaLogueado, obtenerSesion, cerrarSesion, sha256, getScriptUrl };
})();