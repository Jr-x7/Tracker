const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.resolve(__dirname, '../../FRONTEND');
const BACKEND_DIR = path.resolve(__dirname, '../../backend');
const PUBLIC_DIR = path.join(BACKEND_DIR, 'public');

console.log('🚀 Starting Deployment Build Process...');

try {
    // 1. Install Dependencies & Build Frontend
    console.log('\n📦 Installing Frontend Dependencies & Building...');
    execSync('npm install --include=dev', { cwd: FRONTEND_DIR, stdio: 'inherit' }); // Ensure devDependencies (vite) are installed
    execSync('npm run build', { cwd: FRONTEND_DIR, stdio: 'inherit' });

    // 2. Prepare Public Directory
    console.log('\n🧹 Cleaning Backend Public Directory...');
    if (fs.existsSync(PUBLIC_DIR)) {
        fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(PUBLIC_DIR);

    // 3. Copy Build Files
    console.log('\n📂 Copying Frontend Build to Backend...');
    const distDir = path.join(FRONTEND_DIR, 'dist');
    
    if (!fs.existsSync(distDir)) {
        throw new Error('Frontend build directory (dist) not found! Build failed?');
    }

    fs.cpSync(distDir, PUBLIC_DIR, { recursive: true });

    console.log(`\n✅ Build Complete! Frontend deployed to: ${PUBLIC_DIR}`);
    console.log('👉 You can now zip the "backend" folder and deploy to Azure.');

} catch (error) {
    console.error('\n❌ Deployment Script Failed:', error.message);
    process.exit(1);
}
