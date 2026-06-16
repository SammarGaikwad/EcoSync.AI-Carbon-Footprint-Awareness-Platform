import app from './api/parse.js';

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Secure Gemini Proxy Server listening on port ${PORT}`);
  });
}

export default app;
