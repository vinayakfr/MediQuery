// Builds both images, pushes them to the private registry on this Jenkins
// server, and rolls them out to the k3s cluster
pipeline {
    agent any

    environment {
        // Same registry under two names: Jenkins pushes locally, k3s pulls over the private network
        PUSH_REGISTRY = 'localhost:5000'
        PULL_REGISTRY = '10.20.1.185:5000'
        TAG           = "${env.BUILD_NUMBER}"
        // Inlined into the frontend bundle at build time (see frontend/Dockerfile)
        API_URL       = 'http://13.127.1.87:8000'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Build images') {
            parallel {
                stage('Backend') {
                    steps {
                        sh 'docker build -t $PUSH_REGISTRY/mediquery-backend:$TAG backend'
                    }
                }
                stage('Frontend') {
                    steps {
                        sh 'docker build --build-arg NEXT_PUBLIC_API_URL=$API_URL -t $PUSH_REGISTRY/mediquery-frontend:$TAG frontend'
                    }
                }
            }
        }

        stage('Push images') {
            steps {
                sh '''
                    docker push $PUSH_REGISTRY/mediquery-backend:$TAG
                    docker push $PUSH_REGISTRY/mediquery-frontend:$TAG
                '''
            }
        }

        stage('Deploy to k3s') {
            steps {
                sh '''
                    kubectl apply -f k8s/namespace.yaml
                    kubectl apply -f k8s/
                    kubectl -n mediquery set image deployment/backend backend=$PULL_REGISTRY/mediquery-backend:$TAG
                    kubectl -n mediquery set image deployment/frontend frontend=$PULL_REGISTRY/mediquery-frontend:$TAG
                    kubectl -n mediquery rollout status deployment/frontend --timeout=5m
                    kubectl -n mediquery rollout status deployment/backend --timeout=15m
                '''
            }
        }
    }

    post {
        always {
            // Old build layers fill the 40 GB disk quickly
            sh 'docker image prune -f || true'
        }
    }
}
