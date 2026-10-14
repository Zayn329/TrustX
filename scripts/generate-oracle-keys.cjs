const crypto = require('node:crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicKeySpkiBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

console.log('Copy the following values into server-only and Vite environment configuration:');
console.log('\nORACLE_SIGNING_PRIVATE_KEY_PEM<<PEM');
console.log(privateKeyPem.trim());
console.log('PEM');
console.log(`\nVITE_ORACLE_SIGNING_PUBLIC_KEY=${publicKeySpkiBase64}`);
console.log('\nKeep the private key out of source control and deployment logs.');
