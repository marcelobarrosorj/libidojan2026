import axios from 'axios';
const payload = { reference_id: "test", customer: { name: "test", email: "test@test.com", tax_id: "00000000000" }, items: [ { reference_id: "test", name: "test", quantity: 1, unit_amount: 1990 } ], qr_codes: [ { amount: { value: 1990 }, expiration_date: new Date(Date.now() + 24*3600*1000).toISOString() } ] };
axios.post('https://api.pagseguro.com/orders', payload, {
  headers: { 'Authorization': 'Bearer dd31b04a-7ed4-49fd-878b-d644a81dbdd01a5493cb4e5f9f21796029fb103072e2da13-172c-4ad9-9cad-e1308eaae2a8', 'Content-Type': 'application/json' }
}).catch(e => {
  console.log(e.response?.status);
  console.log(e.response?.data);
});
