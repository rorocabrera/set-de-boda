const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchSets() {
  const response = await fetch(`${API_URL}/sets`);
  if (!response.ok) throw new Error('Failed to fetch sets');
  return response.json();
}

export async function fetchSet(id) {
  const response = await fetch(`${API_URL}/sets/${id}`);
  if (!response.ok) throw new Error('Failed to fetch set');
  return response.json();
}

export async function createSet(setData) {
  const response = await fetch(`${API_URL}/sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(setData)
  });
  if (!response.ok) throw new Error('Failed to create set');
  return response.json();
}

export async function updateSet(id, setData) {
  const response = await fetch(`${API_URL}/sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(setData)
  });
  if (!response.ok) throw new Error('Failed to update set');
  return response.json();
}

export async function deleteSet(id) {
  const response = await fetch(`${API_URL}/sets/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete set');
  return response.json();
}

// Migration helper: export localStorage data for backup
export function exportLocalStorageData() {
  const data = localStorage.getItem('music-sets');
  if (!data) return null;
  return JSON.parse(data);
}

// Migration helper: import data to server
export async function migrateLocalDataToServer() {
  const localData = exportLocalStorageData();
  if (!localData || localData.length === 0) {
    console.log('No local data to migrate');
    return;
  }

  console.log(`Migrating ${localData.length} sets to server...`);

  for (const set of localData) {
    try {
      await createSet(set);
      console.log(`✅ Migrated: ${set.title}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${set.title}:`, error);
    }
  }

  console.log('Migration complete!');
}
