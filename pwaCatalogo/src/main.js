import { addRecipe, listRecipes, deleteRecipe } from "./idb.js";

// 
// REGISTRO DO SERVICE WORKER
// 
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("SW registrado"))
      .catch(err => console.error("Erro SW:", err))
  );
}

// 
// ELEMENTOS DO FORMULÁRIO & FOTO
// 
const form = document.getElementById("recipe-form");
const nameInput = document.getElementById("name-input");
const ingredientsInput = document.getElementById("ingredients-input");
const instructionsInput = document.getElementById("instructions-input");

const openCameraBtn = document.getElementById("open-camera-btn");
const takePhotoBtn = document.getElementById("take-photo-btn");
const camera = document.getElementById("camera");
const cameraCanvas = document.getElementById("camera-canvas");

const previewDiv = document.getElementById("photo-preview");
const previewImg = document.getElementById("preview-img");
const removePhotoBtn = document.getElementById("remove-photo-btn");

const listSection = document.getElementById("recipes-list");

let currentPhoto = null;
let stream = null;

// 
//  AUXILIARES
// 
async function openCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
    camera.style.display = takePhotoBtn.style.display = "block";
    openCameraBtn.style.display = "none";
  } catch {
    alert("Não foi possível acessar a câmera.");
  }
}

function takePhoto() {
  cameraCanvas.width = camera.videoWidth;
  cameraCanvas.height = camera.videoHeight;
  cameraCanvas.getContext("2d").drawImage(camera, 0, 0);
  currentPhoto = cameraCanvas.toDataURL("image/png");

  previewImg.src = currentPhoto;
  previewDiv.style.display = "block";

  stream.getTracks().forEach(track => track.stop());
  camera.style.display = takePhotoBtn.style.display = "none";
  openCameraBtn.style.display = "block";
}

function removePhoto() {
  currentPhoto = null;
  previewDiv.style.display = "none";
}

async function saveRecipe(e) {
  e.preventDefault();
  const recipe = {
    name: nameInput.value,
    ingredients: ingredientsInput.value,
    instructions: instructionsInput.value,
    photo: currentPhoto,
    timestamp: Date.now()
  };
  await addRecipe(recipe);
  form.reset();
  removePhoto();
  loadRecipes();
}

async function loadRecipes() {
  const recipes = await listRecipes();
  listSection.innerHTML = recipes.length
    ? ""
    : "<p>Nenhuma receita cadastrada ainda.</p>";

  recipes.forEach(recipe => {
    const div = document.createElement("div");
    div.className = "book-item";

    div.innerHTML = `
      <img class="book-photo" src="${recipe.photo || '/images/icon-192.png'}">
      <div class="book-info">
        <h3>${recipe.name}</h3>
        <p><strong>Ingredientes:</strong> ${recipe.ingredients}</p>
        <p><strong>Instruções:</strong> ${recipe.instructions}</p>
      </div>
      <button class="delete-btn">Excluir</button>
    `;

    div.querySelector(".delete-btn").addEventListener("click", async () => {
      await deleteRecipe(recipe.id);
      loadRecipes();
    });

    listSection.appendChild(div);
  });
}

// 
// EVENTOS
// 
openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);
removePhotoBtn.addEventListener("click", removePhoto);
form.addEventListener("submit", saveRecipe);

// 
// INICIALIZAÇÃO
// 
loadRecipes();
