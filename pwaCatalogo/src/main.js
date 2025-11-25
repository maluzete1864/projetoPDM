console.log("MAIN CARREGADO!");

import { addBook, listBooks, deleteBook } from "./idb.js";

// -----------------------------
// REGISTRO DO SERVICE WORKER
// -----------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("Service Worker registrado com sucesso!"))
      .catch((err) => console.error("Erro ao registrar SW:", err));
  });
}

// -----------------------------
// ELEMENTOS DO FORMULÁRIO
// -----------------------------
const form = document.getElementById("book-form");
const titleInput = document.getElementById("title-input");
const authorInput = document.getElementById("author-input");

// PREVIEW
const previewDiv = document.getElementById("photo-preview");
const previewImg = document.getElementById("preview-img");
const removePhotoBtn = document.getElementById("remove-photo-btn");

// CÂMERA
const camera = document.getElementById("camera");
const cameraCanvas = document.getElementById("camera-canvas");
const openCameraBtn = document.getElementById("open-camera-btn");
const takePhotoBtn = document.getElementById("take-photo-btn");

let currentPhoto = null; // foto tirada
let cameraStream = null;

// -----------------------------
// ABRIR CÂMERA
// -----------------------------
openCameraBtn.addEventListener("click", async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" } // câmera traseira do celular
    });

    camera.srcObject = cameraStream;

    camera.style.display = "block";
    takePhotoBtn.style.display = "inline-block";
    previewDiv.style.display = "none";

    console.log("Câmera aberta");
  } catch (err) {
    alert("Erro ao acessar a câmera: " + err);
  }
});

// -----------------------------
// TIRAR FOTO
// -----------------------------
takePhotoBtn.addEventListener("click", () => {
  const ctx = cameraCanvas.getContext("2d");

  cameraCanvas.width = camera.videoWidth;
  cameraCanvas.height = camera.videoHeight;

  // Captura o quadro atual do vídeo
  ctx.drawImage(camera, 0, 0, cameraCanvas.width, cameraCanvas.height);

  // Salva como imagem
  currentPhoto = cameraCanvas.toDataURL("image/png");

  // Exibe preview
  previewImg.src = currentPhoto;
  previewDiv.style.display = "block";

  // Fecha câmera
  camera.style.display = "none";
  takePhotoBtn.style.display = "none";

  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
  }

  console.log("Foto capturada!");
});

// -----------------------------
// REMOVER FOTO
// -----------------------------
removePhotoBtn.addEventListener("click", () => {
  currentPhoto = null;
  previewDiv.style.display = "none";

  // Permitir abrir a câmera de novo
  openCameraBtn.style.display = "inline-block";
});

// -----------------------------
// SALVAR LIVRO NO IDB
// -----------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const book = {
    title: titleInput.value,
    author: authorInput.value,
    photo: currentPhoto, // foto real capturada
    timestamp: Date.now()
  };

  await addBook(book);

  // Limpa formulário
  titleInput.value = "";
  authorInput.value = "";
  previewDiv.style.display = "none";
  currentPhoto = null;

  loadBooks();
});

// -----------------------------
// LISTAR LIVROS
// -----------------------------
const listSection = document.getElementById("books-list");

async function loadBooks() {
  const books = await listBooks();

  if (books.length === 0) {
    listSection.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
    return;
  }

  listSection.innerHTML = "";

  books.forEach((book) => {
    const div = document.createElement("div");
    div.className = "book-item";

    const img = document.createElement("img");
    img.className = "book-photo";
    img.src = book.photo || "/images/icon-192.png";

    const info = document.createElement("div");
    info.className = "book-info";
    info.innerHTML = `<h3>${book.title}</h3><p>${book.author}</p>`;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Excluir";
    delBtn.addEventListener("click", () => {
      deleteBook(book.id);
      loadBooks();
    });

    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(delBtn);

    listSection.appendChild(div);
  });
}

// Carrega ao iniciar
loadBooks();
