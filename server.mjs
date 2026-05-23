import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const port = Number(process.env.PORT || 80);
const host = process.env.HOST || '0.0.0.0';
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'state.json');
const distDir = path.join(__dirname, 'dist');

const defaultState = {
  anniversaryDate: null,
  todos: [],
  cycleRecords: {},
  photos: [],
};

app.use(express.json({ limit: process.env.JSON_LIMIT || '100mb' }));

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

function normalizeState(value) {
  return {
    ...defaultState,
    ...(value && typeof value === 'object' ? value : {}),
    todos: Array.isArray(value?.todos) ? value.todos : defaultState.todos,
    cycleRecords:
      value?.cycleRecords && typeof value.cycleRecords === 'object'
        ? value.cycleRecords
        : defaultState.cycleRecords,
    photos: Array.isArray(value?.photos) ? value.photos : defaultState.photos,
  };
}

async function readState() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    if (error.code === 'ENOENT') return defaultState;
    throw error;
  }
}

async function writeState(state) {
  await ensureDataDir();
  const normalized = normalizeState(state);
  const tmpFile = `${dataFile}.${Date.now()}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(normalized, null, 2), 'utf8');
  await fs.rename(tmpFile, dataFile);
  return normalized;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/state', async (_req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(await readState());
  } catch (error) {
    next(error);
  }
});

app.put('/api/state', async (req, res, next) => {
  try {
    res.json(await writeState(req.body));
  } catch (error) {
    next(error);
  }
});

app.patch('/api/state', async (req, res, next) => {
  try {
    const current = await readState();
    res.json(await writeState({ ...current, ...req.body }));
  } catch (error) {
    next(error);
  }
});

app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(distDir, { index: false, maxAge: 0 }));

app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(distDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, host, () => {
  console.log(`Judy Space listening on ${host}:${port}`);
});
