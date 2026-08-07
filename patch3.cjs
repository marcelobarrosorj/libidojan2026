const fs = require('fs');
const path = 'backend/src/services/pagbank.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
`export const createPixPayment = async (userId: string) => {`,
`export const createPixPayment = async (userId: string, customerTaxId: string) => {`
);

code = code.replace(
`      tax_id: resolvePagBankCustomerTaxId(config.PAGBANK_API_URL, undefined) // TODO: collect real CPF from user in production`,
`      tax_id: resolvePagBankCustomerTaxId(config.PAGBANK_API_URL, customerTaxId)`
);

fs.writeFileSync(path, code);
