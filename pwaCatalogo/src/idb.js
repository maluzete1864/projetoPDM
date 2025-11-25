const DB_NAME = "catalogoReceitasDB";
const STORE_NAME = "receitas";
const VERSION = 1;

// Abrir banco
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Erro ao abrir o banco");
  });
}

// Função genérica para transações
function transact(storeMode, action) {
  return openDB().then(db => 
    new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, storeMode);
      const store = tx.objectStore(STORE_NAME);
      const request = action(store);
      request.onsuccess = () => resolve(request.result ?? true);
      request.onerror = () => reject("Erro na operação IndexedDB");
    })
  );
}

// Adicionar receita
export function addRecipe(recipe) {
  return transact("readwrite", store => store.add(recipe));
}

// Listar receitas
export function listRecipes() {
  return transact("readonly", store => store.getAll());
}

// Deletar receita
export function deleteRecipe(id) {
  return transact("readwrite", store => store.delete(id));
}
