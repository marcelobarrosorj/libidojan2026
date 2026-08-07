const fs = require('fs');
const file = '/app/applet/backend/src/tests/payment.test.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    it('4. PagBank returns response without QR Code', async () => {`;
const replacement = `    it('PagBank HTTP 400 generates sanitized log without exposing token', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
      const mockError = new Error('Request failed with status code 400') as any;
      mockError.response = {
        status: 400,
        data: {
          error_messages: [
            {
              code: 'INVALID_PARAMETER',
              description: 'must match the regex',
              parameter_name: 'customer.tax_id',
              error: 'BAD_REQUEST'
            }
          ]
        },
        config: {
          headers: {
            Authorization: 'Bearer SENSITIVE_TOKEN_123'
          },
          data: '{"full_payload":"here"}'
        }
      };
      mockCreatePixPayment.mockRejectedValue(mockError);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app)
        .post('/api/payment/create')
        .set('Authorization', 'Bearer valid-token')
        .send();
        
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Erro interno ao criar pagamento' });
      
      expect(consoleSpy).toHaveBeenCalledWith('PAGBANK_REQUEST_ERROR', {
        status: 400,
        errors: [
          {
            code: 'INVALID_PARAMETER',
            error: 'BAD_REQUEST',
            description: 'must match the regex',
            parameter_name: 'customer.tax_id'
          }
        ]
      });
      
      const allCalls = consoleSpy.mock.calls.map(call => JSON.stringify(call)).join(' ');
      expect(allCalls).not.toContain('SENSITIVE_TOKEN_123');
      expect(allCalls).not.toContain('Authorization');
      expect(allCalls).not.toContain('full_payload');
      
      consoleSpy.mockRestore();
    });

    it('4. PagBank returns response without QR Code', async () => {`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('PATCHED TEST');
} else {
  console.log('TARGET NOT FOUND');
}
