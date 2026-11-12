// Servidor do Estoque de Componentes - sem dependências externas.
// Uso: node server.js   (ou: npm start)

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "estoque.json");
const PUBLIC_DIR = path.join(__dirname, "public");

// ---------- Armazenamento ----------
function carregar() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function salvar(lista) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(lista, null, 2));
  fs.renameSync(tmp, DATA_FILE); // escrita atômica: não corrompe o arquivo
}

let componentes = carregar();

// ---------- Validação ----------
function validar(body, parcial = false) {
  const erros = [];
  const out = {};
  const texto = (v, max) => String(v ?? "").trim().slice(0, max);

  if (!parcial || body.nome !== undefined) {
    out.nome = texto(body.nome, 120);
    if (!out.nome) erros.push("Informe o nome do componente.");
  }
  if (!parcial || body.local !== undefined) {
    out.local = texto(body.local, 80);
    if (!out.local) erros.push("Informe onde o componente está (ex: Gaveta 76).");
  }
  if (!parcial || body.quantidade !== undefined) {
    const q = Number(body.quantidade);
    if (!Number.isInteger(q) || q < 0) erros.push("Quantidade deve ser um número inteiro ≥ 0.");
    out.quantidade = q;
  }
  if (!parcial || body.categoria !== undefined) out.categoria = texto(body.categoria, 60);
  if (!parcial || body.descricao !== undefined) out.descricao = texto(body.descricao, 300);
  if (!parcial || body.minimo !== undefined) {
    const m = body.minimo === "" || body.minimo == null ? 0 : Number(body.minimo);
    if (!Number.isInteger(m) || m < 0) erros.push("Estoque mínimo deve ser um número inteiro ≥ 0.");
    out.minimo = m;
  }
  return { erros, dados: out };
}

// ---------- Utilidades HTTP ----------
function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function lerBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) {
        reject(new Error("Corpo muito grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
  });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function servirArquivo(req, res) {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const arquivo = path.normalize(path.join(PUBLIC_DIR, url === "/" ? "index.html" : url));
  if (!arquivo.startsWith(PUBLIC_DIR)) return json(res, 403, { erro: "Proibido" });
  fs.readFile(arquivo, (err, conteudo) => {
    if (err) return json(res, 404, { erro: "Não encontrado" });
    res.writeHead(200, { "Content-Type": MIME[path.extname(arquivo)] || "application/octet-stream" });
    res.end(conteudo);
  });
}

// ---------- Rotas ----------
const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const match = pathname.match(/^\/api\/componentes(?:\/([\w-]+))?$/);

  if (!match) {
    if (req.method === "GET") return servirArquivo(req, res);
    return json(res, 404, { erro: "Rota não encontrada" });
  }

  const id = match[1];
  try {
    if (req.method === "GET" && !id) {
      return json(res, 200, componentes);
    }

    if (req.method === "POST" && !id) {
      const { erros, dados } = validar(await lerBody(req));
      if (erros.length) return json(res, 400, { erro: erros.join(" ") });
      const agora = new Date().toISOString();
      const novo = { id: crypto.randomUUID(), ...dados, criadoEm: agora, atualizadoEm: agora };
      componentes.push(novo);
      salvar(componentes);
      return json(res, 201, novo);
    }

    const idx = componentes.findIndex((c) => c.id === id);
    if (id && idx === -1) return json(res, 404, { erro: "Componente não encontrado" });

    if (req.method === "PUT" && id) {
      const { erros, dados } = validar(await lerBody(req), true);
      if (erros.length) return json(res, 400, { erro: erros.join(" ") });
      componentes[idx] = { ...componentes[idx], ...dados, atualizadoEm: new Date().toISOString() };
      salvar(componentes);
      return json(res, 200, componentes[idx]);
    }

    if (req.method === "DELETE" && id) {
      const [removido] = componentes.splice(idx, 1);
      salvar(componentes);
      return json(res, 200, removido);
    }

    return json(res, 405, { erro: "Método não permitido" });
  } catch (e) {
    return json(res, 400, { erro: e.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n  Estoque de Componentes rodando!\n");
  console.log(`  Neste computador:  http://localhost:${PORT}`);
  for (const lista of Object.values(os.networkInterfaces())) {
    for (const net of lista || []) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`  Na rede (celular/outros PCs):  http://${net.address}:${PORT}`);
      }
    }
  }
  console.log("\n  Para parar: Ctrl+C\n");
});
