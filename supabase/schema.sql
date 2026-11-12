-- =============================================================
-- Estoque de Componentes - estrutura do banco (Supabase/PostgreSQL)
-- Cole tudo no "SQL Editor" do Supabase e clique em "Run".
-- Pode rodar de novo sem problema (não apaga dados).
-- =============================================================

create table if not exists public.componentes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null check (char_length(btrim(nome)) between 1 and 120),
  local         text not null check (char_length(btrim(local)) between 1 and 80),
  categoria     text not null default '' check (char_length(categoria) <= 60),
  descricao     text not null default '' check (char_length(descricao) <= 300),
  quantidade    integer not null default 0 check (quantidade >= 0),
  minimo        integer not null default 0 check (minimo >= 0),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Atualiza "atualizado_em" automaticamente a cada alteração
create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

drop trigger if exists componentes_atualizado_em on public.componentes;
create trigger componentes_atualizado_em
  before update on public.componentes
  for each row execute function public.tocar_atualizado_em();

-- Ajuste de quantidade atômico (botões + e −): evita que duas pessoas
-- clicando ao mesmo tempo sobrescrevam a alteração uma da outra.
create or replace function public.ajustar_quantidade(p_id uuid, p_delta integer)
returns public.componentes
language sql security invoker set search_path = '' as $$
  update public.componentes
     set quantidade = quantidade + p_delta
   where id = p_id
  returning *;
$$;

-- ---------- Segurança ----------
-- Qualquer pessoa pode CONSULTAR; só usuários logados podem ALTERAR.
alter table public.componentes enable row level security;

revoke all on public.componentes from anon, authenticated;
grant select on public.componentes to anon, authenticated;
grant insert, update, delete on public.componentes to authenticated;

revoke all on function public.ajustar_quantidade(uuid, integer) from public, anon;
grant execute on function public.ajustar_quantidade(uuid, integer) to authenticated;

drop policy if exists "consulta publica"  on public.componentes;
drop policy if exists "logado cadastra"   on public.componentes;
drop policy if exists "logado edita"      on public.componentes;
drop policy if exists "logado exclui"     on public.componentes;

create policy "consulta publica" on public.componentes
  for select to anon, authenticated using (true);
create policy "logado cadastra" on public.componentes
  for insert to authenticated with check (true);
create policy "logado edita" on public.componentes
  for update to authenticated using (true) with check (true);
create policy "logado exclui" on public.componentes
  for delete to authenticated using (true);

-- ---------- Tempo real ----------
-- Faz a página de todo mundo atualizar na hora quando algo muda.
do $$
begin
  alter publication supabase_realtime add table public.componentes;
exception when duplicate_object then null;
end $$;
