
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
npm install --legacy-peer-deps
npm start
# or
npx expo start
```

Para desenvolvimento web:
```sh
npx expo start --web
```

## API Backend Endpoints

Este app consome os seguintes endpoints públicos do backend:

### GET /public/restaurants
Retorna lista de restaurantes com menus publicados.

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Restaurant Name",
    "slug": "restaurant-slug",
    "menuId": 1
  }
]
```

### GET /public/r/:slug
Retorna detalhes do restaurante e seu menu completo.

**Parâmetros:**
- `slug`: slug único do restaurante

**Resposta:**
```json
{
  "restaurant": {
    "id": 1,
    "name": "Restaurant Name"
  },
  "menu": {
    "id": 1,
    "name": "Menu Name",
    "categories": [
      {
        "id": 1,
        "name": "Category Name",
        "order": 1,
        "items": [
          {
            "id": 1,
            "name": "Item Name",
            "price": 12.99,
            "description": "Item description",
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

## Funcionalidades B2C MVP

### Tela Home
- Lista todos os restaurantes disponíveis
- Cada restaurante é clicável e navega para a página do menu
- Exibe mensagem de carregamento durante fetch
- Trata erros de conexão com botão de retry

### Tela de Menu do Restaurante
- Exibe nome do restaurante e nome do menu
- Mostra categorias organizadas com seus itens
- Busca em tempo real: filtra itens por nome (case-insensitive)
- Indica itens indisponíveis
- Exibe preço e descrição de cada item

### Busca de Itens
- Input de busca no topo da tela de menu
- Filtragem client-side em memória
- Case-insensitive
- Filtra através de todas as categorias simultaneamente

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
- Verifique variáveis `.env` - certifique-se que `EXPO_PUBLIC_API_BASE_URL` está configurado
- Backend deve estar rodando em `http://localhost:3000` (ou a URL configurada no .env)
- Use `npm install --legacy-peer-deps` para instalar dependências devido a conflitos de peer dependencies
- Para mobile, use Expo Go app
- Se tiver problemas com cache, use `npx expo start --clear`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.