module.exports = async function handler(req, res) {
  return res.status(200).json({ ok: true, formato: 'cjs', node: process.version });
};