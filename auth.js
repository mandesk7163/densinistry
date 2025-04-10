const clientId = "1357966673193340989";
const redirectUri = "https://denunciassinistry.netlify.app/";
const scope = "identify email";
const authEndpoint = "https://discord.com/api/oauth2/authorize";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const denunciaBtn = document.getElementById("abrirDenuncia");
const formulario = document.getElementById("formulario");

function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

function logout() {
  localStorage.clear();
  location.href = redirectUri;
}

function abrirFormulario() {
  formulario.style.display = "block";
  document.getElementById("nome").value = localStorage.getItem("username") || "Desconhecido";
}

async function fetchDiscordUser(token) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
}

async function handleAuth() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code && !isLoggedIn()) {
    const data = {
      client_id: clientId,
      client_secret: "_wVCOvwLeI-vvZiLdzVYiBgfdM1S2xp9",
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      scope
    };

    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data)
    });

    const { access_token } = await response.json();
    localStorage.setItem("access_token", access_token);

    const user = await fetchDiscordUser(access_token);
    localStorage.setItem("username", `${user.username}#${user.discriminator}`);
    localStorage.setItem("user_id", user.id);

    window.history.replaceState({}, document.title, redirectUri);
    showButtons();
  } else if (isLoggedIn()) {
    showButtons();
  }
}

function showButtons() {
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";
  denunciaBtn.style.display = "inline-block";
}

loginBtn.onclick = () => {
  window.location.href =
    `${authEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
};

handleAuth();
