import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name } = req.body;

  try {
    await resend.emails.send({
      from: 'Oraculo da Sorte <onboarding@resend.dev>',
      to: email,
      subject: 'Seu lugar na waitlist foi reservado! ✨',
      html: 
        <div style="background:#0a0612;color:#f0e6d3;font-family:Georgia,serif;padding:40px;max-width:560px;margin:0 auto;border-radius:16px;">
          <h1 style="color:#c9a84c;font-size:28px;margin-bottom:8px;">✦ Oráculo da Sorte</h1>
          <p style="color:#a89880;font-size:14px;margin-bottom:32px;font-style:italic;">Os astros receberam seu pedido</p>
          <h2 style="color:#f0e6d3;font-size:22px;">Olá, ! 🔮</h2>
          <p style="font-size:16px;line-height:1.8;color:#d0c4b0;">
            Seu lugar na waitlist do <strong style="color:#c9a84c;">Oráculo da Sorte</strong> foi reservado com sucesso.
          </p>
          <p style="font-size:16px;line-height:1.8;color:#d0c4b0;">
            Você será um dos primeiros a acessar quando lançarmos — e vai ganhar <strong style="color:#c9a84c;">30 dias do Plano Místico gratuitamente</strong>.
          </p>
          <div style="background:#1a1030;border:1px solid #c9a84c33;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="color:#c9a84c;font-size:13px;font-family:sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">Seu benefício reservado</p>
            <p style="color:#f0e6d3;font-size:15px;margin:0;">30 dias do Plano Místico — grátis no lançamento</p>
          </div>
          <p style="font-size:14px;color:#a89880;line-height:1.8;">
            Fique de olho no seu email. Em breve os números do destino serão revelados.
          </p>
          <hr style="border:none;border-top:1px solid #2a2040;margin:32px 0;">
          <p style="font-size:11px;color:#5a5070;font-family:sans-serif;line-height:1.6;">
            Oráculo da Sorte é um app de entretenimento espiritual. Não garantimos resultados em jogos de azar. Jogue com responsabilidade.
          </p>
        </div>
      ,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
