console.log("MAIN CARREGADO!");

import { addRecipe, listRecipes, deleteRecipe } from "./idb.js";

// -----------------------------
// REGISTRO DO SERVICE WORKER
// -----------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch((err) => console.error("Erro SW:", err));
  });
}

// -----------------------------
// ELEMENTOS DO FORMULÁRIO
// -----------------------------
const form = document.getElementById("recipe-form");
const nameInput = document.getElementById("name-input");
const ingredientsInput = document.getElementById("ingredients-input");
const instructionsInput = document.getElementById("instructions-input");

// câmera
const openCameraBtn = document.getElementById("open-camera-btn");
const takePhotoBtn = document.getElementById("take-photo-btn");
const camera = document.getElementById("camera");
const cameraCanvas = document.getElementById("camera-canvas");

// preview
const previewDiv = document.getElementById("photo-preview");
const previewImg = document.getElementById("preview-img");
const removePhotoBtn = document.getElementById("remove-photo-btn");

let currentPhoto = null;
let stream = null;

// -----------------------------
// ABRIR CÂMERA
// -----------------------------
openCameraBtn.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });

    camera.srcObject = stream;
    camera.style.display = "block";
    takePhotoBtn.style.display = "block";

    openCameraBtn.style.display = "none";

  } catch (err) {
    console.error("Erro ao abrir câmera:", err);
    alert("Não foi possível acessar a câmera.");
  }
});

// -----------------------------
// TIRAR FOTO
// -----------------------------
takePhotoBtn.addEventListener("click", () => {
  cameraCanvas.width = camera.videoWidth;
  cameraCanvas.height = camera.videoHeight;

  const context = cameraCanvas.getContext("2d");
  context.drawImage(camera, 0, 0);

  currentPhoto = cameraCanvas.toDataURL("image/png");

  previewImg.src = currentPhoto;
  previewDiv.style.display = "block";

  // parar câmera
  stream.getTracks().forEach(track => track.stop());

  camera.style.display = "none";
  takePhotoBtn.style.display = "none";
  openCameraBtn.style.display = "block";
});

// -----------------------------
// REMOVER FOTO
// -----------------------------
removePhotoBtn.addEventListener("click", () => {
  currentPhoto = null;
  previewDiv.style.display = "none";
});

// -----------------------------
// SALVAR RECEITA NO IDB
// -----------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const recipe = {
    name: nameInput.value,
    ingredients: ingredientsInput.value,
    instructions: instructionsInput.value,
    photo: currentPhoto,
    timestamp: Date.now()
  };

  await addRecipe(recipe);

  // limpar
  nameInput.value = "";
  ingredientsInput.value = "";
  instructionsInput.value = "";
  currentPhoto = null;
  previewDiv.style.display = "none";

  loadRecipes();
});

// -----------------------------
// LISTAR RECEITAS
// -----------------------------
const listSection = document.getElementById("recipes-list");

async function loadRecipes() {
  const recipes = await listRecipes();

  if (recipes.length === 0) {
    listSection.innerHTML = "<p>Nenhuma receita cadastrada ainda.</p>";
    return;
  }

  listSection.innerHTML = "";

  recipes.forEach((recipe) => {
    const div = document.createElement("div");
    div.className = "book-item";

    const img = document.createElement("img");
    img.className = "book-photo";
    img.src = recipe.photo || "/images/icon-192.png";

    const info = document.createElement("div");
    info.className = "book-info";
    info.innerHTML = `
      <h3>${recipe.name}</h3>
      <p><strong>Ingredientes:</strong> ${recipe.ingredients}</p>
      <p><strong>Instruções:</strong> ${recipe.instructions}</p>
    `;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Excluir";
    delBtn.addEventListener("click", () => {
      deleteRecipe(recipe.id);
      loadRecipes();
    });

    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(delBtn);

    listSection.appendChild(div);
  });
}

loadRecipes();
