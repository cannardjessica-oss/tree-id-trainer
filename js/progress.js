const STORAGE_KEY = "treeIdProgress";

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Failed to read progress from localStorage", err);
    return {};
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to save progress to localStorage", err);
  }
}

export function getStatus(speciesId) {
  const data = loadAll();
  return data[speciesId]?.status ?? "new";
}

export function setStatus(speciesId, status) {
  const data = loadAll();
  data[speciesId] = { status, lastSeen: new Date().toISOString() };
  saveAll(data);
}

export function getStats(totalCount) {
  const data = loadAll();
  let known = 0;
  let learning = 0;
  for (const id of Object.keys(data)) {
    if (data[id].status === "known") known += 1;
    else if (data[id].status === "learning") learning += 1;
  }
  const seen = Object.keys(data).length;
  return {
    known,
    learning,
    new: Math.max(totalCount - seen, 0),
    total: totalCount,
  };
}
