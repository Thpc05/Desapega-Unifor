# 📓 Diário de Bordo da IA — *Hmm (Hmmarket)*

> Registro consciente de **como** a Inteligência Artificial foi usada na construção deste projeto:
> as ferramentas, a postura de trabalho, a linha do tempo das decisões e — o mais importante — a
> **curadoria crítica** dos resultados (onde a IA errou e como foi corrigida). Exigência do edital
> do PS Full-Stack Vortex 2026.
>
> A transcrição **completa** da conversa está em [`Historico.md`](./Historico.md).

---

## 1. Ferramentas de IA utilizadas

- **Claude — Claude Code / Opus 4.8** — parceira principal em **todas** as etapas: planejamento,
  modelagem do banco, implementação (backend e frontend), depuração de bugs de produção, deploy e
  revisão de segurança. Também no papel de **tutora**: explicando o *porquê* de cada trecho de
  TypeScript, JWT, middleware, Socket.io e Cloudinary.
- **Ferramentas de apoio (não-IA):** ThunderClient / curl / websocat (testes manuais da API e do
  socket), ImageMagick (geração de ícones do PWA a partir dos sprites).

---

## 2. Postura de uso (o método)

- **Entender antes de aceitar.** O autor é iniciante em TypeScript e em criptografia/autenticação;
  a regra foi: a IA só avança explicando o conceito, para que o código pudesse ser **defendido na
  banca**. Nada de "copiar e colar sem saber".
- **Planejar primeiro, executar depois.** Uso intenso do *modo planejamento*: para features grandes
  (editar anúncio, carrossel, PWA, reviews, correções de segurança) a IA escrevia um plano, o autor
  aprovava, e só então vinha o código. Revisão humana **entre cada etapa**.
- **A IA propõe, o humano cura.** Especialmente em **gosto visual** e **segurança**, as decisões
  finais foram sempre do autor — várias propostas da IA foram reprovadas e refeitas (ver seção 4).

---

## 3. Linha do tempo (o que foi construído)

### Backend (API REST + tempo real)
1. **Base:** Node + Express + TypeScript + Mongoose; arquitetura em camadas
   (routes → controllers → services → models) com `utils` puros.
2. **Modelagem MongoDB:** decisão de usar a **matrícula como `_id`** do usuário e **IDs compostos**
   legíveis (item `<matricula>i<n>`, review `<itemId>r<matricula>`, conversa `<itemId>c<matricula>`).
3. **Auth:** cadastro/login por matrícula+senha, **bcrypt** (hash+salt) e **JWT** (com explicação
   aprofundada de assinatura, payload não-secreto e expiração).
4. **XP/reputação:** funções **puras** em `utils/xp.ts` (anunciar +5, concluir venda +10/+20,
   doação +35, avaliação `(nota-2,5)*10`); nível derivado do XP (`floor(sqrt(xp/25))`).
5. **Reviews** bilaterais (públicas/privadas) com janela **anti-farm de 30 dias**.
6. **Chat em tempo real:** Conversation/Message + fluxo de "interesse" + **Socket.io** acoplado ao
   mesmo servidor HTTP (salas por conversa, autenticação no handshake).
7. **Cloudinary:** upload server-side; `images` como `{ url, publicId }[]`; limpeza de órfãos.
8. **Validação** com **Zod** em middleware genérico; handler central de erros.

### Frontend (React + Vite + PWA)
- **F0–F1:** scaffold, design tokens e **redesign visual** para o tema Minecraft (fonte Monocraft,
  moeda em **esmeraldas**, sprites/blocos como acento). Primitivas reutilizáveis
  (Panel, Button, Field, Price, XpBar, CategoryIcon).
- **F2:** validação local com **funções puras** + hook `useForm`.
- **F3:** integração com a API — `axios` + interceptor de token, `AuthContext`, `localStorage`,
  hook genérico `useAsync`, estados de loading/erro, rotas protegidas.
- **F4:** **chat em tempo real** (`useChatSocket`) e **upload de imagem** (com preview).
- **F5:** **PWA** instalável (manifest + Service Worker via `vite-plugin-pwa`) com **cache offline**
  da vitrine e das fotos.
- **Features extras:** editar anúncio (formulário compartilhado), **carrossel + lightbox** de fotos,
  **foto de perfil**, avaliação com corações dourados, avaliar de volta.

### Deploy e identidade
- **Frontend na Vercel**, **backend no Render** (WebSocket persistente), **MongoDB Atlas**,
  **Cloudinary**.
- **Rebrand:** de "Desapego Unifor" para **Hmm** (nome do app) / **Hmmarket** (técnico/URL),
  referência ao som do villager (que é também o comerciante do jogo) — ícone do app = a carinha do
  villager.

### Revisão de segurança
- Correções em: delete de imagem sem posse, farm de XP, exposição de avaliações privadas, CORS
  aberto, ausência de rate limit, vazamento de mensagem em erro 500 (detalhes na seção 4).

---

## 4. Curadoria crítica — quando a IA errou e como foi corrigida

> Esta seção é o coração do diário: IA **não é infalível**. O trabalho humano de revisar, testar e
> corrigir foi constante — e decisivo.

