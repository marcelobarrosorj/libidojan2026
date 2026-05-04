# Libido App - Diretrizes de Desenvolvimento e Produto

Este arquivo contém as regras persistentes para o desenvolvimento do ecossistema Libido. Siga estas diretivas rigorosamente para manter a consistência de marca, segurança e UX.

## 1. Identidade Visual e Estética (Matrix/Dark High-End)
- **Cores**: Fundo principal sempre `bg-black` ou `bg-slate-900`. Acentuação principal em `text-amber-500` (primário) e `text-rose-500` (perigos/denúncias).
- **Tipografia**: 
  - Labels, botões de ação e headers curto devem usar `uppercase`, `font-black` e `tracking-widest`.
  - Use `italic` em títulos para dar um tom agressivo e moderno ("Matrix style").
  - Tamanhos de fonte pequenos (`text-[10px]` ou `text-[8px]`) com `tracking-widest` para metadados técnicos.
- **Bordas e Containers**: Arredondamento generoso (`rounded-2xl`, `rounded-3xl` ou `rounded-[32px]`). Bordas sutis com `border-white/5` ou `border-white/10`.
- **Animações**: Use sempre `motion` (da biblioteca `motion/react`) para entradas (`animate-in`), transições de layout e modais (`AnimatePresence`).

## 2. Protocolos de Segurança e Privacidade
- **Antiprint Ativo**: O sistema utiliza o hook `useAntiPrint`. 
  - **AVISO CRÍTICO**: Não reintroduzir o evento de `window.blur` para disparar o desfoque total, pois isso quebra a experiência de upload de fotos (onde a janela perde o foco momentaneamente).
  - Proteção baseada em bloqueio de clique direito, atalhos de teclado (PrtScn, Cmd+Shift+S) e `user-select: none`.
- **Blindagem de Conteúdo**: Fotos na galeria podem ter estado desfoque (`isBlurred`) controlado por permissão ou interação do usuário.
- **Matriz de Moderação**: Denúncias e exclusões são tratadas como "Governança" ou "Governo".

## 3. Terminologia e Tom de Voz
- O app é referido como **"A Matriz"**.
- O painel de administração é a **"Central de Governança"**.
- Perfis verificados possuem o selo **"NoFake"**.
- O tom deve ser profissional, técnico-provocativo e orientado a "Resultados e Discrição".

## 4. Componentes e Padrões de Código
- **Ícones**: Exclusivamente da `lucide-react`.
- **Layout**: Mobile-first imersivo (geralmente fixo em `h-[100dvh]` com overflow controlado).
- **Hooks**: Centralize lógica de estado global ou interceptores de segurança em hooks dedicados em `/hooks`.
- **Serviços**: Interações com banco de dados (mesmo que simuladas via cache/localStorage por enquanto) em `/services`.

## 5. Persistência de Alterações
- Sempre que houver correção de bug visual (ex: tela preta no upload), documentar o motivo aqui para evitar reversão acidental em futuras iterações.
- O Antiprint foi ajustado para ignorar `blur` de janela especificamente para permitir seletores de arquivos.
