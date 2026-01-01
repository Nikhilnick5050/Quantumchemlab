async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += <div><b>You:</b> ${message}</div>;
  input.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    chatBox.innerHTML += <div><b>AI:</b> ${data.reply}</div>;
  } catch (err) {
    chatBox.innerHTML += <div><b>Error:</b> AI not responding</div>;
  }
}