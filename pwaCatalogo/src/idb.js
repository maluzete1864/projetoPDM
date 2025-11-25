
// CONFIGURAÇÃO DO INDEXEDDB

const DB_NAME = "catalogoReceitasDB";
const STORE_NAME = "receitas";
const VERSION = 1;

// Abrir banco
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Se ainda não existir, cria o store das receitas
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Erro ao abrir o banco");
  });
}

// 
// adicionar receita
//
export async function addRecipe(recipe) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.add(recipe);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject("Erro ao adicionar receita");
  });
}

//
// listar receitas
// 
export async function listRecipes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Erro ao listar receitas");
  });
}

// 
// deletar receita
// 
export async function deleteRecipe(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject("Erro ao deletar receita");
  });
}
