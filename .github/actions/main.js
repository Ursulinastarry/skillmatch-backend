const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    // 🛠️ Get inputs
    const host = core.getInput('ec2-host', { required: true });
    const username = core.getInput('ec2-username', { required: true });
    const privateKey = core.getInput('private-key', { required: true });
    const distFolder = core.getInput('dist-folder', { required: true });
    const envFile = core.getInput('env-file'); // 👈 Get the .env content

    // 🔐 Save the SSH key
    const keyPath = path.join(__dirname, 'key.pem');
    fs.writeFileSync(keyPath, privateKey);
    fs.chmodSync(keyPath, '600');

    // 📝 Create a temp .env file if it exists
    const tempEnvPath = path.join(__dirname, '.env');
    if (envFile) {
      fs.writeFileSync(tempEnvPath, envFile);
      console.log('✅ .env file created locally.');
    }

    // 📤 Upload the .env file to the EC2 instance (if provided)
    if (envFile) {
      await exec.exec(`scp -i ${keyPath} -o StrictHostKeyChecking=no ${tempEnvPath} ${username}@${host}:~/skillmatch-backend/.env`);
      console.log('📨 .env file sent to EC2.');
    }

    // 🚀 Run remote commands
    const sshCmd = `
ssh -o StrictHostKeyChecking=no -i ${keyPath} ${username}@${host} << 'EOF'
  cd ~/skillmatch-backend
  git pull origin main
 docker compose down
docker compose build --no-cache
docker compose up -d

EOF
`;

    await exec.exec('bash', ['-c', sshCmd]);

    // 🌐 Output the backend URL
    const backendUrl = `http://${host}`;
    core.setOutput('website-url', backendUrl);

  } catch (error) {
  }
}

run();
