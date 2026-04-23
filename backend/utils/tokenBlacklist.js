// In-memory токен blacklist (production-д Redis ашиглана)
const blacklist = new Set();

const addToBlacklist = (token) => blacklist.add(token);
const isBlacklisted = (token) => blacklist.has(token);

module.exports = { addToBlacklist, isBlacklisted };
