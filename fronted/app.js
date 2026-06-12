const responseBox = document.getElementById('response-box');
const copyButton = document.getElementById('copy-response');

const endpoints = {
  auth: '/api/auth',
  subject: '/api/subjects/data',
  enrollment: '/api/enrollments/data',
};

function setResponse(value, isError = false) {
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
      typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    );
  }

  return data;
}

async function submitForm(form, url) {
  const payload = normalizePayload(form);
  setResponse({ request: url, payload });

  try {
    const data = await requestJson(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setResponse(data);
  } catch (error) {
    setResponse(
      {
        error: error.message,
        hint:
          'Si ves error de red, revisa que el frontend comparta red con auth-service, enrollment-service y subject-service.',
      },
      true
    );
  }
}

function wireForm(id, url) {
  const form = document.getElementById(id);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitForm(form, url);
  });
}

wireForm('register-form', `${endpoints.auth}/register`);
wireForm('login-form', `${endpoints.auth}/login`);
wireForm('subject-form', endpoints.subject);
wireForm('enrollment-form', endpoints.enrollment);

document.querySelector('[data-action="health-subject"]').addEventListener('click', async () => {
  try {
    const data = await requestJson(`${endpoints.subject}/health`);
    setResponse(data);
  } catch (error) {
    setResponse({ error: error.message }, true);
  }
});

document.querySelector('[data-action="health-enrollment"]').addEventListener('click', async () => {
  try {
    const data = await requestJson(`${endpoints.enrollment}/health`);
    setResponse(data);
  } catch (error) {
    setResponse({ error: error.message }, true);
  }
});

document.querySelector('[data-action="clear-auth"]').addEventListener('click', () => {
  document.getElementById('register-form').reset();
  document.getElementById('login-form').reset();
  setResponse('Auth forms limpiados.');
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(responseBox.textContent);
    setResponse('JSON copiado al portapapeles.');
  } catch {
    setResponse('No se pudo copiar el JSON.', true);
  }
});

setResponse({
  auth: {
    register: `${endpoints.auth}/register`,
    login: `${endpoints.auth}/login`,
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
