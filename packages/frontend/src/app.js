// 1. CONFIGURACIÓN DE ENDPOINTS
const endpoints = {
  auth: '/api/auth',
  subject: '/api/subjects',
  enrollment: '/api/enrollments',
  program: '/api/programs/data',
  classroom: '/api/classrooms/data',
};

// 2. ELEMENTOS DEL DOM
const responseBox = document.getElementById('response-box');
const copyButton = document.getElementById('copy-response');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const subjectForm = document.getElementById('subject-form');
const enrollmentForm = document.getElementById('enrollment-form');
const programForm = document.getElementById('program-form');
const classroomForm = document.getElementById('classroom-form');
const logoutButton = document.getElementById('logout-button');

// 3. FUNCIONES UTILITARIAS
function isDashboard() {
  return Boolean(responseBox);
}

function setResponse(value, isError = false) {
  if (!responseBox) return;

  if (typeof value === 'string') {
    responseBox.textContent = value;
    responseBox.className = isError ? 'error' : '';
    return;
  }

  responseBox.textContent = JSON.stringify(value, null, 2);
  responseBox.className = isError ? 'error' : '';
}

function normalizePayload(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const numericFields = new Set([
    'credits',
    'hours',
    'maxCapacity',
    'totalSemesters',
    'capacity',
  ]);
  const booleanFields = new Set(['isActive']);

  for (const [key, value] of Object.entries(payload)) {
    if (value === '') {
      payload[key] = '';
      continue;
    }

    if (numericFields.has(key)) {
      payload[key] = Number(value);
      continue;
    }

    if (booleanFields.has(key)) {
      payload[key] = value === 'true';
    }
  }

  return payload;
}

// 4. CLIENTE HTTP BASE
async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const raw = await response.text();
  let data = raw;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    );
  }

  return data;
}

// 5. GESTIÓN DE SESIÓN (Mapeo ultra flexible de tokens)
function saveSession(data) {
  console.log("Estructura exacta recibida del backend:", data);

  // Captura variantes comunes de NestJS (accessToken, access_token, data.token, etc.)
  const token = data?.accessToken || 
                data?.access_token || 
                data?.data?.accessToken || 
                data?.data?.access_token || 
                data?.token || 
                '';
                
  const refreshToken = data?.refreshToken || 
                       data?.refresh_token || 
                       data?.data?.refreshToken || 
                       '';
                       
  const user = data?.user || 
               data?.data?.user || 
               null;

  if (token) {
    localStorage.setItem('sam_access_token', token);
    console.log("Token guardado con éxito en LocalStorage.");
  } else {
    console.error("No se pudo extraer ningún token del JSON de respuesta. Revisa el objeto impreso arriba.");
  }

  if (refreshToken) localStorage.setItem('sam_refresh_token', refreshToken);
  if (user) localStorage.setItem('sam_user', JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem('sam_access_token') || '';
}

function getUser() {
  const raw = localStorage.getItem('sam_user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function authorizedRequest(url, options = {}) {
  const token = getToken();
  return requestJson(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

// 6. CONTROLADORES DE FORMULARIOS
async function submitForm(form, url, method = 'POST') {
  const payload = normalizePayload(form);
  setResponse({ request: url, payload });

  try {
    const data = await authorizedRequest(url, {
      method,
      body: JSON.stringify(payload),
    });
    setResponse(data);
  } catch (error) {
    setResponse(
      {
        error: error.message,
        hint: 'Si ves error de red, revisa que el frontend comparta red con el api-gateway.',
      },
      true,
    );
  }
}

function wireForm(form, url) {
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitForm(form, url);
  });
}

// LOGIN CONTROLADO CON VERIFICACIÓN PRE-REDIRECCIÓN
async function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const payload = normalizePayload(form);

  try {
    console.log("Enviando credenciales de acceso...");
    const data = await requestJson(`${endpoints.auth}/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    saveSession(data);

    // Validación antes de redirigir
    const tokenVerificado = localStorage.getItem('sam_access_token');
    if (!tokenVerificado) {
      alert("Error: El token no se guardó en el navegador de forma correcta. Revisa la consola F12.");
      return; // Detiene la redirección para que puedas examinar el log
    }

    console.log("Redirección autorizada.");
    window.location.href = '/dashboard.html';
  } catch (error) {
    alert(`No se pudo iniciar sesion: ${error.message}`);
  }
}

// 7. LISTENERS PRINCIPALES
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = normalizePayload(registerForm);

    try {
      await requestJson(`${endpoints.auth}/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      registerForm.reset();
      alert('Registro creado con éxito. Ahora puedes iniciar sesión.');
    } catch (error) {
      alert(`No se pudo registrar: ${error.message}`);
    }
  });
}

