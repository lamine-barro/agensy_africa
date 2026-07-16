/** Adaptateurs à remplacer par les appels certifiés des prestataires en production. */
export const integrations = {
  async createJekoPayment({ orderId, amount }) {
    return { provider: 'jeko', checkoutUrl: `${process.env.JEKO_PAYMENT_URL || 'https://checkout.jeko.africa'}/pay?reference=${orderId}&amount=${amount}` };
  },
  async certifyFne(invoice) {
    if (!process.env.FNE_API_URL || !process.env.FNE_API_TOKEN) return { status: 'pending_configuration' };
    // Raccorder ici l'API REST DGI avec Authorization: Bearer <FNE_API_TOKEN>.
    return { status: 'queued', invoice };
  },
  async notifyWhatsApp(message) {
    if (!process.env.WHATSAPP_WEBHOOK_URL) return { status: 'not_configured' };
    const response = await fetch(process.env.WHATSAPP_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
    if (!response.ok) throw new Error(`WhatsApp gateway failed with ${response.status}`);
    return { status: 'queued' };
  },
  async sendOtp({ phone, code }) {
    if (!process.env.WHATSAPP_WEBHOOK_URL) throw new Error('WHATSAPP_WEBHOOK_URL is required to send OTPs');
    const response = await fetch(process.env.WHATSAPP_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'otp', phone, code }) });
    if (!response.ok) throw new Error(`WhatsApp gateway failed with ${response.status}`);
    return { status: 'sent' };
  }
};
