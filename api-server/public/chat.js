function startChat() {
  console.log(adonis);
  ws = adonis.Ws().connect();
  console.log("test");
  ws.on("open", () => {
    console.log("open");
  });

  ws.on("error", () => {
    console.log("error");
  });
}

// if (window.username) {
window.onload = () => {
  startChat();
};
// }
