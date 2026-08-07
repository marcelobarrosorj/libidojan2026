const fs = require('fs');
const path = 'backend/src/tests/payment.test.ts';
let code = fs.readFileSync(path, 'utf8');

// The tests use `.send()` without body for /api/payment/create. I need to replace `.send()` with `.send({ customerTaxId: '52998224725' })` for these tests.
// Let's replace instances of `.post('/api/payment/create')\n        .set('Authorization', 'Bearer valid-token')\n        .send();`
// And add tests for CPF.

// Let's just do a regex replace to add the body to existing createPixPayment calls
code = code.replace(/(\.post\('\/api\/payment\/create'\)\s*\n\s*\.set\('Authorization', 'Bearer valid-token'\)\s*\n\s*\.send\()(\);)/g, "$1{ customerTaxId: '52998224725' }$2");

// Now append new tests at the end of the `POST /api/payment/create` describe block.
// We can inject it right before `describe('POST /api/webhook/pagbank'`
const cpfTests = `
    it('Fails if no CPF is provided', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({});
        
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('CPF inválido');
    });

    it('Fails if invalid CPF is provided', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '11111111111' });
        
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('CPF inválido');
    });
    
    it('Creates payment if valid CPF is provided', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const mockedPixData = { paymentId: 'pag-123', amount: 19.90 };
      mockCreatePixPayment.mockResolvedValue(mockedPixData);
      mockInsert.mockResolvedValue({ error: null });
      
      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send({ customerTaxId: '52998224725' });
        
      expect(res.status).toBe(200);
    });
`;

code = code.replace(/(\s*)(describe\('POST \/api\/webhook\/pagbank', \(\) => {)/, "$1" + cpfTests + "$1$2");

fs.writeFileSync(path, code);