### 4.1. Falhas de **segurança** no código gerado pela IA (as mais graves)
Depois de tudo pronto, o **autor revisou o backend caçando brechas** — e achou falhas reais que a
IA havia deixado passar na implementação original:
- **Deletar foto de qualquer um:** o endpoint de imagem não guardava o dono → qualquer usuário
  autenticado podia apagar imagem alheia. *Correção:* a matrícula do dono passou a ser gravada no
  próprio `public_id` e verificada no delete (igual à checagem de dono dos itens).
- **Farm de XP entre amigos:** a trava anti-farm existia só na **avaliação**, não na **conclusão** —
  dois amigos podiam "vender" um pro outro em loop e farmar pontos. *Correção:* o mesmo verificador
  de 30 dias foi aplicado na conclusão.
- **Varredura conjunta** revelou ainda: **avaliações privadas expostas** publicamente, **CORS
  liberado** para qualquer origem, **sem rate limit** no login (força-bruta) e **erro 500 vazando**
  a mensagem interna. Todos corrigidos.

> **Lição:** a IA escreveu código funcional, mas com **lacunas de autorização** que só a revisão
> humana crítica pegou. Segurança exigiu ceticismo ativo, não confiança cega.

### 4.2. Bug — "todos os erros mostravam a mesma mensagem genérica"
No frontend, **qualquer** falha da API (senha curta, matrícula já cadastrada, login errado)
aparecia como *"Falha na conexão com o servidor"*. Diagnóstico: o cliente lia
`error.response.data.message`, mas o backend responde a mensagem no campo **`error`** (e os detalhes
de validação em `issues`) — como `message` **nunca existia**, tudo caía no texto genérico de
fallback. *Correção:* o `apiErrorMessage` passou a ler `data.error`, **priorizar os `issues`** (erro
por campo) e distinguir "servidor fora do ar"; ainda ganhou um mini-mapa de tradução das mensagens
(inglês → PT) só na camada de exibição. Um bug **no código da própria IA**, achado testando os
formulários.

### 4.3. Erros de tipagem TypeScript
- **Socket.io:** os genéricos do `Server` faziam o `emit` esperar `never`; resolvido removendo os
  genéricos e tipando `socket.data`.
- **`useForm`:** o `ItemForm` não compilava porque uma `interface` não satisfaz o
  `Record<string, string>` esperado — trocado por `type` (que ganha índice implícito).

---

## 5. Decisões de arquitetura debatidas com a IA

- **Plataforma do backend: Render, não Vercel.** A escolha foi dirigida pela **arquitetura do
  chat**: o Socket.io precisa de um **processo sempre ligado** segurando o WebSocket, o que o
  modelo *serverless* da Vercel não sustenta. Definiu-se Render (front na Vercel, banco no Atlas).
- **Chat em duas camadas.** **Persistência** (MongoDB = fonte da verdade; a conversa e o histórico
  vivem lá) separada da **sessão viva** (salas em memória do Socket.io). Presença dirigida por
  `connect`/`disconnect` → **sem polling** e **sem campo "online" no banco**.
- **Upload de imagem server-side.** O arquivo passa pelo **backend** (que sobe ao Cloudinary com o
  `api_secret`, nunca exposto) e guarda-se o **`publicId`** de cada imagem para poder deletá-la
  depois — em vez de upload direto do cliente.
- **Matrícula como `_id` + IDs compostos legíveis** (`<matricula>i<n>`, `<itemId>r<matricula>`…):
  a própria chave carrega a relação, o que **impede duplicatas de graça** (ex.: uma review por par
  item+avaliador) e dispensa índices/contadores extras.
- **XP armazenado, nível calculado.** O XP é persistido; o **nível é derivado na leitura** por
  função **pura** (`floor(sqrt(xp/25))`) — fonte única de verdade, fácil de testar e de defender.
- **Concluir escolhendo o comprador entre os interessados.** Identificar o comprador no fechamento
  é o que **destrava as avaliações** e o XP de venda identificada — todo o fluxo de reputação
  depende dessa decisão de modelagem (buyer no item + conversas como lista de interessados).
- **JWT stateless** (`Authorization: Bearer`, token no `localStorage`): trade-off assumido
  conscientemente frente ao cookie `httpOnly` — simples de explicar, com a limitação registrada.
- **Sem React Query** no front, de propósito: hooks próprios (`useAsync`) para o autor **entender o
  fluxo de dados** e defendê-lo na banca.

---

## 6. Reflexão final (escrito pelo autor)

A IA foi um **acelerador enorme**: meses de trabalho comprimidos em dias, com uma explicação
didática que me ensinou TS/JWT/PWA pelo caminho (uns conceitos mais, outros menos). É honesto, e
frustrante, admitir que eu não conseguiria replicar este projeto sem IA, mesmo com um mês. Talvez
eu ainda não programe nesse nível, mas faço questão de **entender o que está acontecendo** (a
lógica, as conexões, as estruturas, as decisões) e de conseguir **replicá-lo por conta própria**,
em menor escala, nas minhas cadeiras da faculdade, onde sempre me restrinjo no uso de IA.
