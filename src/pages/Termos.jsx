// src/pages/Termos.jsx
// Termos de Uso — conformidade CDC, LGPD e Lei 14.790/2023.
// Última atualização: 21 de abril de 2026.

import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const COLORS = {
  bg: '#0a0612', gold: '#c9a84c', goldLight: '#e8c97a', amber: '#d4813a',
  text: '#f0e6d3', textMuted: '#a89880',
};

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');";

const styles = {
  page: {
    minHeight: '100vh', background: COLORS.bg, color: COLORS.text,
    fontFamily: "'EB Garamond', serif",
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(201,168,76,0.1)',
    maxWidth: 720, margin: '0 auto',
  },
  homeLink: {
    fontFamily: "'Cinzel Decorative', serif", fontSize: 15,
    background: 'linear-gradient(135deg, #e8c97a, #c9a84c)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    textDecoration: 'none',
  },
  main: {
    maxWidth: 720, margin: '0 auto',
    padding: '40px 24px',
  },
  h1: {
    fontFamily: "'Cinzel Decorative', serif", fontSize: 28,
    background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    marginBottom: 8,
  },
  updated: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 40 },
  h2: {
    fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.gold,
    marginTop: 32, marginBottom: 12,
  },
  p: { fontSize: 15, lineHeight: 1.8, marginBottom: 12 },
  ul: { paddingLeft: 24, marginBottom: 16 },
  li: { fontSize: 15, lineHeight: 1.8, marginBottom: 6 },
  a: { color: COLORS.gold, textDecoration: 'underline' },
  footer: {
    maxWidth: 720, margin: '0 auto',
    padding: '32px 24px 48px',
    borderTop: '1px solid rgba(201,168,76,0.15)',
    textAlign: 'center',
  },
  footerLinks: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  disclaimer: {
    fontSize: 11, color: COLORS.textMuted, opacity: 0.6,
    lineHeight: 1.7, fontStyle: 'italic',
    marginTop: 16,
  },
};

