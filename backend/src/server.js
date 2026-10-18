import { startServer } from './start.js';

startServer().catch((err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Le port ${err.port} est déjà utilisé (l'app Atelier_Ciné ou un autre "npm run dev" tourne peut-être déjà).`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
