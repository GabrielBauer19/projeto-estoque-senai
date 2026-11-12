# 3weatMjoEWotU6BS

Sistema web para mostrar o estoque de componentes do curso de eletrônica e **onde cada um está guardado** (ex: Gaveta 76). Funciona online, de qualquer celular ou computador, sem precisar de nenhum PC ligado.

## Funcionalidades

- **Qualquer pessoa** pode consultar: busca instantânea (ex: `resistor 10k`, `gaveta 76`) e filtro por categoria
- **Quem faz login** pode cadastrar, editar, excluir e usar os botões **+ / −** de quantidade
- Aviso de componente **acabando** (abaixo do mínimo) ou **em falta**
- Atualização em **tempo real**: quando alguém altera, todo mundo vê na hora
- Funciona no computador e no celular

## Tecnologias

- **Página:** HTML, CSS e JavaScript puro, hospedada no **GitHub Pages**
- **Banco de dados:** **Supabase** (PostgreSQL), com regras de segurança (RLS): consulta pública, alteração só para usuários logados
- Estrutura do banco: [`supabase/schema.sql`](supabase/schema.sql)

## Como dar acesso de edição a alguém

No painel do Supabase: **Authentication → Users → Add user → Create new user**, informe e-mail e senha e marque **Auto Confirm User**.

## Backup

No painel do Supabase: **Table Editor → componentes → Export → CSV**.
