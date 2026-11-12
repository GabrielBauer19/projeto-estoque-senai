# Estoque de Componentes — SENAI

Sistema web simples para mostrar o estoque de componentes do curso de eletrônica e **onde cada um está guardado** (ex: Gaveta 76).

## Funcionalidades

- Cadastrar componente com nome, local, categoria, quantidade, estoque mínimo e observação
- Busca instantânea (ex: `resistor 10k`, `gaveta 76`) e filtro por categoria
- Botões **+ / −** para ajustar a quantidade rapidamente
- Aviso de componente **acabando** (abaixo do mínimo) ou **em falta**
- Funciona no computador e no celular
- Atualiza sozinho a cada 15 segundos (vê o que os outros alteraram)

## Como rodar

Precisa apenas do [Node.js](https://nodejs.org) (versão 18 ou mais nova). Não tem dependências para instalar.

```bash
npm start
```

Ou dê dois cliques em `iniciar.bat` no Windows.

O terminal mostra os endereços de acesso:

- **Neste computador:** http://localhost:3000
- **Outros computadores/celulares na mesma rede Wi-Fi:** `http://<IP-do-computador>:3000` (o endereço aparece no terminal)

> Na primeira vez, o Windows pode perguntar se permite o Node.js na rede — clique em **Permitir** (rede privada), senão os outros não conseguem acessar.

## Onde ficam os dados

Tudo é salvo em `data/estoque.json`. Para enviar um backup para o GitHub, dê dois cliques em `backup.bat`.
