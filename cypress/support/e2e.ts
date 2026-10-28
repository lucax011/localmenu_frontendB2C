// Os testes rodam contra a API local de verdade (docker compose do localmenu_backend).
export const API: string = Cypress.env('API') || 'http://localhost:3000';

export const comToken = (token: string) => ({ Authorization: `Bearer ${token}` });