export default function Termos() {
  useEffect(() => { document.title = 'Termos de Uso — Oráculo da Sorte'; }, []);

  return (
    <div style={styles.page}>
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />

      <header style={styles.header}>
        <Link to="/" style={styles.homeLink}>✦ Oráculo da Sorte</Link>
      </header>

      <main style={styles.main}>
        <h1 style={styles.h1}>Termos de Uso</h1>
        <p style={styles.updated}>Última atualização: 21 de abril de 2026</p>

        <h2 style={styles.h2}>1. Aceitação dos termos</h2>
        <p style={styles.p}>
          Ao usar o Oráculo da Sorte ("Serviço"), operado sob o CNPJ 66.365.439/0001-26 (nome fantasia: Oráculo da Sorte), você declara ter lido, compreendido e aceite estes Termos de Uso. Se não concorda com algum ponto, por favor não use o Serviço.
        </p>

        <h2 style={styles.h2}>2. O que é o Oráculo da Sorte</h2>
        <p style={styles.p}>
          O Oráculo da Sorte é uma plataforma digital de <strong>entretenimento espiritual</strong>. Oferecemos geração de números místicos para loterias brasileiras (Mega-Sena, Lotofácil, Quina, Lotomania, +Milionária, Timemania) com base em sistemas como tarot, numerologia, anjos, astrologia planetária e tradições afro-brasileiras.
        </p>
        <p style={styles.p}>
          <strong>O Serviço é entretenimento. Não garantimos acerto, prémio ou retorno financeiro em qualquer loteria.</strong> Os números gerados não aumentam suas chances objetivas de vencer. Estatisticamente, qualquer combinação tem a mesma probabilidade.
        </p>
        <p style={styles.p}>
          <strong>Não somos afiliados à Caixa Econômica Federal</strong> nem a qualquer operadora de loterias oficial. O Oráculo da Sorte não vende bilhetes, não aceita apostas e não processa prémios.
        </p>

        <h2 style={styles.h2}>3. Idade mínima e jogo responsável</h2>
        <p style={styles.p}>
          O Serviço é destinado exclusivamente a <strong>maiores de 18 anos</strong>, conforme a Lei 14.790/2023. Ao cadastrar-se, você confirma ter pelo menos 18 anos completos.
        </p>
        <p style={styles.p}>
          Incentivamos o jogo responsável. Se sentir que está a gastar mais do que pode em loterias, procure ajuda:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Centro de Valorização da Vida (CVV):</strong> 188 (ligação gratuita, 24 horas)</li>
          <li style={styles.li}>Site: <a href="https://www.cvv.org.br" style={styles.a}>https://www.cvv.org.br</a></li>
        </ul>

        <h2 style={styles.h2}>4. Conta de utilizador</h2>
        <p style={styles.p}>O acesso ao Serviço requer criação de conta via Google (OAuth). Você é responsável por:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Usar uma conta Google que realmente lhe pertence</li>
          <li style={styles.li}>Manter a sua conta Google segura (senha forte, autenticação em dois fatores)</li>
          <li style={styles.li}>Fornecer dados verídicos no cadastro (data de nascimento correta, nome verdadeiro)</li>
        </ul>
        <p style={styles.p}>Apenas uma conta por pessoa. Contas duplicadas podem ser consolidadas ou encerradas.</p>

        <h2 style={styles.h2}>5. Planos e pagamentos</h2>
        <p style={styles.p}>
          Oferecemos quatro planos, todos <strong>pagamentos avulsos, sem renovação automática e sem subscrições recorrentes</strong>:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Pacote 3 Consultas:</strong> R$ 6,00 — 3 consultas individuais (sem prazo de validade)</li>
          <li style={styles.li}><strong>Místico:</strong> R$ 9,90 — acesso ilimitado por 7 dias</li>
          <li style={styles.li}><strong>Sagrado:</strong> R$ 24,90 — acesso ilimitado por 30 dias</li>
          <li style={styles.li}><strong>Premium Anual:</strong> R$ 99,00 — acesso ilimitado por 365 dias</li>
        </ul>
        <p style={styles.p}>
          Os pagamentos são processados pelo Mercado Pago, que aceita Pix, cartão de crédito, cartão de débito e boleto bancário. O acesso é ativado automaticamente após confirmação do pagamento. Todos os valores são em Reais (R$) e incluem eventuais tributos aplicáveis.
        </p>

        <h2 style={styles.h2}>6. Direito de arrependimento e reembolsos</h2>
        <p style={styles.p}>
          O consumidor tem direito de arrependimento em até 7 dias após a compra, nos termos do Art. 49 do Código de Defesa do Consumidor brasileiro. Para exercer, envie email para <a href="mailto:contato@oraculo-da-sorte.com" style={styles.a}>contato@oraculo-da-sorte.com</a> com <strong>"Arrependimento"</strong> no assunto. Após esse prazo, reembolsos só serão analisados em caso de erro técnico comprovado.
        </p>
        <p style={styles.p}>
          Pedidos de reembolso são processados pelo Mercado Pago; o valor é devolvido pelo mesmo meio de pagamento usado na compra.
        </p>

        <h2 style={styles.h2}>7. Uso adequado do Serviço</h2>
        <p style={styles.p}>Você concorda em <strong>não</strong>:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Automatizar acessos (bots, scripts, scraping)</li>
          <li style={styles.li}>Criar contas múltiplas para burlar limites de plano</li>
          <li style={styles.li}>Fazer engenharia reversa do código, das APIs ou dos algoritmos</li>
          <li style={styles.li}>Revender, redistribuir ou licenciar as consultas geradas como se fossem suas</li>
          <li style={styles.li}>Usar o Serviço para qualquer finalidade ilegal ou contrária à ordem pública</li>
        </ul>

        <h2 style={styles.h2}>8. Suspensão e cancelamento</h2>
        <p style={styles.p}>
          Reservamo-nos o direito de <strong>suspender ou cancelar contas</strong> que violem estes termos, sem reembolso, mediante aviso prévio razoável (exceto em casos graves que exijam ação imediata).
        </p>
        <p style={styles.p}>
          Você pode <strong>pedir a eliminação da sua conta</strong> a qualquer momento enviando email para <a href="mailto:contato@oraculo-da-sorte.com" style={styles.a}>contato@oraculo-da-sorte.com</a>. A eliminação é processada em até 30 dias, respeitando obrigações legais de retenção (ver <Link to="/privacidade" style={styles.a}>Política de Privacidade</Link>).
        </p>

        <h2 style={styles.h2}>9. Propriedade intelectual</h2>
        <p style={styles.p}>
          Todo o conteúdo do Oráculo da Sorte — código-fonte, design, textos, ilustrações, nomes, marcas e sistemas de geração mística — é propriedade do Oráculo da Sorte (CNPJ 66.365.439/0001-26), protegido por direitos autorais e legislação brasileira aplicável.
        </p>
        <p style={styles.p}>
          Você pode usar o Serviço livremente para fins pessoais. Não pode copiar, reproduzir ou distribuir o conteúdo comercialmente sem autorização prévia por escrito.
        </p>

        <h2 style={styles.h2}>10. Limitação de responsabilidade</h2>
        <p style={styles.p}>O Oráculo da Sorte é fornecido "como está". Dentro dos limites permitidos pela lei:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Não somos responsáveis por perdas financeiras em loterias.</strong> Jogar é decisão pessoal sua.</li>
          <li style={styles.li}>Não garantimos disponibilidade ininterrupta (manutenções programadas, falhas de infraestrutura, casos fortuitos).</li>
          <li style={styles.li}>Não somos responsáveis por dados incorretos que você forneça no cadastro.</li>
        </ul>
        <p style={styles.p}>
          Esta limitação não exclui a responsabilidade por dolo ou culpa grave da nossa parte, nem os direitos de consumidor garantidos pela legislação brasileira (CDC).
        </p>

        <h2 style={styles.h2}>11. Alterações destes termos</h2>
        <p style={styles.p}>
          Podemos atualizar estes Termos de Uso para refletir mudanças legais ou no Serviço. Quando fizermos alterações materiais, notificamos por email e atualizamos a data no topo. Continuar a usar o Serviço após a notificação significa aceitar a nova versão. Se não concordar, você pode cancelar a conta antes.
        </p>

        <h2 style={styles.h2}>12. Legislação aplicável e foro</h2>
        <p style={styles.p}>
          Estes termos são regidos pela legislação brasileira, em especial pelo Código de Defesa do Consumidor (Lei 8.078/1990), Lei Geral de Proteção de Dados (Lei 13.709/2018) e Marco Civil da Internet (Lei 12.965/2014).
        </p>
        <p style={styles.p}>
          Para qualquer disputa, fica eleito o <strong>foro da comarca de residência do titular (consumidor)</strong>, nos termos do Art. 101 do Código de Defesa do Consumidor.
        </p>

        <h2 style={styles.h2}>13. Contato</h2>
        <p style={styles.p}>
          Para qualquer dúvida sobre estes termos: <a href="mailto:contato@oraculo-da-sorte.com" style={styles.a}>contato@oraculo-da-sorte.com</a>.
        </p>
        <p style={styles.p}>
          Veja também a <Link to="/privacidade" style={styles.a}>Política de Privacidade</Link>.
        </p>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <Link to="/privacidade" style={styles.a}>Privacidade</Link>
          {' · '}
          <Link to="/termos" style={styles.a}>Termos</Link>
          {' · '}
          <Link to="/" style={styles.a}>Início</Link>
        </div>
        <p style={styles.disclaimer}>
          Estes termos foram redigidos em linguagem acessível com base nas exigências legais aplicáveis, mas não substituem aconselhamento jurídico especializado. Em caso de dúvida legal ou conflito, consulte um advogado.
        </p>
      </footer>
    </div>
  );
}
