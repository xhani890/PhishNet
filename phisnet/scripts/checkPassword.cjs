// Simple scrypt password check matching server/auth.ts logic
const crypto = require('crypto');

function comparePasswords(supplied, stored) {
  if (!stored || !stored.includes('.')) return false;
  const [hashed, salt] = stored.split('.');
  const suppliedBuf = crypto.scryptSync(supplied, salt, 64);
  return suppliedBuf.toString('hex') === hashed;
}

const [, , supplied, stored] = process.argv;
if (!supplied || !stored) {
  console.error('Usage: node scripts/checkPassword.js <password> <storedHash>');
  process.exit(2);
}

const match = comparePasswords(supplied, stored);
console.log(match ? 'MATCH' : 'NO MATCH');
