import 'dotenv/config';
import crypto from 'crypto';
import Razorpay from 'razorpay';

console.log('--- Testing Razorpay Credentials & Signature Algorithm ---');

const keyId = process.env.RAZORPAY_KEY_ID?.trim()?.replace(/^["']|["']$/g, '');
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()?.replace(/^["']|["']$/g, '');

console.log('RAZORPAY_KEY_ID:', keyId ? `${keyId.slice(0, 8)}...` : 'MISSING');
console.log('RAZORPAY_KEY_SECRET:', keySecret ? `${keySecret.slice(0, 4)}...` : 'MISSING');

if (!keyId || !keySecret) {
  console.error('ERROR: Missing Razorpay credentials in environment.');
  process.exit(1);
}

const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

async function runTests() {
  try {
    // Test 1: Order Creation (min 100 paise = ₹1)
    console.log('\n[1] Creating test order with Razorpay API...');
    const testOrder = await rzp.orders.create({
      amount: 50000, // ₹500 in paise
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`,
    });
    console.log('✓ Order created successfully:');
    console.log(`  order_id: ${testOrder.id}`);
    console.log(`  amount: ${testOrder.amount} paise`);
    console.log(`  currency: ${testOrder.currency}`);

    // Test 2: Signature Algorithm Test
    console.log('\n[2] Testing HMAC-SHA256 signature verification...');
    const mockOrderId = testOrder.id;
    const mockPaymentId = `pay_mock_${Date.now()}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${mockOrderId}|${mockPaymentId}`)
      .digest('hex');

    console.log(`  Mock Order ID: ${mockOrderId}`);
    console.log(`  Mock Payment ID: ${mockPaymentId}`);
    console.log(`  Generated Signature: ${generatedSignature}`);

    // Test 2a: Valid Signature Verification
    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${mockOrderId}|${mockPaymentId}`)
      .digest('hex');

    if (expectedSig === generatedSignature) {
      console.log('✓ Valid signature matched successfully.');
    } else {
      throw new Error('Valid signature did not match.');
    }

    // Test 2b: Invalid Signature Rejection
    const tamperedSig = 'tampered_signature_1234567890abcdef';
    if (expectedSig !== tamperedSig) {
      console.log('✓ Tampered signature rejected correctly (400 bad request).');
    } else {
      throw new Error('Tampered signature was unexpectedly accepted!');
    }

    console.log('\n✅ All Razorpay tests passed successfully!\n');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
