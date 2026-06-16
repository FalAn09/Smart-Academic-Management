const endpoints = {
  auth: '/api/auth',
  subject: '/api/subjects/data',
  enrollment: '/api/enrollments/data',
};

const responseBox = document.getElementById('response-box');
const copyButton = document.getElementById('copy-response');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const subjectForm = document.getElementById('subject-form');
const enrollmentForm = document.getElementById('enrollment-form');
const logoutButton = document.getElementById('logout-button');

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
  const numericFields = new Set(['credits', 'hours', 'maxCapacity']);

  for (const [key, value] of Object.entries(payload)) {
    if (value === '') {
      delete payload[key];
      continue;
    }

    if (numericFields.has(key)) {
      payload[key] = Number(value);
    }
  }

  return payload;
}

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

function saveSession(data) {
  const token = data?.data?.accessToken || data?.accessToken || '';
  const refreshToken = data?.data?.refreshToken || data?.refreshToken || '';
  const user = data?.data?.user || data?.user || null;

  if (token) localStorage.setItem('sam_access_token', token);
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

async function submitForm(form, url, method = 'POST') {
  const payload = normalizePayload(form);
  setResponse({ request: url, payload });

  try {
    const data = await requestJson(url, {
      method,
      body: JSON.stringify(payload),
    });
    setResponse(data);
  } catch (error) {
    setResponse(
      {
        error: error.message,
        hint: 'Si ves error de red, revisa que el frontend comparta red con auth-service, enrollment-service y subject-service.',
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

async function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const payload = normalizePayload(form);

  try {
    const data = await requestJson(`${endpoints.auth}/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    saveSession(data);
    window.location.href = '/dashboard.html';
  } catch (error) {
    alert(`No se pudo iniciar sesion: ${error.message}`);
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
      alert('Registro creado con exito. Ahora puedes iniciar sesion.');
    } catch (error) {
      alert(`No se pudo registrar: ${error.message}`);
    }
  });
}

if (isDashboard()) {
  if (!getToken()) {
    window.location.href = '/';
  }

  const user = getUser();
  const sessionUser = document.getElementById('session-user');
  if (sessionUser && user) {
    sessionUser.textContent = user.username
      ? `@${user.username}`
      : 'Sesion activa';
  }

  wireForm(subjectForm, endpoints.subject);
  wireForm(enrollmentForm, endpoints.enrollment);

  const healthSubjectButton = document.querySelector(
    '[data-action="health-subject"]',
  );
  const healthEnrollmentButton = document.querySelector(
    '[data-action="health-enrollment"]',
  );
  const loadProfileButton = document.querySelector(
    '[data-action="load-profile"]',
  );
  const validateTokenButton = document.querySelector(
    '[data-action="validate-token"]',
  );
  const refreshTokenButton = document.querySelector(
    '[data-action="refresh-token"]',
  );

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
        if (data?.data?.accessToken)
          localStorage.setItem('sam_access_token', data.data.accessToken);
        if (data?.data?.refreshToken)
          localStorage.setItem('sam_refresh_token', data.data.refreshToken);
        setResponse(data);
      } catch (error) {
        setResponse({ error: error.message }, true);
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('sam_access_token');
      localStorage.removeItem('sam_refresh_token');
      localStorage.removeItem('sam_user');
      window.location.href = '/';
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
  });
}
