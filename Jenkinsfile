pipeline {
  agent any
  environment {
    API_BASE_URL = "http://localhost:3000"
  }
  stages {
    stage('Install') {
      steps {
        sh 'pnpm install'
      }
    }
    stage('Lint') {
      steps {
        sh 'pnpm lint'
      }
    }
    stage('Test:Unit') {
      steps {
        sh 'pnpm test'
      }
    }
    stage('Test:E2E:Web') {
      steps {
        sh 'docker-compose run cypress'
      }
    }
    stage('Build:Web') {
      steps {
        sh 'pnpm expo export:web'
      }
    }
    stage('Docker') {
      steps {
        sh 'docker build -t localmenu-web:latest .'
      }
    }
  }
}
