// src/pages/Privacidade.jsx
// Política de Privacidade — conformidade LGPD (Lei 13.709/2018).
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

export default function Privacidade() {
  useEffect(() => { document.title = 'Política de Privacidade — Oráculo da Sorte'; }, []);

  return (
    <div style={styles.page}>
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />

      <header style={styles.header}>
        <Link to="/" style={styles.homeLink}>✦ Oráculo da Sorte</Link>
      </header>

      <main style={styles.main}>
        <h1 style={styles.h1}>Política de Privacidade</h1>
        <p style={styles.updated}>Última atualização: 21 de abril de 2026</p>

        <h2 style={styles.h2}>1. Quem somos</h2>
        <p style={styles.p}>
          O Oráculo da Sorte ("Serviço") é uma plataforma digital de entretenimento espiritual, operada sob o CNPJ 66.365.439/0001-26 (nome fantasia: Oráculo da Sorte). Esta política explica como tratamos seus dados pessoais quando você usa o site <strong>oraculo-da-sorte.com</strong>. Para qualquer dúvida ou pedido sobre seus dados, escreva para <a href="mailto:contato@oraculo-da-sorte.com" style={styles.a}>contato@oraculo-da-sorte.com</a>.
        </p>

        <h2 style={styles.h2}>2. Quais dados recolhemos</h2>
        <p style={styles.p}>Recolhemos apenas os dados necessários para o funcionamento do Serviço:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Dados de conta:</strong> email, nome completo, data de nascimento e cidade de residência (fornecidos por você no cadastro ou via login Google).</li>
          <li style={styles.li}><strong>Dados técnicos opcionais:</strong> latitude, longitude e fuso horário (quando você autoriza acesso à geolocalização do dispositivo, para personalizar cálculos planetários).</li>
          <li style={styles.li}><strong>Dados de uso:</strong> plano contratado (Livre, Pacote 3 Consultas, Místico, Sagrado, Premium Anual), créditos restantes, histórico de consultas e referências a pagamentos (ID do pagamento Mercado Pago, valor, estado).</li>
        </ul>
        <p style={styles.p}>
          Não recolhemos documentos de identidade, dados bancários diretamente, nem informações sensíveis como origem racial, convicção religiosa ou dados de saúde.
        </p>

        <h2 style={styles.h2}>3. Para que usamos seus dados</h2>
        <p style={styles.p}>Usamos seus dados exclusivamente para três finalidades:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Personalizar sua experiência mística:</strong> usar data de nascimento, cidade e localização para calcular posições planetárias, fases da lua, numerologia e correspondências astrológicas que compõem suas consultas.</li>
          <li style={styles.li}><strong>Processar pagamentos e gerir seu plano:</strong> confirmar transações feitas no Mercado Pago, ativar os dias de acesso contratados e manter saldo de créditos atualizado.</li>
          <li style={styles.li}><strong>Comunicação com você:</strong> enviar confirmações de compra, avisos importantes sobre sua conta e respostas a pedidos de suporte.</li>
        </ul>

        <h2 style={styles.h2}>4. Base legal (LGPD)</h2>
        <p style={styles.p}>O tratamento dos seus dados é feito com base no Art. 7º da Lei Geral de Proteção de Dados (Lei 13.709/2018):</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Consentimento</strong> (Art. 7º, I): quando você se cadastra e aceita esta política, consente no tratamento descrito aqui.</li>
          <li style={styles.li}><strong>Execução de contrato</strong> (Art. 7º, V): precisamos dos seus dados para cumprir o serviço que você contratou.</li>
          <li style={styles.li}><strong>Obrigação legal</strong> (Art. 7º, II): dados de pagamento são retidos conforme legislação fiscal.</li>
        </ul>

        <h2 style={styles.h2}>5. Com quem partilhamos seus dados</h2>
        <p style={styles.p}>Não vendemos seus dados. Partilhamos apenas com prestadores necessários para o funcionamento do Serviço:</p>
        <p style={styles.p}>
          Partilhamos seus dados apenas com prestadores essenciais ao funcionamento do Serviço, chamados de operadores nos termos do Art. 5º, VII da LGPD. Todos operam sob nossa instrução e responsabilidade.
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Google</strong> (autenticação): ao entrar com conta Google, o Google partilha connosco o seu email e nome para verificarmos a sua identidade. O Google regista a sua utilização do nosso Serviço conforme a política de privacidade do próprio Google (consulte em <a href="https://policies.google.com/privacy" style={styles.a}>https://policies.google.com/privacy</a>).</li>
          <li style={styles.li}><strong>Supabase</strong> (banco de dados): armazena sua conta e histórico de forma encriptada.</li>
          <li style={styles.li}><strong>Mercado Pago</strong> (pagamentos): processa as compras com Pix, cartão ou boleto. Os pagamentos processados via Mercado Pago estão sujeitos à política de privacidade do próprio Mercado Pago. Consulte em <a href="https://www.mercadopago.com.br/privacidade" style={styles.a}>https://www.mercadopago.com.br/privacidade</a>.</li>
          <li style={styles.li}><strong>Resend</strong> (email transacional): envia confirmações de compra e notificações.</li>
          <li style={styles.li}><strong>Vercel</strong> (hospedagem e analytics): serve o site e recolhe métricas agregadas de uso, sem identificação pessoal para fins publicitários.</li>
          <li style={styles.li}><strong>RevenueCat</strong> (em preparação para versão móvel futura): se e quando lançarmos app móvel, gerirá compras in-app.</li>
        </ul>
        <p style={styles.p}>
          Todos esses prestadores operam conforme suas próprias políticas de privacidade e estão submetidos a legislações rigorosas de proteção de dados.
        </p>

        <h2 style={styles.h2}>6. Transferência internacional</h2>
        <p style={styles.p}>
          Alguns dos nossos prestadores (Supabase, Vercel, Resend) podem operar servidores fora do Brasil. Essas transferências internacionais são feitas com base nas exceções previstas no Art. 33 da LGPD, em países que oferecem nível de proteção adequado ou mediante cláusulas contratuais específicas que asseguram o cumprimento dos princípios da LGPD.
        </p>

        <h2 style={styles.h2}>7. Por quanto tempo guardamos seus dados</h2>
        <p style={styles.p}>
          Guardamos os dados enquanto a conta estiver ativa ou conforme necessário para executar os serviços. Dados de pagamento são retidos conforme a legislação fiscal brasileira (obrigação legal). Após pedido de eliminação, apagamos em até 30 dias, exceto dados que a lei nos obrigue a reter.
        </p>

        <h2 style={styles.h2}>8. Seus direitos (LGPD Art. 18)</h2>
        <p style={styles.p}>Como titular dos dados, você tem direito a:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>Acesso:</strong> confirmar se tratamos seus dados e obter cópia.</li>
          <li style={styles.li}><strong>Correção:</strong> corrigir dados incompletos, desatualizados ou inexatos.</li>
          <li style={styles.li}><strong>Anonimização, bloqueio ou eliminação:</strong> pedir a exclusão dos seus dados.</li>
          <li style={styles.li}><strong>Portabilidade:</strong> receber seus dados em formato estruturado para transferir a outro fornecedor.</li>
          <li style={styles.li}><strong>Revogação do consentimento:</strong> retirar a autorização dada.</li>
          <li style={styles.li}><strong>Oposição:</strong> discordar de tratamento feito com base em outras hipóteses legais.</li>
        </ul>

        <h2 style={styles.h2}>9. Como exercer seus direitos</h2>
        <p style={styles.p}>
          Envie um email para <a href="mailto:contato@oraculo-da-sorte.com" style={styles.a}>contato@oraculo-da-sorte.com</a> com <strong>"LGPD"</strong> no assunto e descreva o pedido. Respondemos em até 15 dias corridos. Podemos pedir confirmação de identidade antes de executar pedidos sensíveis, como eliminação total.
        </p>

        <h2 style={styles.h2}>10. Cookies e analytics</h2>
        <p style={styles.p}>O Serviço usa:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong>localStorage do navegador</strong> para manter sua sessão de login ativa. Sem isto, você teria que fazer login a cada página.</li>
          <li style={styles.li}><strong>Vercel Analytics</strong> para métricas agregadas de desempenho do site. Não usamos cookies de publicidade nem partilhamos dados com plataformas de anúncios.</li>
        </ul>

        <h2 style={styles.h2}>11. Idade mínima</h2>
        <p style={styles.p}>
          O Serviço é destinado exclusivamente a maiores de 18 anos, em conformidade com a Lei 14.790/2023, que regula apostas no Brasil. Ao cadastrar-se, você confirma ter pelo menos 18 anos completos.
        </p>

        <h2 style={styles.h2}>12. Segurança dos dados</h2>
        <p style={styles.p}>
          Usamos encriptação em trânsito (HTTPS) e em armazenamento. Os pagamentos são processados por gateway certificado PCI-DSS (Mercado Pago), o que significa que nunca tocamos nos dados do seu cartão. Se detectarmos qualquer incidente de segurança que afete seus dados, avisamos dentro dos prazos legais.
        </p>

        <h2 style={styles.h2}>13. Atualizações desta política</h2>
        <p style={styles.p}>
          Podemos atualizar esta política para refletir mudanças legais ou no Serviço. Quando fizermos alterações materiais, notificamos por email e atualizamos a data no topo. Continuar a usar o Serviço após a notificação significa aceitar a nova versão.
        </p>

        <h2 style={styles.h2}>14. Contato</h2>
        <p style={styles.p}>
          Para qualquer questão sobre esta política ou seus dados: <a href="mailto:contato@oraculo-da-sorte.com" style={styles.a}>contato@oraculo-da-sorte.com</a>.
        </p>
        <p style={styles.p}>
          Veja também os <Link to="/termos" style={styles.a}>Termos de Uso</Link>.
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
          Esta política foi redigida em linguagem acessível com base nas exigências legais aplicáveis, mas não substitui aconselhamento jurídico especializado. Em caso de dúvida legal ou conflito, consulte um advogado.
        </p>
      </footer>
    </div>
  );
}
