const fs = require('fs');
const path = 'backend/src/controllers/paymentController.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
`    return res.status(200).json({
      paymentId,
      status: tx.status,
      isPremium: tx.status === 'PAID',
      expirationDate: null
    });`,
`    let finalStatus = tx.status;

    // Check with PagBank directly if still waiting in our DB
    if (finalStatus === 'WAITING') {
      const orderData = await verifyPayment(paymentId);
      if (orderData) {
        const pagbankStatus = orderData.charges?.[0]?.status || orderData.status;
        if (pagbankStatus === 'PAID') {
          finalStatus = 'PAID';
          const amountPaid = orderData.charges?.[0]?.amount?.value ? orderData.charges[0].amount.value / 100 : 19.90;
          
          await supabase.rpc('process_payment', {
            p_user_id: userId,
            p_payment_id: paymentId,
            p_provider: 'pagbank',
            p_status: 'PAID',
            p_amount: amountPaid
          });
        }
      }
    }

    return res.status(200).json({
      paymentId,
      status: finalStatus,
      isPremium: finalStatus === 'PAID',
      expirationDate: null
    });`
);
fs.writeFileSync(path, code);
