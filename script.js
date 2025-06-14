// Firebase Config (استبدل البيانات دي بتاعت مشروعك من Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyAB4jQLsOsJghIAgMLv9sZZAP4IhDnwMmQ",
  authDomain: "moaz-chat-f52c4.firebaseapp.com",
  projectId: "moaz-chat-f52c4",
  storageBucket: "moaz-chat-f52c4.appspot.com",
  messagingSenderId: "381978565592",
  appId: "1:381978565592:web:6fc8785e9d8d04be7cf0ad",
  measurementId: "G-RPH0S79WHS"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = '';
let recipient = '';

function enterChat() {
  const name = document.getElementById("username").value.trim();
  if (!name) return alert("Enter your name");

  currentUser = name;
  document.getElementById("userDisplay").textContent = name;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";

  loadUsers();
  listenForMessages();
}

function loadUsers() {
  db.collection("users").onSnapshot(snapshot => {
    const select = document.getElementById("recipientSelect");
    select.innerHTML = '<option disabled selected>Select someone to chat</option>';
    snapshot.forEach(doc => {
      if (doc.id !== currentUser) {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.id;
        select.appendChild(option);
      }
    });
  });

  db.collection("users").doc(currentUser).set({ active: true });
}

function sendMessage() {
  const msg = document.getElementById("messageInput").value.trim();
  const recipientSel = document.getElementById("recipientSelect");
  recipient = recipientSel.value;

  if (!msg || !recipient) return;

  db.collection("messages").add({
    from: currentUser,
    to: recipient,
    text: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("messageInput").value = '';
}

function listenForMessages() {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = '';

      snapshot.forEach(doc => {
        const msg = doc.data();
        if (
          (msg.from === currentUser && msg.to === recipient) ||
          (msg.from === recipient && msg.to === currentUser)
        ) {
          const div = document.createElement("div");
          div.className = "message " + (msg.from === currentUser ? "to" : "from");
          div.textContent = `${msg.from}: ${msg.text}`;
          chatBox.appendChild(div);
        }
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}