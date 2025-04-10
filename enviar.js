const webhook = "https://discord.com/api/webhooks/1359899326872162594/FyLN2KjN46qA8DXYhY5-KWoAjsYaIud_88g8B73SGAAVEy1Aucs0BQGaiJ1ZTU58WOm1";
const palavrasProibidas = ["palavrão1", "palavrão2", "desgraça", "lixo", "puta", "fdp", "merda", "caralho", "vagabundo"];
const sightengineApiKey = "U9WnQxkoC2ditjbqELxsJ297WgS6a98e"; // Substitua pela sua chave da API Sightengine

function containsBadWords(text) {
  const lower = text.toLowerCase();
  return palavrasProibidas.some(p => lower.includes(p));
}

async function verificarConteudoImproprio(files) {
  for (let file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sightengineApiKey);

    // Verifica conteúdo impróprio nas imagens e vídeos
    try {
      const response = await fetch("https://api.sightengine.com/1.0/validate-image.json", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (result && result.probability && result.probability > 0.9) { // Verifique a probabilidade do conteúdo ser impróprio
        return true;
      }
    } catch (e) {
      console.error("Erro ao verificar o conteúdo:", e);
    }
  }
  return false;
}

async function enviarDenuncia() {
  const nome = document.getElementById("nome").value.trim();
  const motivo = document.getElementById("motivo").value.trim();
  const link = document.getElementById("link").value.trim();
  const files = document.getElementById("midia").files;

  const username = localStorage.getItem("username") || "Desconhecido";
  const user_id = localStorage.getItem("user_id") || "Sem ID";

  // Verificação de campos
  if (!nome || !motivo || !link) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  // Verificação de palavras proibidas
  if (containsBadWords(nome) || containsBadWords(motivo)) {
    alert("Sua denúncia contém palavrões ou conteúdo ilícito. Isso será enviado aos admins!");
    return;
  }

  // Verificar conteúdo impróprio em imagens/vídeos
  const temConteudoImproprio = await verificarConteudoImproprio(files);
  if (temConteudoImproprio) {
    document.getElementById("sucesso").style.display = "none";
    alert("Tem algo inapropriado, por favor colabore!");
    return;
  }

  // Monta denúncia válida
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
      const msg = document.getElementById("sucesso");
      msg.style.display = "block";
      setTimeout(() => msg.style.display = "none", 3000);
      document.getElementById("formulario").reset();
    } else {
      alert("Erro ao enviar denúncia. Verifique o webhook.");
    }
  } catch (e) {
    alert("Erro ao enviar denúncia.");
    console.error(e);
  }
    }
                  
