pipeline {
    agent any

    environment {
        SSH_CREDENTIAL_ID = 'pratham-dev'
    }

    stages {
        stage('SSH Connection') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'PRATHAM_REMOTE_USER_ID', variable: 'REMOTE_USER'),
                        string(credentialsId: 'PRATHAM_REMOTE_HOST_ID', variable: 'REMOTE_HOST')
                    ]) {
                        sshagent([SSH_CREDENTIAL_ID]) {
                            sh '''
                            ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST << 'EOF'
                            echo "Connected to remote server"
                            cd /home/ubuntu/pratham-qa/shiksha/teacher
                            rm -rf pratham2.0
                            git clone https://github.com/tekdi/pratham2.0 -b main-teacher
                            cd /home/ubuntu/pratham-qa/shiksha/teacher/pratham2.0
                            git pull
                            git log -n 3
                            rm -rf .env
                            cp -r ../.env .
                            docker-compose -f docker-compose.teachers.yml down
                            docker system prune -af
                            docker-compose -f docker-compose.teachers.yml up -d --timeout 1200
                            echo '__________________Deployment done______________'
                            exit
EOF
                            '''
                        }
                    }
                }
            }
        }
    }
}
