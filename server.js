import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Oktopus Mobile Backend Express server running on port ${PORT}`);
  console.log(`🛡️ Mobile Security & Exclusive Routes active under namespace /api/v1/mobile/`);
});
