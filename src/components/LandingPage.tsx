import { useState } from 'react';
import { Logo } from './Logo';
import { ChevronDown, Lock, EyeOff, Shield, CheckCircle2 } from 'lucide-react';

export function LandingPage({ onLoginClick, onRegisterClick, onPartnersClick }: { onLoginClick: () => void, onRegisterClick: () => void, onPartnersClick?: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Quem pode utilizar o Libido?",
      a: "Somente pessoas com 18 anos ou mais. Perfis pertencentes ou atribuÃ­dos a menores de idade serÃ£o removidos."
    },
    {
      q: "O Libido Ã© um site de acompanhantes?",
      a: "NÃ£o. O Libido Ã© uma plataforma de conexÃµes e interaÃ§Ã£o entre adultos. NÃ£o permitimos a oferta, solicitaÃ§Ã£o ou intermediaÃ§Ã£o de serviÃ§os sexuais pagos."
    },
    {
      q: "Preciso mostrar todas as minhas informaÃ§Ãµes?",
      a: "NÃ£o. Compartilhe apenas as informaÃ§Ãµes necessÃ¡rias para utilizar a plataforma e aquilo que se sentir confortÃ¡vel em tornar visÃ­vel no perfil."
    },
    {
      q: "Como o Libido trata meus dados pessoais?",
      a: "O tratamento de dados pessoais Ã© orientado por nossa PolÃ­tica de Privacidade e pelo compromisso com a LGPD. Nela vocÃª poderÃ¡ entender quais informaÃ§Ãµes sÃ£o utilizadas, suas finalidades e como exercer seus direitos."
    },
    {
      q: "Quais direitos tenho sobre meus dados?",
      a: "A LGPD prevÃª direitos relacionados aos dados pessoais, incluindo solicitaÃ§Ãµes de acesso, correÃ§Ã£o e eliminaÃ§Ã£o em situaÃ§Ãµes previstas na legislaÃ§Ã£o. Consulte a PolÃ­tica de Privacidade para conhecer os canais e procedimentos disponÃ­veis."
    },
    {
      q: "Posso denunciar outro perfil?",
      a: "Sim. Comportamentos suspeitos, abusivos ou contrÃ¡rios Ã s Regras da Comunidade podem ser denunciados dentro da plataforma."
    },
    {
      q: "O Libido Ã© gratuito?",
      a: "O cadastro e parte da experiÃªncia podem ser acessados gratuitamente. Recursos adicionais estÃ£o disponÃ­veis por meio do Libido Premium."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)] font-sans overflow-x-hidden selection:bg-[var(--libido-accent)] selection:text-black">
      {/* Age Bar */}
      <div className="bg-[var(--libido-surface-2)] border-b border-[var(--libido-border)]/50 text-center py-3 px-4 relative z-50">
        <p className="text-xs md:text-sm font-bold text-[var(--libido-muted)]">
          ðŸ”ž Uso exclusivo para maiores de 18 anos.
        </p>
        <p className="text-[10px] md:text-xs text-[var(--libido-muted)] opacity-70 mt-1 max-w-2xl mx-auto">
          Ao continuar, vocÃª confirma que tem 18 anos ou mais e concorda com nossos Termos de Uso, PolÃ­tica de Privacidade e Regras da Comunidade.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--libido-accent)]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--libido-border)] to-transparent"></div>
        
        <div className="mb-12"><Logo size="lg" /></div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-fraunces font-medium leading-[1.1] mb-6 max-w-4xl mx-auto">
          ConexÃµes adultas.<br/>
          <span className="text-[var(--libido-muted)]">Privacidade levada a sÃ©rio.</span>
        </h1>
        
        <p className="text-sm md:text-lg text-[var(--libido-muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
          Um espaÃ§o para maiores de 18 anos que desejam conhecer pessoas, conversar e explorar novas possibilidades com liberdade, respeito e discriÃ§Ã£o.<br/><br/>
          VocÃª escolhe o que mostrar, com quem conversar e atÃ© onde deseja ir.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
          <button 
            onClick={onRegisterClick}
            className="bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 px-10 rounded-[16px] text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99]"
          >
            Criar conta gratuita
          </button>
          <button 
            onClick={onLoginClick}
            className="bg-[var(--libido-surface-2)] text-[var(--libido-text)] border border-[var(--libido-border)] font-bold py-4 px-10 rounded-[16px] text-sm tracking-wide transition-all hover:bg-[var(--libido-surface)]"
          >
            Fazer login
          </button>
        </div>
      </section>

      {/* Pilares */}
      <section className="py-24 px-6 bg-[var(--libido-bg)] relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] p-8 rounded-[24px] hover:border-[var(--libido-accent)]/30 transition-colors">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <EyeOff size={24} className="text-[var(--libido-accent)]" />
            </div>
            <h3 className="text-lg font-bold mb-3">Controle total</h3>
            <p className="text-sm text-[var(--libido-muted)] leading-relaxed">
              Oculte seu rosto no feed pÃºblico, restrinja o acesso Ã s suas fotos sensÃ­veis com PIN de seguranÃ§a e revele apenas para quem vocÃª escolher.
            </p>
          </div>
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] p-8 rounded-[24px] hover:border-[var(--libido-accent)]/30 transition-colors">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Shield size={24} className="text-[var(--libido-accent)]" />
            </div>
            <h3 className="text-lg font-bold mb-3">SeguranÃ§a em foco</h3>
            <p className="text-sm text-[var(--libido-muted)] leading-relaxed">
              Marca d'Ã¡gua invisÃ­vel com rastreabilidade ativa para prevenir vazamentos e ambiente bloqueado contra capturas de tela.
            </p>
          </div>
          <div className="bg-[var(--libido-surface-2)] border border-[var(--libido-border)] p-8 rounded-[24px] hover:border-[var(--libido-accent)]/30 transition-colors">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Lock size={24} className="text-[var(--libido-accent)]" />
            </div>
            <h3 className="text-lg font-bold mb-3">Falso Fim</h3>
            <p className="text-sm text-[var(--libido-muted)] leading-relaxed">
              Acesso protegido por PIN e tela de pÃ¢nico "Modo Ghost" ativada instantaneamente, garantindo a sua discriÃ§Ã£o em qualquer lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Banner */}
      <section className="py-24 px-6 relative flex justify-center">
        <div className="max-w-4xl w-full bg-[var(--libido-surface-2)] border border-[var(--libido-accent)]/20 p-10 md:p-16 rounded-[32px] text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--libido-accent)] to-transparent"></div>
          
          <h2 className="text-3xl md:text-4xl font-fraunces font-medium mb-4">Mais possibilidades.<br/>A mesma discriÃ§Ã£o.</h2>
          <p className="text-sm text-[var(--libido-muted)] mb-8">
            Tenha acesso Ã  experiÃªncia Premium do Libido e aproveite recursos adicionais dentro da plataforma.
          </p>

          <div className="bg-[var(--libido-bg)] border border-[var(--libido-border)] rounded-2xl p-6 md:p-8 mb-8 inline-block text-left mx-auto w-full max-w-sm">
            <h3 className="text-lg font-bold text-[var(--libido-text)] mb-2 text-center">Libido Premium</h3>
            <div className="text-4xl font-fraunces font-medium text-[var(--libido-accent)] mb-4 text-center">R$ 19,90</div>
            <p className="text-xs text-[var(--libido-muted)] text-center pb-4 border-b border-[var(--libido-border)]">Pagamento por Pix.</p>
            <ul className="mt-4 space-y-3 text-xs text-[var(--libido-muted)]">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[var(--libido-gold)]" /> Radar exclusivo</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[var(--libido-gold)]" /> Grupos privados</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[var(--libido-gold)]" /> ConteÃºdo sem paywall</li>
            </ul>
          </div>

          <button className="bg-[var(--libido-bg)] border border-[var(--libido-accent)]/50 text-[var(--libido-text)] font-bold py-4 px-8 rounded-[16px] text-sm transition-all hover:bg-[var(--libido-surface)] inline-flex items-center gap-2">
            Conhecer o Premium
          </button>

          <p className="text-[10px] text-[var(--libido-muted)] opacity-60 mt-6 max-w-sm mx-auto">
            O pagamento nÃ£o altera seus limites, sua privacidade nem suas escolhas dentro da comunidade.
          </p>
        </div>
      </section>

      {/* Bloco de ConfianÃ§a */}
      <section className="py-24 px-6 bg-[var(--libido-surface)] border-y border-[var(--libido-border)]/50 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-fraunces font-medium mb-12">Entre porque ficou curioso.<br/>PermaneÃ§a porque se sente respeitado.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Exclusivo para maiores de 18 anos",
              "Ferramentas de bloqueio e denÃºncia",
              "ModeraÃ§Ã£o de comportamentos inadequados",
              "Controle sobre informaÃ§Ãµes do perfil",
              "Compromisso com a LGPD",
              "Regras claras contra assÃ©dio e golpes",
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
            Seu desejo.<br/>Seu espaÃ§o.<br/>Suas escolhas.
          </h2>
          <p className="text-sm md:text-lg text-[var(--libido-muted)] mb-10 leading-relaxed">
            Descubra conexÃµes adultas em um ambiente criado para valorizar privacidade, liberdade e respeito.
          </p>
          <button 
            onClick={onRegisterClick}
            className="w-full sm:w-auto bg-gradient-to-r from-[var(--libido-accent)] to-[var(--libido-accent-hover)] text-[var(--libido-text)] font-bold py-4 px-10 rounded-[16px] text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(216,107,63,0.15)] hover:shadow-[0_4px_25px_rgba(216,107,63,0.25)] hover:scale-[1.01] active:scale-[0.99] mx-auto"
          >
            Tenho 18 anos ou mais. Quero entrar.
          </button>
          <p className="text-[10px] md:text-xs text-[var(--libido-muted)] opacity-60 mt-8 max-w-sm mx-auto leading-relaxed">
            Ao entrar, vocÃª declara ter pelo menos 18 anos e concorda com os Termos de Uso, a PolÃ­tica de Privacidade e as Regras da Comunidade.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--libido-border)] bg-[var(--libido-surface)] text-[var(--libido-muted)] text-xs">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <div className="mb-4"><Logo size="md" /></div>
            <p className="mb-2">ConexÃµes adultas com privacidade, liberdade e respeito.</p>
            <p className="mb-2 font-bold text-[var(--libido-text)]">Uso exclusivo para maiores de 18 anos.</p>
            <p className="mb-6 opacity-70">O Libido nÃ£o oferece, vende ou intermedeia serviÃ§os sexuais.</p>
            <p className="opacity-70 max-w-sm">Compromisso com a proteÃ§Ã£o de dados pessoais e com os princÃ­pios da LGPD.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">PolÃ­tica de Privacidade</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Central de SeguranÃ§a</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Regras da Comunidade</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Ajuda e suporte</a>
            <a href="#" className="hover:text-[var(--libido-text)] transition-colors">Contato</a>
            <button onClick={onPartnersClick} className="mt-2 text-[var(--libido-accent)] font-bold hover:text-[var(--libido-accent-hover)] transition-colors uppercase tracking-wider text-[10px]">Parceiros (B2B)</button>
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
