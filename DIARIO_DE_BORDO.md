# 📓 Diário de Bordo da IA — Desapego Universitário

> Documento vivo, atualizado a cada etapa do desenvolvimento. Registra **como** a Inteligência
> Artificial foi usada de forma consciente, o histórico de decisões e a curadoria crítica dos
> resultados. Ao final do projeto, esta seção é consolidada no `README.md` (exigência do edital
> do PS Vortex 2026).

---

## 1. Ferramentas de IA utilizadas

- **Claude (Claude Code / Opus 4.8)** — parceria principal de arquitetura, modelagem de dados,
  implementação e explicação didática de conceitos (TypeScript, JWT, middlewares, PWA).

*(Atualizar conforme novas ferramentas forem usadas ao longo dos 15 dias.)*

---

## 2. Histórico de prompts e progresso

Cada entrada = um prompt/interação relevante + o que evoluiu a partir dela.

### #1 — Abertura e alinhamento de visão
**Prompt (resumo):** apresentei o contexto do edital (PDF), o escopo de ferramentas que quero
usar (Node.js/TypeScript, MongoDB na nuvem, JWT, validação por middleware, front em JSX/TSX com
cache), o tema minimalista inspirado em Minecraft, o conceito de XP como reputação/confiança, e
pedi para: (1) sanar dúvidas e alinhar a visão, (2) montar uma base sólida de backend + banco,
(3) planejar o frontend. Definimos testes manuais via ThunderClient e a criação deste diário.

**Progresso:** Claude leu o edital completo. Alinhamos que o desafio pede API REST (CRUD de
anúncios em JSON), frontend responsivo (Landing desktop + app mobile) e **PWA instalável**
(obrigatório). Mapeamos os bônus que já vamos atacar: JWT, validação robusta, MongoDB real,
cache offline, TypeScript no front e deploy. Decidimos a ordem: planejamento → backend → frontend.

### #2 — Revisão da modelagem do banco de dados
**Prompt (resumo):** reescrevi as collections `users`, `items` e `reviews` com nomes de
atributos **temáticos** (XP), defini regras de XP (anunciar +5, concluir negócio +20, concluir
doação +35, avaliação `(xpRating - 2.5) * 10`), pedi uso de Cloudinary para imagens, a lista de
cursos da Unifor, e estabeleci princípios: **flexibilidade e casos de uso acima de velocidade,
funções puras e reuso**.

**Progresso:** através de perguntas de alinhamento, fechamos:
- **Login por matrícula + senha** (JWT + bcrypt); matrícula é identificação imutável.
- Item com **3 estados**: `available` / `reserved` / `concluded`.
- **XP de conclusão de venda vai para as duas partes** (+20 cada); doação +35 só para o doador.
- **Doação mantém o receptor anônimo** (não registrado); `donationHistory` = só doações feitas.
- Busca da **lista oficial de cursos da Unifor** (40 presenciais + EAD) para virar enum.
- **5 categorias de item, extensíveis** (StudyMaterial, Electronics, Peripherals, Apparel, Other).
- Schema final traduzido para inglês (mantendo `matricula` em PT e os nomes temáticos de XP).
- Plano de implementação completo aprovado, com roadmap em 6 etapas.

### #3 — Base do backend (Etapa 1)
**Prompt (resumo):** aprovado o plano, pedi para montar a base sólida do backend com CRUD de
anúncios, testável no ThunderClient.

**Progresso:** montamos o backend em camadas (`routes → controllers → services → models`) com
TypeScript + Express + Mongoose + Zod. CRUD de `/api/items` funcionando, middleware genérico de
validação (Zod) e handler central de erros. Categorias e cursos como "fonte única" extensível
(`as const` gera os tipos). Conexão com MongoDB Atlas testada com sucesso; endpoints e tratamento
de erro (400/404) validados manualmente.

### #4 — Autenticação (Etapa 2a) + aprofundamento em JWT/bcrypt
**Prompt (resumo):** avançar para auth por matrícula+senha (JWT), e — como sou iniciante em
criptografia — pedi explicações aprofundadas. Levantei dúvidas reais: (a) como funciona o `next`
e o fluxo de middlewares; (b) **onde os tokens ficam armazenados**; (c) como o sistema sabe que um
token expirou; (d) se dá para editar o token e ficar "logado para sempre".

**Progresso:** implementamos `User` (senha só como hash bcrypt, `select:false`), `utils/jwt.ts`,
middleware `authRequired`, e protegemos as rotas de escrita de itens (dono = usuário logado, com
checagem de posse → 403). Testado: register/login/me, 401 sem token, 403 em item alheio, 409 de
matrícula duplicada.

**Aprendizados-chave (curadoria, ótimos para o vídeo):**
- **Middlewares são uma "esteira"**: `next()` segue; `next(erro)` desvia para o handler de erro
  (qualquer argumento = erro). O handler de erro é reconhecido por ter **4 parâmetros**.
