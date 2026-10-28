import fs from 'fs';
import path from 'path';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8082',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 430,
    viewportHeight: 900,
    defaultCommandTimeout: 15000,
    video: false,
    setupNodeEvents(on) {
      // npm run capturas: as capturas vão direto para docs/capturas (as do README)
      on('after:screenshot', (details) => {
        if (details.specName !== 'telas.cy.ts') return;
        const dest = path.join('docs', 'capturas', path.basename(details.path));
        fs.renameSync(details.path, dest);
        return { path: dest };
      });
    },
  },
});
