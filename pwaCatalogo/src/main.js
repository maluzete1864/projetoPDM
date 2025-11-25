import { addBook, listBooks, deleteBook } from "./idb.js";

// -----------------------------
// REGISTRO DO SERVICE WORKER
// -----------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("SW registrado"))
      .catch((err) => console.error("Erro SW:", err));
  });
}

// -----------------------------
// ELEMENTOS DO FORMULÁRIO
// -----------------------------
const form = document.getElementById("book-form");
const titleInput = document.getElementById("title-input");
const authorInput = document.getElementById("author-input");
const fileInput = document.getElementById("file-input");
const previewDiv = document.getElementById("photo-preview");
const previewImg = document.getElementById("preview-img");
const removePhotoBtn = document.getElementById("remove-photo-btn");

let currentPhoto = null; // DataURL

// -----------------------------
// PREVIEW DA FOTO
// -----------------------------
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    currentPhoto = reader.result;
    previewImg.src = currentPhoto;
    previewDiv.style.display = "block";
  };
  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener("click", () => {
  currentPhoto = null;
  previewDiv.style.display = "none";
  fileInput.value = "";
});

// -----------------------------
// SALVAR LIVRO NO IDB
// -----------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const book = {
    title: titleInput.value,
    author: authorInput.value,
    photo: currentPhoto,
    timestamp: Date.now()
  };

  await addBook(book);

  titleInput.value = "";
  authorInput.value = "";
  currentPhoto = null;
  previewDiv.style.display = "none";
  fileInput.value = "";

  loadBooks(); // Atualiza lista
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
