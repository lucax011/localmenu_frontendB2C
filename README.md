# LocalMenu B2C

App do cliente do LocalMenu, em React Native (Expo) e TypeScript. O cliente escolhe um restaurante, monta o pedido para retirada, paga (pagamento simulado) e acompanha o status até buscar no balcão. Roda 100% local, ligado ao [localmenu_backend](https://github.com/lucax011/localmenu_backend).

## Ecossistema LocalMenu

| Repositório | Papel |
| --- | --- |
| [localmenu_backend](https://github.com/lucax011/localmenu_backend) | API NestJS + PostgreSQL |
| [localmenu_frontendB2C](https://github.com/lucax011/localmenu_frontendB2C) | App do cliente (Expo) |
| [localmenu_frontendB2B](https://github.com/lucax011/localmenu_frontendB2B) | App do restaurante (Expo) |
| [localmenu_OCRservice](https://github.com/lucax011/localmenu_OCRservice) | Microsserviço de OCR em Python (FastAPI) |

## O que o cliente faz

1. Vê a lista de restaurantes, sem precisar de conta, e busca por nome ou endereço.
2. Abre o cardápio (`/r/<slug>` no navegador), filtra por categoria e busca itens; a busca ignora acentos.
3. Monta o carrinho. Um pedido é de um restaurante só; ao trocar de restaurante o app pergunta antes de esvaziar.
4. Entra ou cria a conta. O carrinho fica guardado enquanto isso.
5. Faz o pedido e paga com Pix ou cartão. O pagamento é simulado: nada é cobrado, e a API confirma o pedido.
6. Acompanha o pedido em "Meus pedidos": confirmado, em preparo, pronto para retirada, retirado. A tela atualiza sozinha a cada 5 segundos.

O preço nunca sai do app: o pedido leva só os itens e as quantidades, e a API calcula o total pelo cardápio.

## Stack

- Expo SDK 51 (React Native 0.74, web pelo Metro)
- React Navigation (stack, com endereços próprios na web)
- React Query para dados da API, Zustand para sessão e carrinho (guardados no aparelho)
- React Native Paper, react-hook-form + zod
- Jest, ESLint, Prettier, Husky + lint-staged

Mesma base do app do restaurante ([localmenu_frontendB2B](https://github.com/lucax011/localmenu_frontendB2B)).

## Como rodar

Pré-requisito: a API rodando em `http://localhost:3000` (veja o README do backend; `docker compose up` lá sobe banco, OCR e API com dados de exemplo).

```sh
npm install
npm run web        # abre em http://localhost:8082
```

A porta 8082 já está liberada no CORS da API (`CORS_ORIGINS` no `.env` do backend). Para apontar para outra API, copie `.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_BASE_URL`.

Conta de exemplo: `cliente@localmenu.dev` / `localmenu123`. Também dá para criar uma conta nova pelo app.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run web` | Expo Web na porta 8082 |
| `npm test` | Testes unitários (carrinho, busca, horários, etapas do pedido) |
| `npm run typecheck` | Checagem de tipos |
| `npm run lint` | ESLint + Prettier |
| `npm run build:web` | Gera o site estático em `dist/` |

## Estrutura

```
App.tsx                 navegação e endereços da web
src/
  api/                  cliente da API (token com renovação automática) e tipos
  store/                sessão e carrinho
  features/
    restaurants/        lista e cardápio
    cart/               carrinho
    auth/               entrar ou criar conta
    orders/             pagamento, meus pedidos e acompanhamento
  components/ui.tsx     peças visuais comuns
  utils/                carrinho, formatos e validação
  __tests__/            testes unitários
```

## Licença

MIT. Veja [LICENSE](LICENSE).
