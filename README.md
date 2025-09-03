# localmenu-frontend

## Overview
localmenu-frontend is a modular frontend application designed to support multiple client applications, each with its own configuration and components. The project is structured to facilitate code sharing and reuse through a shared components library and hooks.

## Project Structure
```
localmenu-frontend/
├── apps/
│   ├── cliente/          # Client application for individual users
│   ├── business/         # Client application for business users
├── shared/               # Shared components, hooks, themes, and types
├── package.json          # Main npm configuration for the project
├── tsconfig.json         # TypeScript configuration for the project
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd localmenu-frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Running the Applications
To run either the cliente or business applications, navigate to the respective application directory and start the development server.

For the cliente application:
```
cd apps/cliente
npm start
```

For the business application:
```
cd apps/business
npm start
```

### Building the Applications
To build the applications for production, run the following command in the respective application directory:
```
npm run build
```

## Shared Components
The `shared` directory contains reusable components and hooks that can be utilized across different applications. This promotes consistency and reduces code duplication.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.