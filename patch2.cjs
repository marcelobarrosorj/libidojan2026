const fs = require('fs');
const path = 'backend/src/controllers/paymentController.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
`import { Request, Response } from 'express';
import { createPixPayment, verifyPayment } from '../services/pagbank.js';
import crypto from 'crypto';`,
`import { Request, Response } from 'express';
import { createPixPayment, verifyPayment } from '../services/pagbank.js';
import crypto from 'crypto';
import { isValidCPF, normalizeCPF } from '../utils/cpf.js';`
);

code = code.replace(
`    const userId = authUser.id;
    const pixData = await createPixPayment(userId);`,
`    const userId = authUser.id;
    const { customerTaxId } = req.body;
    const normalizedTaxId = normalizeCPF(customerTaxId);
    if (!normalizedTaxId || !isValidCPF(normalizedTaxId)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    const pixData = await createPixPayment(userId, normalizedTaxId);`
);
fs.writeFileSync(path, code);
