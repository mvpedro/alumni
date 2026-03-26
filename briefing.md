# Alumni Automação UFSC — Documento de Arquitetura

## Problema

O Alumni Automação da UFSC precisa de um site institucional. O domínio do Alumni aponta diretamente para um servidor da UFSC, e por regra institucional **não é possível redirecionar o domínio para um servidor externo**. Esse servidor não possui Node.js nem nenhum runtime server-side — ele serve apenas arquivos estáticos (provavelmente Apache, dado que anteriormente rodava WordPress). O deploy para esse servidor é feito via FTP e exige conexão à VPN da UFSC.

## Constraints

- O domínio do Alumni aponta para o servidor da UFSC e não pode ser alterado.
- O servidor da UFSC serve apenas arquivos estáticos (HTML, CSS, JS). Sem Node, sem runtime.
- O deploy no servidor UFSC é feito exclusivamente via FTP, com a máquina conectada na VPN da UFSC.
- O código-fonte será hospedado no GitHub.
- O frontend deve ser construído em React.

## Decisão de Arquitetura

### Frontend estático na UFSC + Supabase como backend

Como o servidor da UFSC só serve arquivos estáticos, o frontend React é buildado localmente (ou via CI) e os artefatos resultantes são enviados via FTP. Toda a lógica de dados, autenticação e storage vive no Supabase, consumido diretamente pelo frontend via SDK client-side.

```
Usuário → alumni.automacao.ufsc.br (servidor UFSC)
               ↓
          React SPA (arquivos estáticos servidos pelo Apache)
               ↓ supabase-js SDK
          Supabase (cloud, free tier)
               ├── Postgres (dados)
               ├── Auth (autenticação)
               ├── Storage (imagens e arquivos)
               └── RLS (segurança a nível de linha)
```

### Por que essa arquitetura

- O frontend é um build estático (HTML + JS + CSS), compatível com as limitações do servidor UFSC.
- O Supabase elimina a necessidade de escrever e manter um backend. Cada tabela criada no Postgres gera automaticamente uma API REST via PostgREST.
- Autenticação, storage de imagens e controle de acesso (RLS) vêm embutidos no Supabase.
- O free tier do Supabase é mais que suficiente para o volume de tráfego de um site de Alumni universitário.

## Stack Técnica

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | React + Vite | Build estático otimizado, DX moderna |
| Roteamento | React Router | SPA client-side, sem dependência de server |
| Estilização | Tailwind CSS | Produtividade, consistência visual |
| Backend / Banco | Supabase (Postgres) | API REST automática, zero backend próprio |
| Autenticação | Supabase Auth | Login embutido, suporta email/senha e OAuth |
| Storage | Supabase Storage | Upload e serving de imagens/arquivos |
| Segurança | Row Level Security (RLS) | Controle de acesso no nível do banco |
| Versionamento | GitHub | Código-fonte e colaboração |

## Deploy

### Frontend (servidor UFSC)

1. Desenvolvedor faz push para o GitHub.
2. O build é executado localmente (`npm run build`) ou via GitHub Actions (gera artefato para download).
3. O conteúdo da pasta `dist/` é enviado via FTP para o servidor da UFSC (requer conexão à VPN da UFSC).

O deploy automático end-to-end não é viável porque o FTP exige VPN. A abordagem prática é: CI faz o build e gera o artefato; um membro da equipe baixa e sobe manualmente (ou via script local conectado na VPN).

### Backend (Supabase)

Não há deploy de backend. O Supabase é um serviço gerenciado. Schemas, políticas RLS e configurações são gerenciados pelo dashboard do Supabase ou via migrations SQL versionadas no repositório.

## Configuração do Apache (`.htaccess`)

Como o frontend é uma SPA, todas as rotas precisam ser redirecionadas para o `index.html`. O arquivo `.htaccess` abaixo deve estar na raiz do servidor:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## CORS

O frontend em `alumni.automacao.ufsc.br` faz chamadas para o Supabase em `xyzproject.supabase.co`. O Supabase já lida com CORS automaticamente para chamadas via SDK, então não há configuração adicional necessária para esse caso.

## Segurança: Row Level Security (RLS)

Toda a segurança de acesso aos dados é controlada via RLS no Postgres. A anon key do Supabase (que fica exposta no frontend — isso é esperado) só permite operações que as políticas RLS autorizem.

Padrão geral para o site:

- **Leitura pública**: qualquer visitante pode ler dados de tabelas como eventos, membros, notícias.
- **Escrita restrita**: apenas usuários autenticados com role de admin podem criar, editar ou deletar registros.
- **Casos especiais**: formulário de contato permite insert público, mas leitura restrita a admins.

## Autenticação

O Supabase Auth será usado para criar um painel administrativo onde membros da diretoria podem gerenciar o conteúdo do site (eventos, notícias, membros, etc.) sem precisar mexer em código, fazer build ou usar FTP.

## Storage

O Supabase Storage será usado para armazenar imagens (fotos de eventos, fotos de membros, logos, etc.). As imagens são servidas via URL pública diretamente do Supabase, sem passar pelo servidor da UFSC.

## Estrutura do Repositório

```
alumni-automacao-ufsc/
├── public/
│   ├── .htaccess
│   └── favicon.ico
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   │   └── supabase.js        ← cliente Supabase
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── migrations/             ← migrations SQL versionadas
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .github/
    └── workflows/
        └── build.yml           ← CI: build + artefato
```

## Próximos Passos

Dentro do Claude Code, definir:

1. Schema do banco (tabelas, tipos, relações).
2. Políticas RLS para cada tabela.
3. Páginas e componentes do frontend.
4. Painel administrativo.
5. Fluxo de autenticação.
6. Script de deploy FTP.
