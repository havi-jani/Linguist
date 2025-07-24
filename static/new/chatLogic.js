function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


const sendButton = document.getElementById("sendBtn");

  document.body.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        sendButton.click();     
      }
    }
  );

// Helper function to show chat section
function showChatSection() {
  document.getElementById("mainText").style.display = "none";

  const chatSection = document.getElementById("chatSection");
  chatSection.style.display = "flex";
  chatSection.style.flexDirection = "column";
  chatSection.style.gap = "1rem";

  return chatSection;
}

const fileInput = document.getElementById("file");

fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];

  if (file) {
    document.getElementById("query").style.display = "none";

    const pdfNameDiv = document.getElementById("pdfName");

    pdfNameDiv.innerText = "Uploaded File: " + file.name;
    pdfNameDiv.style.display = "block";
  } else {
    document.getElementById("query").style.display = "block";
    document.getElementById("pdfName").style.display = "none";
  }
});


document.getElementById("sendBtn").addEventListener("click", function (e) {
  const queryInput = document.getElementById("query");
  const toLang = document.getElementById("lang").value;
  const queryText = queryInput.value.trim();
  const fileInput = document.getElementById('file');
  const pdfName = document.getElementById('pdfName');

  if (fileInput.files && fileInput.files.length > 0) {

    console.log("In dOC");

    const chatSection = showChatSection();

    const rightMessage = document.createElement("div");
    rightMessage.className = "right-section text-end";

    const leftMessage = document.createElement("div");
    leftMessage.className = "left-section text-start";

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('lang', toLang);

    fetch('/doc/', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        let inp = fileInput.files[0].name;
        let msg = data.message;
        rightMessage.innerHTML = `<div class="p-2 bg-primary text-white rounded" style="max-width: 70%; margin-left: auto; width:fit-content;">${inp}</div>`;
        leftMessage.innerHTML = `<div class="p-2 bg-light border rounded" style="max-width: 70%; width:fit-content">Translated : "${msg}"</div>`;

        chatSection.appendChild(rightMessage);
        chatSection.appendChild(leftMessage);
        chatSection.scrollTop = chatSection.scrollHeight;

        fileInput.value = "";

        document.getElementById("pdfName").style.display = "none";
        document.getElementById("query").style.display = "block";      
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

  } else if (queryText !== "") {
    console.log("IN Txt");

    const chatSection = showChatSection();

    const rightMessage = document.createElement("div");
    rightMessage.className = "right-section text-end";
    rightMessage.innerHTML = `<div class="p-2 bg-primary text-white rounded" style="max-width: 70%; margin-left: auto; width:fit-content;">${queryText}</div>`;

    const leftMessage = document.createElement("div");
    leftMessage.className = "left-section text-start";

    const data = {
      txt: queryText,
      lang: toLang
    };

    fetch('/translate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        let msg = data.message;
        leftMessage.innerHTML = `<div class="p-2 bg-light border rounded" style="max-width: 70%; width:fit-content;">Translated : "${msg}"</div>`;

        chatSection.appendChild(rightMessage);
        chatSection.appendChild(leftMessage);
        chatSection.scrollTop = chatSection.scrollHeight;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

    queryInput.value = "";
  } else {
    console.log("Out");
  }
});
