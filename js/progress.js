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

function keyFor(id, namespace) {
  return namespace ? `${namespace}:${id}` : id;
}

export function getStatus(speciesId, namespace) {
  const data = loadAll();
  return data[keyFor(speciesId, namespace)]?.status ?? "new";
}

export function setStatus(speciesId, status, namespace) {
  const data = loadAll();
  data[keyFor(speciesId, namespace)] = {
    status,
    lastSeen: new Date().toISOString(),
  };
  saveAll(data);
}

export function getStats(totalCount, namespace) {
  const data = loadAll();
  let known = 0;
  let learning = 0;
  let seen = 0;
  for (const key of Object.keys(data)) {
    const hasNamespace = key.includes(":");
    if (namespace ? !key.startsWith(`${namespace}:`) : hasNamespace) continue;
    seen += 1;
    if (data[key].status === "known") known += 1;
    else if (data[key].status === "learning") learning += 1;
  }
  return {
    known,
    learning,
    new: Math.max(totalCount - seen, 0),
    total: totalCount,
  };
}
