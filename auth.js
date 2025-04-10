window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    const data = {
      client_id: "1357966673193340989",
      client_secret: "_wVCOvwLeI-vvZiLdzVYiBgfdM1S2xp9",
      grant_type: "authorization_code",
      redirect_uri: "https://densinistry.netlify.app/",
      code,
      scope: "identify"
    };

    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(data)
    });

    const { access_token } = await response.json();

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const user = await userResponse.json();

    localStorage.setItem("username", `${user.username}#${user.discriminator}`);
    localStorage.setItem("user_id", user.id);
    window.location.href = "/";
  }
};
