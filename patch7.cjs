const fs = require('fs');
const path = 'backend/src/tests/payment.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
`.send({ userId: 'fake-id', amount: 1 });`,
`.send({ customerTaxId: '52998224725' });`
);

code = code.replace(
`expect(mockCreatePixPayment).toHaveBeenCalledWith('user-123');`,
`expect(mockCreatePixPayment).toHaveBeenCalledWith('user-123', '52998224725');`
);

fs.writeFileSync(path, code);
