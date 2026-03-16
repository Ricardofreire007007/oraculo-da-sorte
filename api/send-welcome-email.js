import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name } = req.body;

  const html = [
    '<!DOCTYPE html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '</head><body style="margin:0;padding:0;background:#0a0612;font-family:Georgia,serif;">',
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0612;padding:40px 0">',
    '<tr><td align="center">',
    '<table width="560" cellpadding="0" cellspacing="0" style="background:#110d1e;border:1px solid rgba(201,168,76,0.25);border-radius:16px;overflow:hidden;max-width:560px;width:100%">',

    // Header
    '<tr><td style="background:#1a1030;padding:32px 40px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15)">',
    '<p style="margin:0 0 4px;font-size:11px;letter-spacing:5px;color:#5a5070;text-transform:uppercase;font-family:Arial,sans-serif">Entretenimento Espiritual</p>',
    '<h1 style="margin:0;font-size:28px;color:#c9a84c;font-family:Georgia,serif">&#10022; Oraculo da Sorte</h1>',
    '<p style="margin:8px 0 0;font-size:13px;color:#7a6f90;font-style:italic">Os seus numeros ocultos... sao agora revelados</p>',
    '</td></tr>',

    // Body
    '<tr><td style="padding:40px">',
    '<p style="text-align:center;font-size:48px;margin:0 0 24px">&#x1F52E;</p>',
    '<h2 style="margin:0 0 16px;font-size:22px;color:#f0e6d3;text-align:center;font-family:Georgia,serif">',
    'Ola, ' + (name || 'viajante') + '!</h2>',
    '<p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#d0c4b0;text-align:center">',
    'Seu lugar na waitlist do <strong style="color:#c9a84c">Oraculo da Sorte</strong> foi reservado com sucesso.</p>',
    '<p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#a89880;text-align:center">',
    'Voce sera um dos primeiros a acessar quando lancamos. Os astros ja conhecem seu caminho.</p>',

    // Benefit box
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:12px;margin-bottom:28px">',
    '<tr><td style="padding:20px;text-align:center">',
    '<p style="margin:0 0 8px;font-size:11px;color:#c9a84c;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif">Seu beneficio reservado</p>',
    '<p style="margin:0;font-size:17px;color:#f0e6d3;font-family:Georgia,serif">30 dias do Plano Mistico <strong style="color:#c9a84c">gratis</strong> no lancamento</p>',
    '</td></tr></table>',

    // Icons
    '<table width="100%" cellpadding="0" cellspacing="0">',
    '<tr>',
    '<td width="33%" style="text-align:center;padding:12px">',
    '<p style="font-size:28px;margin:0">&#x2728;</p>',
    '<p style="margin:6px 0 0;font-size:12px;color:#7a6f90;font-family:Arial,sans-serif">Numerologia</p>',
    '</td>',
    '<td width="33%" style="text-align:center;padding:12px">',
    '<p style="font-size:28px;margin:0">&#x1F319;</p>',
    '<p style="margin:6px 0 0;font-size:12px;color:#7a6f90;font-family:Arial,sans-serif">Ciclos Lunares</p>',
    '</td>',
    '<td width="33%" style="text-align:center;padding:12px">',
    '<p style="font-size:28px;margin:0">&#x1F0CF;</p>',
    '<p style="margin:6px 0 0;font-size:12px;color:#7a6f90;font-family:Arial,sans-serif">Tarot</p>',
    '</td>',
    '</tr></table>',
    '</td></tr>',

    // Footer
    '<tr><td style="background:rgba(0,0,0,0.3);padding:24px 40px;border-top:1px solid rgba(255,255,255,0.04)">',
    '<p style="margin:0 0 8px;font-size:13px;color:#5a5070;text-align:center;line-height:1.7;font-family:Arial,sans-serif">',
    'Fique de olho no seu email. Em breve os numeros do destino serao revelados.</p>',
    '<p style="margin:12px 0 0;font-size:10px;color:#3d3555;text-align:center;line-height:1.6;font-family:Arial,sans-serif">',
    'Oraculo da Sorte e um aplicativo de entretenimento espiritual. ',
    'Nao garantimos resultados em jogos de azar. Jogue com responsabilidade.</p>',
    '</td></tr>',

    '</table></td></tr></table>',
    '</body></html>'
  ].join('');

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Os astros receberam seu pedido. \u2726',
      html: html,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
