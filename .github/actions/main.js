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

    // 🔐 Save key to a file
    const keyPath = path.join(__dirname, 'key.pem');
    fs.writeFileSync(keyPath, privateKey);
    fs.chmodSync(keyPath, '600');

    // 📦 Compose the SSH command
    const sshCmd = `
ssh -o StrictHostKeyChecking=no -i ${keyPath} ${username}@${host} << 'EOF'
  cd ~/skillmatch-backend
  git pull origin main
  docker compose down
  docker compose up -d --build
EOF
`;

    // 🧠 Run the SSH command via bash
    await exec.exec('bash', ['-c', sshCmd]);

    // 🌐 Output the URL
    const backendUrl = `http://${host}`;
    core.setOutput('website-url', backendUrl);

  } catch (error) {
    core.setFailed(`Deployment failed 💀: ${error.message}`);
  }
}

run();
