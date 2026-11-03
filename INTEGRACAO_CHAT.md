# Integracao no Chat.tsx

Os tres arquivos novos ja estao no projeto. Falta ligar a UI. Sao 4 blocos.

## A. Imports (topo do arquivo)

    import MidiaUnica from "./MidiaUnica";
    import {
      listarConversas, listarMensagens, apagarParaMim, apagarParaTodos,
      limparConversa, apagarConversa, podeApagarParaTodos,
      type ConversaResumo,
    } from "../services/chatModeracao";

## B. Estado + carregamento (perto dos outros useState)

    const [conversas, setConversas] = useState<ConversaResumo[]>([]);
    const [midiaAberta, setMidiaAberta] = useState<string | null>(null);

    const recarregarConversas = useCallback(async () => {
      if (!userId) return;
      try { setConversas(await listarConversas()); }
      catch (e) { console.error("[chat] listarConversas", e); }
    }, [userId]);

    useEffect(() => {
      recarregarConversas();
      const t = setInterval(recarregarConversas, 15000);
      return () => clearInterval(t);
    }, [recarregarConversas]);

Se `useCallback` nao estiver importado, adicione ao import de "react".

## C. Lista lateral

Substitua a origem de `filteredContacts` por `conversas`.
Onde hoje aparece `contact.lastMessage`, use `conversa.ultimaMensagem`.
Onde hoje aparece `contact.id`, use `conversa.peerId`.
Isso resolve tambem os parceiros sem linha em user_profiles.

## D. Acoes

Menu da mensagem (long-press ou botao ...):

    async function acoesMensagem(msg: any) {
      const opcoes = ["Apagar para mim"];
      if (podeApagarParaTodos(msg, userId)) opcoes.push("Apagar para todos");
      const escolha = await escolherNoMenu(opcoes); // use seu menu/sheet existente
      if (escolha === "Apagar para mim") await apagarParaMim(msg.id);
      else if (escolha === "Apagar para todos") await apagarParaTodos(msg.id);
      else return;
      setAllMessages((prev) => prev.filter((m) => m.id !== msg.id));
      recarregarConversas();
    }

Menu do cabecalho da conversa:

    async function acoesConversa(peerId: string) {
      const escolha = await escolherNoMenu(["Limpar conversa", "Apagar conversa"]);
      if (escolha === "Limpar conversa") await limparConversa(peerId);
      else if (escolha === "Apagar conversa") { await apagarConversa(peerId); setActiveChat(null); }
      else return;
      setAllMessages((prev) => prev.filter((m) => m.from !== peerId && m.to !== peerId));
      recarregarConversas();
    }

## E. Render da bolha

    {msg.viewOnce || msg.view_once ? (
      msg.viewed_at ? (
        <span style={{ opacity: 0.6, fontStyle: "italic" }}>Foto visualizada</span>
      ) : (
        <button type="button" onClick={() => setMidiaAberta(msg.id)}>
          Abrir foto (1x)
        </button>
      )
    ) : msg.apagada_para_todos ? (
      <span style={{ opacity: 0.6, fontStyle: "italic" }}>Mensagem apagada</span>
    ) : (
      <BolhaPadrao msg={msg} />
    )}

E no fim do JSX do componente:

    {midiaAberta && (
      <MidiaUnica messageId={midiaAberta} onFechar={() => setMidiaAberta(null)} />
    )}