# Hmm 🧑‍🌾 — *Hmmarket*

> A economia circular da vila. Um marketplace de campus onde estudantes anunciam, **doam ou vendem
> por esmeraldas** o que não usam mais — com tema Minecraft, chat em tempo real, reputação por XP e
> PWA instalável.
>
> Projeto desenvolvido para o **Processo Seletivo Full-Stack do Laboratório Vortex (UNIFOR) 2026**.

---

- **Autor:** `Theo Passos` — Matrícula `2416515`
- **App (frontend, Vercel):** `https://hmmarket.vercel.app/`
- **API (backend, Render):** `https://desapega-unifor.onrender.com`
- **Vídeo de apresentação (6 min):** `https://drive.google.com/file/d/1TmpuTwZKEWCnzUNhukgmEteXmcqQfFGb/view?usp=drivesdk`

---

## 🤖 Uso de Inteligência Artificial (exigência do edital)

O desenvolvimento foi feito em parceria com IA (**Claude — Claude Code / Opus 4.8**), de forma
**consciente e documentada**. Isso é registrado em **dois arquivos** deste repositório:

| Arquivo | O que é |
|---|---|
| [`DIARIO_DE_BORDO.md`](./DIARIO_DE_BORDO.md) | **Diário de Bordo da IA.** Registra *como* a IA foi usada: ferramentas, histórico de decisões por etapa, e a **curadoria crítica** — incluindo casos em que a IA **errou e como foi corrigida** (exigência do edital). |
| [`Historico.md`](./Historico.md) | **Compartilhamento de Histórico.** Transcrição **completa** do chat principal de desenvolvimento (arquitetura, resolução de bugs, deploy e revisão de segurança). |

> A premissa foi sempre **entender o que estava sendo escrito** (o autor é iniciante em TS e
> criptografia), com a IA explicando o *porquê* de cada trecho de TypeScript, JWT, middleware e
> Cloudinary — para que o código pudesse ser defendido na banca.

---

## ✨ Funcionalidades

- **Anúncios (CRUD completo):** criar, editar, listar, excluir e concluir negócios; fotos no
  Cloudinary (até 5, com carrossel + zoom no detalhe).
- **Doação ou venda:** moeda temática em **esmeraldas**; doação tem receptor anônimo.
- **Autenticação:** cadastro/login por **matrícula + senha** (bcrypt), sessão via **JWT**.
- **Chat em tempo real:** fluxo de interesse + mensagens ao vivo via **Socket.io**.
- **Reputação (XP):** ganho por anunciar, concluir e receber avaliações; **níveis** derivados do XP;
  avaliações bilaterais (públicas/privadas) com estrelas → corações dourados.
- **Perfil:** foto de perfil, histórico, avaliações recebidas.
- **PWA:** instalável (manifest + Service Worker) com **cache offline** da vitrine e das fotos.
- **Responsivo:** vitrine rica no desktop e experiência de app no mobile (navegação flutuante).

---

## 🧱 Stack

**Backend** — Node + Express + TypeScript · MongoDB Atlas (Mongoose) · Zod (validação) ·
JWT + bcryptjs · Socket.io · Cloudinary (imagens) · express-rate-limit.

**Frontend** — React 19 + Vite + TypeScript · React Router · Axios · CSS Modules ·
socket.io-client · vite-plugin-pwa. Fonte **Monocraft** (self-hosted) e sprites do Minecraft como
tema.

**Deploy** — Frontend na **Vercel**, backend no **Render** (WebSocket persistente), banco no
**MongoDB Atlas**, imagens no **Cloudinary**.

---

## 🚀 Rodando localmente

Pré-requisitos: Node 18+, uma conta no MongoDB Atlas e uma no Cloudinary.

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env      # preencha as variáveis (veja abaixo)
npm run dev               # sobe em http://localhost:3333
```

`.env` do backend:

| Variável | Descrição |
|---|---|
| `PORT` | Porta local (ex.: `3333`). |
| `MONGODB_URI` | String de conexão do MongoDB Atlas. |
| `JWT_SECRET` | Segredo (longo e aleatório) para assinar o token. |
| `JWT_EXPIRES_IN` | Validade do token (ex.: `7d`). |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>`. |
| `CORS_ORIGIN` | Origem(ns) do front separadas por vírgula (vazio = libera geral, só dev). |

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env      # defina VITE_API_URL=http://localhost:3333
npm run dev               # abre em http://localhost:5173
```

> O Service Worker/PWA só vale em build de produção: `npm run build && npm run preview`.

---

## 📁 Estrutura (monorepo)

```
.
├── backend/      # API REST + Socket.io (routes → controllers → services → models)
├── frontend/     # SPA React + PWA
├── DIARIO_DE_BORDO.md      # Diário de Bordo da IA (como a IA foi usada)
├── Historico.md            # transcrição completa do chat de desenvolvimento
└── README.md
```

---

## 🎨 Créditos e licenças

- **Texturas e sprites do Minecraft** são propriedade da **Mojang Studios / Microsoft**, usados
  **apenas para fins acadêmicos e não comerciais** neste trabalho de seleção — sem qualquer
  finalidade lucrativa. Todos os direitos das artes originais pertencem à Mojang.
- **Fonte Monocraft** — licença **SIL Open Font License (OFL)**.
- Este é um projeto **acadêmico/temporário**, feito para a seleção do Laboratório Vortex.

> ✏️ **Preencher (se aplicável):** `<remover assets não licenciados que você não queira publicar,
> ex.: o arquivo de atlas de texturas em frontend/public/Atlas.terrain_*.png>`.