// 8. CONTROL DE FLUJO EN EL DASHBOARD (Optimizado)
document.addEventListener('DOMContentLoaded', () => {
  if (isDashboard()) {
    const token = getToken();
    
    // Si no hay token, lo mandamos al login de forma segura sin romper el ciclo
    if (!token) {
      console.warn("Acceso no autorizado al Dashboard. Redirigiendo a Login...");
      if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.replace('/');
      }
      return;
    }

    console.log("¡Acceso autorizado al Dashboard con Token válido!");

    const user = getUser();
    const sessionUser = document.getElementById('session-user');
    if (sessionUser && user) {
      sessionUser.textContent = user.username ? `@${user.username}` : 'Sesión activa';
    }

    // Vinculación de formularios académicos
    wireForm(subjectForm, endpoints.subject);
    wireForm(enrollmentForm, endpoints.enrollment);
    wireForm(programForm, endpoints.program);
    wireForm(classroomForm, endpoints.classroom);

    // Configuración de botones de Health Check y Perfil
    const healthSubjectButton = document.querySelector('[data-action="health-subject"]');
    const healthEnrollmentButton = document.querySelector('[data-action="health-enrollment"]');
    const loadProfileButton = document.querySelector('[data-action="load-profile"]');
    const validateTokenButton = document.querySelector('[data-action="validate-token"]');
    const refreshTokenButton = document.querySelector('[data-action="refresh-token"]');

    if (healthSubjectButton) {
      healthSubjectButton.addEventListener('click', async () => {
        try {
          const data = await requestJson(`${endpoints.subject}/health`);
          setResponse(data);
        } catch (error) {
          setResponse({ error: error.message }, true);
        }
      });
    }

    if (healthEnrollmentButton) {
      healthEnrollmentButton.addEventListener('click', async () => {
        try {
          const data = await requestJson(`${endpoints.enrollment}/health`);
          setResponse(data);
        } catch (error) {
          setResponse({ error: error.message }, true);
        }
      });
    }

    const healthProgramButton = document.querySelector('[data-action="health-program"]');
    const healthClassroomButton = document.querySelector('[data-action="health-classroom"]');

    if (healthProgramButton) {
      healthProgramButton.addEventListener('click', async () => {
        try {
          const data = await requestJson(`${endpoints.program}/health`);
          setResponse(data);
        } catch (error) {
          setResponse({ error: error.message }, true);
        }
      });
    }

    if (healthClassroomButton) {
      healthClassroomButton.addEventListener('click', async () => {
        try {
          const data = await requestJson(`${endpoints.classroom}/health`);
          setResponse(data);
        } catch (error) {
          setResponse({ error: error.message }, true);
        }
      });
    }

    if (loadProfileButton) {
      loadProfileButton.addEventListener('click', async () => {
        try {
          const data = await authorizedRequest(`${endpoints.auth}/profile`);
          setResponse(data);
        } catch (error) {
          setResponse({ error: error.message }, true);
        }
      });
    }

    if (validateTokenButton) {
      validateTokenButton.addEventListener('click', async () => {
        try {
          const data = await requestJson(`${endpoints.auth}/validate-token`, {
            method: 'POST',
            body: JSON.stringify({ token: getToken() }),
          });
          setResponse(data);
        } catch (error) {
          setResponse({ error: error.message }, true);
        }
      });
    }

    if (refreshTokenButton) {
      refreshTokenButton.addEventListener('click', async () => {
        try {
          const data = await requestJson(`${endpoints.auth}/refresh-token`, {
            method: 'POST',
            body: JSON.stringify({
              refreshToken: localStorage.getItem('sam_refresh_token') || '',
            }),
          });
          if (data?.accessToken) localStorage.setItem('sam_access_token', data.accessToken);
          if (data?.data?.accessToken) localStorage.setItem('sam_access_token', data.data.accessToken);
          setResponse(data);
        } catch (error) {
          setResponse({ error: error.message }, true);
        }
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.replace('/');
      });
    }

    if (copyButton) {
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(responseBox.textContent);
          setResponse('JSON copiado al portapapeles.');
        } catch {
          setResponse('No se pudo copiar el JSON.', true);
        }
      });
    }

    setResponse({
      auth: {
        profile: `${endpoints.auth}/profile`,
        validateToken: `${endpoints.auth}/validate-token`,
        refreshToken: `${endpoints.auth}/refresh-token`,
      },
      subject: {
        create: endpoints.subject,
        health: `${endpoints.subject}/health`,
      },
      enrollment: {
        create: endpoints.enrollment,
        health: `${endpoints.enrollment}/health`,
      },
      program: {
        create: endpoints.program,
        health: `${endpoints.program}/health`,
      },
      classroom: {
        create: endpoints.classroom,
        health: `${endpoints.classroom}/health`,
      },
    });
  }
});