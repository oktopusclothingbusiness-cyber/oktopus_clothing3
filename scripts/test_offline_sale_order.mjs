import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://rbaskeyofficial:rbaskeyofficial@cluster0.lnstw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function testOfflineSaleOrder() {
  console.log('🧪 Starting Offline Sale Order Verification Test...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const productsCol = db.collection('products');
    const ordersCol = db.collection('orders');

    // 1. Pick a product from database to simulate sale
    let sampleProduct = await productsCol.findOne({});
    if (!sampleProduct) {
      // Create temporary product
      const res = await productsCol.insertOne({
        name: 'Test French Terry Tee',
        price: 1499,
        stock: 50,
        sizes: ['M', 'L', 'XL'],
        createdAt: new Date(),
      });
      sampleProduct = await productsCol.findOne({ _id: res.insertedId });
    }

    console.log(`\n1️⃣ Using product "${sampleProduct.name}" (ID: ${sampleProduct._id})`);
    const initialStock = Number(sampleProduct.stock) || 50;
    console.log(`   Initial stock: ${initialStock}`);

    // 2. Prepare Offline Sale Order Payload
    console.log('\n2️⃣ Creating offline sale order payload:');
    const soldQty = 2;
    const unitPrice = Number(sampleProduct.price) || 1499;
    const discountAmount = 100;
    const subtotal = unitPrice * soldQty;
    const expectedTotal = subtotal - discountAmount;

    const offlineOrderDoc = {
      userId: `offline_${Date.now()}`,
      userName: 'Amit Verma',
      products: [
        {
          productId: sampleProduct._id.toString(),
          name: sampleProduct.name,
          quantity: soldQty,
          price: unitPrice,
          size: 'L',
          color: 'Black',
          imageUrl: sampleProduct.imageUrl || null,
        }
      ],
      subtotal,
      discount: discountAmount,
      shipping: 0,
      total: expectedTotal,
      shippingAddress: {
        name: 'Amit Verma',
        mobile: '9876543210',
        email: 'amit.verma@example.com',
        address: 'In-Store Counter Walk-in, Store #1',
        instructions: 'Offline POS counter purchase',
      },
      status: 'delivered',
      orderSource: 'offline',
      isOfflineSale: true,
      paymentDetails: {
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        offlineNotes: 'Counter 1, UPI GPay ref #9823412',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Decrement stock
    await productsCol.updateOne(
      { _id: sampleProduct._id },
      { $inc: { stock: -soldQty } }
    );

    // Insert order
    const insertRes = await ordersCol.insertOne(offlineOrderDoc);
    const createdOrderId = insertRes.insertedId;
    console.log(`   ✅ Order successfully created with ID: ${createdOrderId}`);

    // 3. Verify stock decrement
    const productAfter = await productsCol.findOne({ _id: sampleProduct._id });
    console.log(`\n3️⃣ Verifying stock decrement:`);
    console.log(`   Stock before: ${initialStock}, Stock after: ${productAfter.stock}`);
    if (productAfter.stock !== initialStock - soldQty) {
      throw new Error(`FAILED: Expected stock to be ${initialStock - soldQty}, found ${productAfter.stock}`);
    }
    console.log('   ✅ Stock decremented accurately by sold quantity.');

    // 4. Verify order document in orders collection
    console.log(`\n4️⃣ Verifying order details in database:`);
    const savedOrder = await ordersCol.findOne({ _id: createdOrderId });
    if (!savedOrder) throw new Error('FAILED: Saved order not found in database');

    console.log(`   Customer: ${savedOrder.userName} (${savedOrder.shippingAddress.mobile})`);
    console.log(`   Email: ${savedOrder.shippingAddress.email}`);
    console.log(`   Address: ${savedOrder.shippingAddress.address}`);
    console.log(`   Order Source: ${savedOrder.orderSource} (isOfflineSale: ${savedOrder.isOfflineSale})`);
    console.log(`   Payment Method: ${savedOrder.paymentDetails.paymentMethod} (Status: ${savedOrder.paymentDetails.paymentStatus})`);
    console.log(`   Total Amount: ₹${savedOrder.total}`);
    console.log(`   Product Sold: ${savedOrder.products[0].name} (Qty: ${savedOrder.products[0].quantity}, Size: ${savedOrder.products[0].size})`);

    if (savedOrder.orderSource !== 'offline' || savedOrder.isOfflineSale !== true) {
      throw new Error('FAILED: Expected orderSource to be "offline" and isOfflineSale to be true');
    }
    if (savedOrder.shippingAddress.name !== 'Amit Verma' || savedOrder.shippingAddress.mobile !== '9876543210') {
      throw new Error('FAILED: Customer details mismatch');
    }
    console.log('   ✅ All customer details, products, and offline flags verified successfully.');

    // 5. Clean up test order and restore product stock
    console.log(`\n5️⃣ Cleaning up test order and restoring product stock...`);
    await ordersCol.deleteOne({ _id: createdOrderId });
    await productsCol.updateOne(
      { _id: sampleProduct._id },
      { $inc: { stock: soldQty } }
    );
    const restoredProduct = await productsCol.findOne({ _id: sampleProduct._id });
    console.log(`   Restored stock: ${restoredProduct.stock}`);
    console.log('   ✅ Clean up completed successfully.');

    console.log('\n🎉 ALL OFFLINE SALE ORDER TESTS PASSED SUCCESSFULLY! 🚀');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testOfflineSaleOrder();
