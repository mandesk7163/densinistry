const webhook = "https://discord.com/api/webhooks/1359899326872162594/FyLN2KjN46qA8DXYhY5-KWoAjsYaIud_88g8B73SGAAVEy1Aucs0BQGaiJ1ZTU58WOm1";
const palavrasProibidas = ["palavrão1", "palavrão2", "desgraça", "lixo", "puta", "fdp", "merda", "caralho", "vagabundo"];

function containsBadWords(text) {
  const lower = text.toLowerCase();
  return palavrasProibidas.some(p => lower.includes(p));
}

function criarArquivoDenuncia(usuario, motivo, link) {
  return new Blob([
    `Usuário: ${usuario}\nMotivo: ${motivo}\nServidor denunciado: ${link}`
  ], { type: 'text/plain' });
}

async function enviarDenuncia() {
  const nome = document.getElementById("nome").value.trim();
  const motivo = document.getElementById("motivo").value.trim();
  const link = document.getElementById("link").value.trim();
  const files = document.getElementById("midia").files;
  const erroDiv = document.getElementById("erro");
  const sucessoDiv = document.getElementById("sucesso");

  erroDiv.style.display = "none"; // Oculta erro antes de começar

  const username = localStorage.getItem("username") || "Desconhecido";
  const user_id = localStorage.getItem("user_id") || "Sem ID";

  // Verificação de campos obrigatórios
  if (!nome || !motivo || !link) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  // Verificação de conteúdo impróprio
  if (containsBadWords(nome) || containsBadWords(motivo)) {
    erroDiv.style.display = "block"; // Exibe a mensagem de erro
    return;
  }

  // Conteúdo válido, pode enviar
  const formData = new FormData();
  const txt = criarArquivoDenuncia(`${username} (${user_id})`, motivo, link);
  formData.append("file", txt, "denuncia.txt");

  for (let i = 0; i < files.length; i++) {
    formData.append(`files[${i}]`, files[i]);
  }

  formData.append("payload_json", JSON.stringify({
    content: "**Nova denúncia recebida!**",
    embeds: [{
      title: "Denúncia",
      fields: [
        { name: "Usuário", value: username },
        { name: "ID", value: user_id },
        { name: "Motivo", value: motivo },
        { name: "Link", value: link }
      ]
    }]
  }));

  try {
    const response = await fetch(webhook, {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      sucessoDiv.style.display = "block";
      document.getElementById("formulario").reset();
      setTimeout(() => sucessoDiv.style.display = "none", 3000);
    } else {
      alert("Erro ao enviar denúncia. Verifique o webhook.");
    }
  } catch (e) {
    alert("Erro ao enviar denúncia.");
    console.error(e);
  }
}
