const fs = require('fs');
const path = 'backend/src/controllers/paymentController.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const userId = authUser\.id;\s*const pixData = await createPixPayment\(userId\);/, 
`const userId = authUser.id;
    const { customerTaxId } = req.body;
    const normalizedTaxId = normalizeCPF(customerTaxId);
    if (!normalizedTaxId || !isValidCPF(normalizedTaxId)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    const pixData = await createPixPayment(userId, normalizedTaxId);`);

fs.writeFileSync(path, code);
