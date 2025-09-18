
# Local Menu B2C

## Descrição
App React Native (Expo + TypeScript) para consumidores, rodando 100% local (sem cloud), com integração ao backend NestJS via Docker e pipeline Jenkins.

## Stack
- React Native (Expo managed workflow, TypeScript)
- Navegação: @react-navigation/native, stack/bottom-tabs
- Estado: Zustand
- Data fetching/cache: React Query
- HTTP: Axios (JWT interceptor)
- UI: React Native Paper (tema claro/escuro), expo/vector-icons
- Geolocalização: expo-location
- Formulários: react-hook-form + zod
- Testes: Jest, React Native Testing Library, Cypress (E2E via Expo Web)
- Lint/format: ESLint, Prettier, Husky, lint-staged
- Integração: Docker, Jenkins

## Estrutura de Pastas
```
src/
  app/           # Rotas e navegadores
  screens/       # Telas principais
  components/    # Componentes reutilizáveis
  store/         # Zustand store
  services/api/  # Axios, React Query, DTOs
  hooks/         # Custom hooks
  theme/         # Tema Paper
  utils/         # Utilitários
  types/         # Tipos globais
  config/        # Configurações
  mocks/         # Dados mockados
  test/          # Testes unitários
  e2e/           # Cypress E2E
```

## Configuração
- `.env` e `.env.example`:
  - `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`
- `app.json`: schemas, permissões, nome, ícones
- `tsconfig.json`, `babel.config.js`, `metro.config.js`

## Docker
- `Dockerfile`: build e dev web
- `docker-compose.yml`: sobe app web e Cypress para E2E

## Jenkins
- `Jenkinsfile`: install, lint, test:unit, test:e2e:web, build:web, docker

## Testes
- Unitários: Jest + Testing Library
- E2E: Cypress (Expo Web)

## Execução Local
```sh
pnpm install
pnpm expo start
```

## Execução Docker (Web + E2E)
```sh
docker-compose up --build
```

## Pipeline Jenkins
- Instala dependências
- Lint
- Testes unitários
- Testes E2E (web)
- Build web
- Build Docker local

## Decisões Técnicas
- Zustand para estado global (leve)
- React Query para cache/fetch
- Expo managed workflow para agilidade
- Cypress para E2E web (POC)
- Sem cloud: tudo local

## Limitações
- E2E apenas via web (Expo Web)
- Backend simulado/local
- Armazenamento de imagens via URLs públicas

## Roadmap
- Melhorar mocks e simulação de backend
- Expandir testes E2E mobile
- Adicionar autenticação social
- Refatorar para micro frontends

## Troubleshooting
- Verifique variáveis `.env`
- Backend deve estar rodando em `http://localhost:3000`
- Use `pnpm` para instalar dependências
- Para mobile, use Expo Go

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.