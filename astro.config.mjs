import { defineConfig } from 'astro/config';

// Site estático (pasta dist/). Endereços com barra no fim, como no WordPress, para o Google não ver página nova.
export default defineConfig({
  site: 'https://www.aldriguescandido.adv.br',
  trailingSlash: 'always',
  // a pasta fica no OneDrive, onde o aviso de "arquivo mudou" falha: o npm run dev passa a conferir os arquivos de tempos em tempos
  vite: { server: { watch: { usePolling: true, interval: 300 } } },
  devToolbar: { enabled: false }, // a barra do npm run dev só confundia (visitantes nunca a veem)
});
