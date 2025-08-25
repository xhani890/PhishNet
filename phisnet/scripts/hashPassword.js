// Generate a scrypt hash compatible with server/auth.ts
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const buf = crypto.scryptSync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

const [, , pwd] = process.argv;
if (!pwd) {
  console.error('Usage: node scripts/hashPassword.js <password>');
  process.exit(2);
}

console.log(hashPassword(pwd));
