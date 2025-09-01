import axios from 'axios';

export async function solveCaptcha(imageBase64: string) {
  const provider = process.env.CAPTCHA_PROVIDER;
  const key = process.env.CAPTCHA_API_KEY;
  if (!provider || !key) return { solved: false };
  if (provider === '2captcha') {
    // Minimal 2captcha example (image captcha). For reCAPTCHA/HCaptcha, integrate sitekey/URL flow.
    const form = new URLSearchParams({ method: 'base64', body: imageBase64, key });
    const submit = await axios.post('http://2captcha.com/in.php', form);
    const id = submit.data.split('|')[1];
    for (;;) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await axios.get(`http://2captcha.com/res.php?key=${key}&action=get&id=${id}`);
      if (res.data === 'CAPCHA_NOT_READY') continue;
      if (res.data.startsWith('OK|')) return { solved: true, code: res.data.split('|')[1] } as any;
      throw new Error('Captcha solver error: ' + res.data);
    }
  }
  return { solved: false };
}
