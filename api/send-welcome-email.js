import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, name } = req.body;
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Seu lugar na waitlist foi reservado!',
      text: 'Ola ' + (name || 'viajante') + '! Seu lugar na waitlist do Oraculo da Sorte foi reservado. Voce ganhara 30 dias do Plano Mistico gratuitamente no lancamento. Oraculo da Sorte e um app de entretenimento espiritual.',
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
