const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');

async function run() {
  try {
    // 🔧 Get inputs
    const host = core.getInput('ec2-host', { required: true });
    const username = core.getInput('ec2-username', { required: true });
    const privateKey = core.getInput('private-key', { required: true });
    const distFolder = core.getInput('dist-folder', { required: true });

    // 💾 Save the PEM key to a temp file
    const keyPath = `${__dirname}/key.pem`;
    fs.writeFileSync(keyPath, privateKey);
    fs.chmodSync(keyPath, '600');

    // 🛜 Run deployment commands over SSH
    const sshCommand = `
      ssh -o StrictHostKeyChecking=no -i ${keyPath} ${username}@${host} << 'EOF'
        cd ~/skillmatch-backend
        git pull origin main
        docker compose down
        docker compose up -d --build
      EOF
    `;

    await exec.exec(sshCommand);

    // 🌐 Set output
    const backendUrl = `http://${host}`;
    core.setOutput('website-url', backendUrl);
  } catch (error) {
    core.setFailed(`Deployment failed 💀: ${error.message}`);
  }
}

run();