- **JWT é stateless**: o servidor **NÃO guarda** os tokens em lugar nenhum. O token vive no cliente;
  o servidor só **verifica a assinatura** com o `JWT_SECRET` a cada requisição (sem consultar o
  banco). Analogia: crachá com holograma, não lista de convidados.
- **Não é "descriptografar"**: JWT (HS256) **assina** (HMAC), não criptografa. O payload é legível
  por qualquer um (base64) — por isso nunca colocamos senha nele. A assinatura garante
  **integridade**, não sigilo.
- **Expiração** viaja dentro do token (`exp`/`iat`). Mudar qualquer campo do payload (inclusive
  `exp`) quebra a assinatura → rejeitado. Fizemos uma **demonstração prática** de forja de token
  sendo recusada com `invalid signature`. Riscos reais não são "editar o token", e sim **roubo do
  token** ou **segredo fraco/vazado** → daí a importância de segredo forte + `expiresIn`.

### #5 — Expansão de escopo: fluxo de interesse + chat em tempo real
**Prompt (resumo):** decidi que comprador e vendedor devem se comunicar **dentro do app** (estilo
OLX), com **chat em tempo real**. Mentalizei um fluxo de "chat ativo/inativo no servidor" e pedi
correções.

**Progresso / curadoria:** a IA corrigiu meu modelo mental separando **duas camadas**: a conversa
**persistente** (fonte da verdade no MongoDB) vs. a **sessão viva** (salas em memória do Socket.io,
dirigidas por eventos `connect`/`disconnect` — sem polling nem campo "ativo" no banco). Também
ajustei: "já existe conversa?" se consulta no **DB** (não na memória, que é volátil). Decidimos
conversas **por anúncio** (índice único `{item, buyer}`) e o XP de venda passou a ser dividido
(vendedor +10, +10 se o comprador for identificado; comprador +20). Plano atualizado para incluir
Socket.io, coleções `conversations`/`messages` e a nota de escopo p/ o prazo de 15 dias.

### #6 — XP, conclusão e reviews (Etapa 2b)
**Prompt (resumo):** implementar as funções puras de XP, o model Review, o endpoint de
conclusão de negócio e as avaliações.

**Progresso:** `utils/xp.ts` como funções puras (calculam, não persistem); `POST /item/:id/
conclude` aplica XP e históricos com operadores atômicos do Mongo (`$inc`, `$push`); reviews
bilaterais com regra anti-farm de 30 dias; perfil público com nível calculado na leitura.

### #7 — Estudo de TS/Zod + refactor de IDs e organização
**Prompt (resumo):** depois de estudar TypeScript por conta própria, pedi (a) uma explicação de
TODAS as funcionalidades de TS usadas no projeto e (b) o que é o Zod. Junto, pedi mudanças
estruturais: usar a matrícula como identificador, IDs compostos legíveis para item/review,
mensagens de resposta em inglês, e separar itens disponíveis/concluídos.

**Progresso / curadoria:** a IA me explicou os recursos de TS (interface, union types, `as const`,
generics, utility types, declaration merging etc.) e o papel do Zod (validação em runtime, que o
TS não faz). Nas mudanças estruturais, a IA **discordou** de duas ideias minhas e explicou por quê:
(1) separar itens em 2 coleções físicas → recomendou 1 coleção + `status` + 2 endpoints (conclusão
atômica, referências intactas); (2) alertou sobre condição de corrida no contador de IDs → resolvido
com `$inc` atômico. Refatoramos: `_id` do usuário = matrícula; item = `<matricula>i<n>`; review =
`<itemId>r<matricula>` (unicidade de graça). Mensagens traduzidas para inglês.

### #8 — Chat em tempo real (Etapa 2c)
**Prompt (resumo):** seguir para o Socket.io.

**Progresso:** models `Conversation` (`_id` = `<itemId>c<matricula>`) e `Message`; services que
validam participante e persistem; REST para interesse/caixa de entrada/histórico; **Socket.io**
acoplado ao `http.Server` com autenticação JWT no handshake, salas por conversa e eventos
(`conversation:join`, `message:send` → `message:new`). Smoke test em runtime confirmou que conexão
sem token é rejeitada e com token conecta.

*(Próximas entradas serão adicionadas conforme o desenvolvimento avança.)*

---

## 3. Estratégia de engenharia de prompts

*(A preencher: colar 2–3 prompts complexos reais que destravaram o desenvolvimento — ex.: como
estruturei a conexão do MongoDB, o Service Worker do PWA, ou o debug de um bug específico.)*

---

## 4. Reflexão crítica e curadoria

*(A preencher: registrar pelo menos um momento em que a IA gerou código errado, incompleto ou
uma "alucinação", como identifiquei o problema e como guiei a ferramenta até a solução correta.)*

---

## 5. Links de histórico (opcional)

*(A preencher, se aplicável: link público de uma conversa longa de arquitetura/debug.)*
