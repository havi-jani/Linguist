let chatNumber = 0;

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const sendButton = document.getElementById("sendBtn");

document.body.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendButton.click();
  }
});

// Helper function to show chat section
function showChatSection() {
  document.getElementById("mainText").style.display = "none";

  const chatSection = document.getElementById("chatSection");
  chatSection.style.display = "flex";
  chatSection.style.flexDirection = "column";
  chatSection.style.gap = "1rem";

  return chatSection;
}

let fileURL = null;

const fileInput = document.getElementById("file");
const pdfNameDiv = document.getElementById("pdfName");

fileInput.addEventListener("change", function (e) {
  e.preventDefault();
  const file = fileInput.files[0];

  console.log("in change");

  if (file) {
    fileURL = URL.createObjectURL(file);

    document.getElementById("query").style.display = "none";

    pdfNameDiv.innerHTML = `<span>Uploaded File: </span><a href="${fileURL}" target="_blank">${file.name}</a>`;

    pdfNameDiv.style.display = "block";
  } else {
    document.getElementById("query").style.display = "block";
    pdfNameDiv.style.display = "none";
    fileURL = null;
  }
});

document.getElementById("sendBtn").addEventListener("click", function (e) {
  const queryInput = document.getElementById("query");
  const toLang = document.getElementById("lang").value;
  const queryText = queryInput.value.trim();
  const fileInput = document.getElementById("file");
  const pdfName = document.getElementById("pdfName");

  const rightMessage = document.createElement("div");
  rightMessage.className = "right-section text-end";

  const leftMessage = document.createElement("div");
  leftMessage.className = "left-section text-start";

  if (fileInput.files && fileInput.files.length > 0) {
    console.log("In dOC");

    const chatSection = showChatSection();

    let inp = fileInput.files[0].name;
    rightMessage.innerHTML = `<div class="p-2 bg-primary text-white rounded" style="max-width: 70%; margin-left: auto; width:fit-content;">${inp}</div>`;
    chatSection.appendChild(rightMessage);

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append('lang', toLang);


    fetch("/doc/", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        let msg = data.message;
        leftMessage.innerHTML = `<div class="p-2 bg-light border rounded" style="max-width: 70%; width:fit-content">Translated : "${msg}"</div>`;

        chatSection.appendChild(leftMessage);
        chatSection.scrollTop = chatSection.scrollHeight;

        fileInput.value = "";

        document.getElementById("pdfName").style.display = "none";
        document.getElementById("query").style.display = "block";

        storeConversation(rightMessage.innerText, leftMessage.innerText);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else if (queryText !== "") {
    console.log("IN Txt");

    const chatSection = showChatSection();

    rightMessage.innerHTML = `<div class="p-2 bg-primary text-white rounded" style="max-width: 70%; margin-left: auto; width:fit-content;">${queryText}</div>`;
    chatSection.appendChild(rightMessage);

    const data = {
      txt: queryText,
      lang: toLang,
    };

    fetch("/translate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        let msg = data.message;
        leftMessage.innerHTML = `<div class="p-2 bg-light border rounded" style="max-width: 70%; width:fit-content;">Translated : "${msg}"</div>`;

        chatSection.appendChild(leftMessage);
        chatSection.scrollTop = chatSection.scrollHeight;


        storeConversation(rightMessage.innerText, leftMessage.innerText);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    queryInput.value = "";
  } else {
    console.log("Out");
  }
});

function storeConversation(userMessage, chatbotResponse) {
  let conversations = JSON.parse(sessionStorage.getItem("conversations")) || {};

  if (!conversations[chatNumber]) {
    conversations[chatNumber] = [];
  }

  conversations[chatNumber].push({
    user: userMessage, 
    chatbot: chatbotResponse,  
  });

  sessionStorage.setItem("conversations", JSON.stringify(conversations));
}



document.getElementById("newChat").addEventListener("click", function() {


  let conversations = JSON.parse(sessionStorage.getItem("conversations")) || {};

  chatNumber = Object.keys(conversations).length + 1;
  document.getElementById("chatSection").innerHTML = ''; 
  document.getElementById("query").value = '';
  document.getElementById("file").value = '';

  document.getElementById("mainText").style.display = "inline";

  const chatSection = document.getElementById("chatSection");
  chatSection.style.display = "none";

  // loadConversations();
});



document.addEventListener("DOMContentLoaded", function(){
  loadConversations();
})

function loadConversations() {
  const div = document.getElementById("historyLoad");

  let conversations = JSON.parse(sessionStorage.getItem("conversations")) || {};

  // Check if there are no conversations
  if (Object.keys(conversations).length === 0) {
    div.innerHTML = `<p>No History Found</p>`;
    return;
  }

  // Iterate over all the stored chat sessions (chatNumber is used to determine how many chats exist)
  Object.keys(conversations).forEach((key) => {
    const chatData = conversations[key];

    if (chatData && chatData.length > 0) {
      const firstMessage = chatData[0]; // Get only the first message (user's first message)

      const newDiv = document.createElement("div");

      // Create a button to load the chat based on the session ID
      newDiv.innerHTML = `<p><button onclick="loadChat('${key}')"><strong>${firstMessage.user}</strong></button></p>`;

      div.appendChild(newDiv);
    }
  });
}

function loadChat(id) {
  let conversations = JSON.parse(sessionStorage.getItem("conversations")) || {};
  const chatData = conversations[id];

  if (chatData) {
    // Clear the current chat history
    const chatSection = showChatSection();
    chatSection.innerHTML= '';

    console.log(chatData);

    // Show the chat history of the selected chat
    chatData.forEach(message => {
      const rightMessage = document.createElement("div");
      rightMessage.className = "right-section text-end";
      rightMessage.innerHTML = `<div class="p-2 bg-primary text-white rounded" style="max-width: 70%; margin-left: auto; width:fit-content;">${message.user}</div>`;
      chatSection.appendChild(rightMessage);

      const leftMessage = document.createElement("div");
      leftMessage.className = "left-section text-start";
      leftMessage.innerHTML = `<div class="p-2 bg-light border rounded" style="max-width: 70%; width:fit-content;">${message.chatbot}</div>`;
      chatSection.appendChild(leftMessage);
    });

    // Scroll to the bottom of the chat section
    chatSection.scrollTop = chatSection.scrollHeight;

    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('historyOffcanvas'));
    offcanvas.hide();
  }
}
