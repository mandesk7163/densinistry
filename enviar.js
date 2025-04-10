const webhook = "https://discord.com/api/webhooks/1359843392120426632/0pF_gjBNUosYs8dqIOMuyel_N9f4mtKLxBzykEmJANTB1jsEhrRcgKzZNNlaZA8ve7er";
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

  const username = localStorage.getItem("username") || "Desconhecido";
  const user_id = localStorage.getItem("user_id") || "Sem ID";

  // Verificação de campos
  if (!nome || !motivo || !link) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  // Verificação de conteúdo impróprio
  if (containsBadWords(nome) || containsBadWords(motivo)) {
    alert("Sua denúncia contém palavrões ou conteúdo ilícito. Isso será enviado aos admins!");

    const formData = new FormData();
    const txt = criarArquivoDenuncia(`${username} (${user_id})`, motivo, link);
    formData.append("file", txt, "violacao.txt");

    formData.append("payload_json", JSON.stringify({
      content: `⚠️ **Denúncia com possível violação detectada!**`,
      embeds: [{
        title: "Usuário violou regras de denúncia",
        fields: [
          { name: "Usuário", value: username },
          { name: "ID", value: user_id },
          { name: "Motivo Enviado", value: motivo }
        ]
      }],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 4,
          label: "Castigar por 5 minutos",
          custom_id: "castigo_5min"
        }]
      }]
    }));

    await fetch(webhook, {
      method: "POST",
      body: formData
    });

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
