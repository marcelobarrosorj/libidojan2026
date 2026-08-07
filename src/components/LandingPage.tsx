import { Shield, Eye, Lock, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function LandingPage({ onLoginClick, onRegisterClick }: { onLoginClick: () => void, onRegisterClick: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Quem pode utilizar o Libido?",
      a: "Somente pessoas com 18 anos ou mais. Perfis pertencentes ou atribuídos a menores de idade serão removidos."
    },
    {
      q: "O Libido é um site de acompanhantes?",
      a: "Não. O Libido é uma plataforma de conexões e interação entre adultos. Não permitimos a oferta, solicitação ou intermediação de serviços sexuais pagos."
    },
    {
      q: "Preciso mostrar todas as minhas informações?",
      a: "Não. Compartilhe apenas as informações necessárias para utilizar a plataforma e aquilo que se sentir confortável em tornar visível no perfil."
    },
    {
      q: "Como o Libido trata meus dados pessoais?",
      a: "O tratamento de dados pessoais é orientado por nossa Política de Privacidade e pelo compromisso com a LGPD. Nela você poderá entender quais informações são utilizadas, suas finalidades e como exercer seus direitos."
    },
    {
      q: "Quais direitos tenho sobre meus dados?",
      a: "A LGPD prevê direitos relacionados aos dados pessoais, incluindo solicitações de acesso, correção e eliminação em situações previstas na legislação. Consulte a Política de Privacidade para conhecer os canais e procedimentos disponíveis."
    },
    {
      q: "Posso denunciar outro perfil?",
      a: "Sim. Comportamentos suspeitos, abusivos ou contrários às Regras da Comunidade podem ser denunciados dentro da plataforma."
    },
    {
      q: "O Libido é gratuito?",
      a: "O cadastro e parte da experiência podem ser acessados gratuitamente. Recursos adicionais estão disponíveis por meio do Libido Premium."
    },
    {
      q: "O Libido garante que todos os usuários são seguros?",
      a: "Nenhuma plataforma de encontros pode oferecer garantia absoluta sobre as pessoas que a utilizam. Por isso, recomendamos preservar informações pessoais, manter as primeiras conversas dentro da plataforma e denunciar qualquer comportamento suspeito."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)] font-sans overflow-x-hidden selection:bg-[var(--libido-accent)] selection:text-black">
      {/* Age Bar */}
      <div className="bg-[var(--libido-surface-2)] border-b border-[var(--libido-border)]/50 text-center py-3 px-4 relative z-50">
        <p className="text-xs md:text-sm font-bold text-[var(--libido-muted)]">
          🔞 Uso exclusivo para maiores de 18 anos.
        </p>
        <p className="text-[10px] md:text-xs text-[var(--libido-muted)] opacity-70 mt-1 max-w-2xl mx-auto">
          Ao continuar, você confirma que tem 18 anos ou mais e concorda com nossos Termos de Uso, Política de Privacidade e Regras da Comunidade.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--libido-accent)]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--libido-border)] to-transparent"></div>
        
        <div className="mb-12">
          <div className="font-fraunces font-bold text-2xl tracking-[0.2em] text-[var(--libido-text)] flex items-center justify-center select-none">
            LIBIDO<span className="text-[var(--libido-accent)] leading-none text-4xl -ml-1">.</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-fraunces font-medium leading-[1.1] mb-6 max-w-4xl mx-auto">
          Conexões adultas.<br/>
          <span className="text-[var(--libido-muted)]">Privacidade levada a sério.</span>
        </h1>

        <p className="text-sm md:text-lg text-[var(--libido-muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
          Um espaço para maiores de 18 anos que desejam conhecer pessoas, conversar e explorar novas possibilidades com liberdade, respeito e discrição.<br/><br/>
          Você escolhe o que mostrar, com quem conversar e até onde deseja ir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <button 
            onClick={onRegisterClick}
            className="w-full sm:w-auto bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 px-8 rounded-[16px] text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2 whitespace-nowrap"
          >
            Criar meu perfil <ArrowRight size={16} />
          </button>
          <button 
            onClick={onLoginClick}
            className="w-full sm:w-auto bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] font-bold py-4 px-8 rounded-[16px] text-sm tracking-wide transition-all hover:bg-[var(--libido-surface)] flex justify-center items-center whitespace-nowrap"
          >
            Já tenho uma conta
          </button>
        </div>
        <p className="text-[10px] md:text-xs text-[var(--libido-muted)] opacity-60 mt-6 max-w-xs mx-auto">
          Cadastro destinado exclusivamente a pessoas maiores de 18 anos.
        </p>
      </section>

      {/* Security & Privacy */}
      <section id="seguranca" className="py-24 px-6 relative bg-[var(--libido-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-16 h-16 bg-[var(--libido-surface-2)] rounded-full flex items-center justify-center border border-[var(--libido-border)] mb-6 shadow-[0_0_30px_rgba(216,107,63,0.05)]">
              <Shield className="w-8 h-8 text-[var(--libido-accent)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-fraunces font-medium mb-4">Seu desejo não precisa abrir mão da segurança.</h2>
            <p className="text-sm md:text-base text-[var(--libido-muted)] max-w-2xl">
              No Libido, privacidade não é uma frase escondida no rodapé. Ela faz parte da experiência desde o primeiro acesso.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { t: "Você mantém o controle", d: "Escolha quais informações deseja apresentar em seu perfil e compartilhe apenas aquilo com que se sentir confortável." },
              { t: "Ferramentas contra abusos", d: "Bloqueie ou denuncie comportamentos inadequados diretamente pela plataforma." },
              { t: "Menos exposição desnecessária", d: "Informações sensíveis não devem ser exibidas publicamente sem necessidade. Você decide quando e com quem deseja compartilhar detalhes pessoais." },
              { t: "Uma comunidade adulta e responsável", d: "Perfis de menores, assédio, ameaças, golpes, divulgação não autorizada de conteúdo e exploração comercial não são permitidos." }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] p-8 rounded-[24px]">
                <h3 className="text-lg font-fraunces font-medium mb-3 text-[var(--libido-gold)]">{item.t}</h3>
                <p className="text-sm text-[var(--libido-muted)] leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="#lgpd" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--libido-accent)] hover:text-[var(--libido-accent-hover)] transition-colors border-b border-transparent hover:border-[var(--libido-accent-hover)] pb-1">
              Conheça nossas práticas de segurança <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* LGPD */}
      <section id="lgpd" className="py-24 px-6 relative border-y border-[var(--libido-border)]/50">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--libido-bg)] to-[var(--libido-surface)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--libido-gold)] mb-6">
              <Lock size={12} /> Privacidade e proteção de dados
            </div>
            <h2 className="text-3xl md:text-5xl font-fraunces font-medium mb-6 leading-tight">
              Seus dados. Seus direitos. Suas escolhas.
            </h2>
            <p className="text-sm md:text-base text-[var(--libido-muted)] max-w-2xl leading-relaxed mb-6">
              O Libido adota princípios de transparência, necessidade, segurança e respeito aos direitos dos titulares de dados pessoais.
            </p>
            <p className="text-sm md:text-base text-[var(--libido-muted)] max-w-2xl leading-relaxed">
              Nosso compromisso com a Lei Geral de Proteção de Dados Pessoais, a LGPD, faz parte da maneira como desenvolvemos e operamos a plataforma.
            </p>
          </div>

          <h3 className="text-xl font-fraunces font-medium mb-8 text-[var(--libido-text)]">
            Você deve saber como seus dados são utilizados.
          </h3>

          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            {[
              { t: "Transparência", d: "Explicamos quais informações são coletadas e para quais finalidades são utilizadas." },
              { t: "Coleta necessária", d: "Buscamos solicitar apenas os dados necessários para o funcionamento, a segurança e a evolução da plataforma." },
              { t: "Controle do titular", d: "Você pode solicitar acesso, correção ou exclusão dos seus dados, respeitadas as hipóteses legais de conservação." },
              { t: "Consentimento e escolhas", d: "Quando o tratamento depender de consentimento, você deve receber informações claras e ter meios para rever sua decisão." },
              { t: "Proteção e segurança", d: "Adotamos medidas voltadas à proteção dos dados pessoais e à redução de acessos indevidos." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-[var(--libido-accent)] tracking-wide">{item.t}</h4>
                <p className="text-sm text-[var(--libido-muted)] leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>

          <button className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] font-bold py-4 px-8 rounded-[16px] text-sm transition-all hover:bg-[var(--libido-surface)] inline-flex items-center gap-2">
            Entender como tratamos seus dados
          </button>
        </div>
      </section>

      {/* Posicionamento */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-fraunces font-medium mb-8 leading-tight">
            Liberdade para desejar.<br/>Espaço para respeitar.
          </h2>
          <div className="space-y-6 text-sm md:text-lg text-[var(--libido-muted)] leading-relaxed">
            <p>O Libido foi criado para adultos que valorizam conversas honestas, limites claros e conexões sem julgamentos.</p>
            <p>Aqui, não existe obrigação de seguir um único tipo de relacionamento.</p>
            <p>Você pode procurar uma conversa, uma experiência, uma conexão casual, novas amizades ou algo que ainda nem sabe definir.</p>
            <p className="text-[var(--libido-text)] font-fraunces italic text-xl mt-8">O ritmo é seu.</p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-24 px-6 bg-[var(--libido-surface)] border-y border-[var(--libido-border)]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-fraunces font-medium mb-16 text-center">
            Simples para começar.<br/>Seu para conduzir.
          </h2>
          <div className="grid md:grid-cols-2 gap-12 relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--libido-bg)] via-[var(--libido-border)] to-[var(--libido-bg)] -translate-x-1/2"></div>
            {[
              { n: "1", t: "Crie seu perfil", d: "Apresente-se do seu jeito, escolhendo as informações que deseja compartilhar." },
              { n: "2", t: "Descubra novas conexões", d: "Encontre pessoas, comunidades, conversas e experiências que tenham afinidade com você." },
              { n: "3", t: "Converse no seu ritmo", d: "Comece uma conversa quando se sentir confortável. Interesse nunca significa obrigação." },
              { n: "4", t: "Decida o próximo passo", d: "Você controla seus limites, suas escolhas e o momento de avançar." }
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-[var(--libido-surface-2)] border border-[var(--libido-border)] flex items-center justify-center font-fraunces text-xl text-[var(--libido-accent)] shrink-0">
                  {item.n}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[var(--libido-text)]">{item.t}</h3>
                  <p className="text-sm text-[var(--libido-muted)] leading-relaxed">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consentimento */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--libido-accent)]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-fraunces font-medium mb-8">
            Consentimento sempre.<br/>Respeito em cada interação.
          </h2>
          <div className="space-y-6 text-sm md:text-base text-[var(--libido-muted)] leading-relaxed mb-10">
            <p>No Libido, desejo e respeito caminham juntos.</p>
            <p>Um “sim” deve ser livre, consciente e pode mudar a qualquer momento.</p>
            <p>Pressão, insistência, chantagem, ameaça, exposição de imagens ou qualquer forma de assédio não fazem parte desta comunidade.</p>
          </div>
          <button className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] text-[var(--libido-text)] font-bold py-4 px-8 rounded-[16px] text-sm transition-all hover:bg-[var(--libido-surface)] inline-flex items-center gap-2">
            Ver Regras da Comunidade
          </button>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-24 px-6 bg-[var(--libido-surface)] border-y border-[var(--libido-border)]/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-fraunces font-medium mb-6">Um ambiente adulto sem parecer vulgar.</h2>
          <p className="text-sm md:text-base text-[var(--libido-muted)] max-w-2xl mx-auto mb-16 leading-relaxed">
            Sensualidade não precisa significar exposição.<br/><br/>O Libido combina uma experiência visual elegante com recursos sociais criados para aproximar pessoas adultas que valorizam discrição, conversa e liberdade.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { t: "Privacidade em primeiro lugar", d: "Menos exposição. Mais controle sobre sua presença.", i: Eye },
              { t: "Experiência sem julgamentos", d: "Espaço para diferentes desejos, identidades e formas de conexão entre adultos.", i: CheckCircle2 },
              { t: "Segurança ativa", d: "Ferramentas de denúncia, bloqueio e moderação para lidar com comportamentos inadequados.", i: Shield },
              { t: "Comunidade, não apenas perfis", d: "Conversas, grupos, eventos e espaços de interação para criar conexões além de uma simples curtida.", i: ArrowRight }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] p-6 rounded-[20px] flex flex-col gap-4">
                <item.i className="w-6 h-6 text-[var(--libido-accent)]" />
                <h3 className="text-sm font-bold text-[var(--libido-text)]">{item.t}</h3>
                <p className="text-xs text-[var(--libido-muted)] leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-[var(--libido-surface-2)] border border-[var(--libido-border)] rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--libido-accent)] to-transparent"></div>
          <h2 className="text-3xl md:text-4xl font-fraunces font-medium mb-4">Mais possibilidades.<br/>A mesma discrição.</h2>
          <p className="text-sm text-[var(--libido-muted)] mb-8">
            Tenha acesso à experiência Premium do Libido e aproveite recursos adicionais dentro da plataforma.
          </p>
          <div className="bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-2xl p-6 md:p-8 mb-8 inline-block text-left mx-auto w-full max-w-sm">
            <h3 className="text-lg font-bold text-[var(--libido-text)] mb-2 text-center">Libido Premium</h3>
            <div className="text-4xl font-fraunces font-medium text-[var(--libido-accent)] mb-4 text-center">R$ 19,90</div>
            <p className="text-xs text-[var(--libido-muted)] text-center pb-4 border-b border-[var(--libido-border)]">Pagamento por Pix.</p>
            <ul className="mt-4 space-y-3 text-xs text-[var(--libido-muted)]">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[var(--libido-gold)]" /> Radar exclusivo</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[var(--libido-gold)]" /> Grupos privados</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[var(--libido-gold)]" /> Conteúdo sem paywall</li>
            </ul>
          </div>
          <button className="bg-[var(--libido-bg)] border border-[var(--libido-accent)]/50 text-[var(--libido-text)] font-bold py-4 px-8 rounded-[16px] text-sm transition-all hover:bg-[var(--libido-surface)] inline-flex items-center gap-2">
            Conhecer o Premium
          </button>
          <p className="text-[10px] text-[var(--libido-muted)] opacity-60 mt-6 max-w-sm mx-auto">
            O pagamento não altera seus limites, sua privacidade nem suas escolhas dentro da comunidade.
          </p>
        </div>
      </section>

      {/* Bloco de Confiança */}
      <section className="py-24 px-6 bg-[var(--libido-surface)] border-y border-[var(--libido-border)]/50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-fraunces font-medium mb-12">Entre porque ficou curioso.<br/>Permaneça porque se sente respeitado.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Exclusivo para maiores de 18 anos",
              "Ferramentas de bloqueio e denúncia",
              "Moderação de comportamentos inadequados",
              "Controle sobre informações do perfil",
              "Compromisso com a LGPD",
              "Regras claras contra assédio e golpes",
              "Ambiente inclusivo e sem julgamentos"
            ].map((badge, i) => (
              <span key={i} className="px-4 py-2 rounded-full border border-[var(--libido-border)] bg-[var(--libido-bg)] text-xs text-[var(--libido-muted)]">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-fraunces font-medium mb-12 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[var(--libido-border)] rounded-[16px] bg-[var(--libido-surface-2)] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-[var(--libido-text)] transition-colors hover:bg-[var(--libido-surface)]"
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  <ChevronDown size={16} className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-5 pt-0 text-sm text-[var(--libido-muted)] leading-relaxed border-t border-[var(--libido-border)]/50 mt-1">
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chamada Final */}
      <section className="py-32 px-6 relative text-center overflow-hidden border-t border-[var(--libido-border)]/50">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--libido-accent)]/5 rounded-t-[100%] blur-[100px] pointer-events-none"></div>
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-fraunces font-medium mb-6 leading-tight">
            Seu desejo.<br/>Seu espaço.<br/>Suas escolhas.
          </h2>
          <p className="text-sm md:text-lg text-[var(--libido-muted)] mb-10 leading-relaxed">
            Descubra conexões adultas em um ambiente criado para valorizar privacidade, liberdade e respeito.
          </p>
          <button 
            onClick={onRegisterClick}
            className="w-full sm:w-auto bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 px-10 rounded-[16px] text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99] mx-auto"
          >
            Tenho 18 anos ou mais. Quero entrar.
          </button>
          <p className="text-[10px] md:text-xs text-[var(--libido-muted)] opacity-60 mt-8 max-w-sm mx-auto leading-relaxed">
            Ao entrar, você declara ter pelo menos 18 anos e concorda com os Termos de Uso, a Política de Privacidade e as Regras da Comunidade.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--libido-border)] bg-[var(--libido-surface)] text-[var(--libido-muted)] text-xs">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <div className="font-fraunces font-bold text-lg tracking-[0.2em] text-[var(--libido-text)] mb-4">
              LIBIDO<span className="text-[var(--libido-accent)]">.</span>
            </div>
            <p className="mb-2">Conexões adultas com privacidade, liberdade e respeito.</p>
            <p className="mb-2 font-bold text-[var(--libido-text)]">Uso exclusivo para maiores de 18 anos.</p>
            <p className="mb-6 opacity-70">O Libido não oferece, vende ou intermedeia serviços sexuais.</p>
            <p className="opacity-70 max-w-sm">Compromisso com a proteção de dados pessoais e com os princípios da LGPD.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Central de Segurança</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Regras da Comunidade</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Ajuda e suporte</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Contato</a>
            <a href="#" className="mt-4 opacity-50 hover:opacity-100 transition-opacity">Excluir minha conta</a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-[var(--libido-border)]/30 text-center opacity-50">
          &copy; {new Date().getFullYear()} Libido. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
