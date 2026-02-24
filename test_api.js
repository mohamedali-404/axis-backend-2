const http = require('http');

async function runTest(name, url, method = 'GET', body = null) {
    const start = Date.now();
    try {
        const response = await fetch(`http://localhost:5001${url}`, {
            method,
            headers: Object.assign({ 'Accept': 'application/json' }, body ? { 'Content-Type': 'application/json' } : {}),
            body: body ? JSON.stringify(body) : undefined
        });
        const duration = Date.now() - start;
        const status = response.status;

        let data = await response.text();
        try {
            data = JSON.parse(data);
        } catch (e) { }

        const isSlow = duration > 500;
        const prefix = isSlow ? '[SLOW]' : '[FAST]';
        const statusPrefix = status >= 400 && status !== 404 && status !== 400 && status !== 401 ? `[ERROR ${status}]` : `[${status}]`;

        if (status === 500) {
            console.error(`❌ [FAIL] 500 Server Error - ${method} ${url} - ${duration}ms\nResponse:`, data);
        } else if (name.includes('Invalid') && status === 200) {
            console.error(`❌ [FAIL] Expected Error but got 200 - ${method} ${url}`);
        } else if (!name.includes('Invalid') && status >= 400 && status !== 404 && status !== 401 && status !== 400) {
            console.error(`❌ [FAIL] Unexpected Error - ${method} ${url} - Status ${status}\nResponse:`, data);
        } else if (isSlow) {
            console.warn(`⚠️ ${prefix} ${statusPrefix} ${method} ${url} - ${duration}ms - ${name}`);
        } else {
            console.log(`✅ ${prefix} ${statusPrefix} ${method} ${url} - ${duration}ms - ${name}`);
        }

        return { status, data, duration };
    } catch (err) {
        const duration = Date.now() - start;
        console.error(`❌ [FATAL] ${method} ${url} - ${duration}ms - ${name} : ${err.message}`);
        return { status: 500, error: err.message, duration };
    }
}

async function main() {
    console.log("Starting Comprehensive API Tests...\n");

    // 1. Products API
    await runTest('Get All Products', '/api/products');
    await runTest('Get Best Sellers', '/api/products/best-sellers');
    await runTest('Get Categories', '/api/products/categories');

    // Testing specific Product edge cases (Edge Case / MongoDB Queries)
    await runTest('Get Product By Invalid Mongo ID format', '/api/products/123456');
    await runTest('Get Product By Valid but Non-Existent Mongo ID', '/api/products/5f8d04f3b54764421b7156d9');
    await runTest('Create Product (No Auth)', '/api/products', 'POST', { name: "Test Product" });

    // 2. Orders API
    await runTest('Get All Orders (No Auth)', '/api/orders');
    await runTest('Get Order By Invalid ID format', '/api/orders/whateverid');
    await runTest('Track Order Empty ID', '/api/orders/track/'); // Assuming this is valid route prefix
    await runTest('Track Order Invalid Format ID', '/api/orders/track/123'); // Should be properly handled (404/400)
    await runTest('Create Order Without Items', '/api/orders', 'POST', { orderItems: [] });
    // This payload missing critical info which should ideally be a 400 Bad Request, not 500:
    await runTest('Create Order Missing Data', '/api/orders', 'POST', {
        orderItems: [{ product: "5f8d04f3b54764421b7156d9", qty: 2 }]
    });

    // 3. Settings API
    await runTest('Get Settings', '/api/settings');

    // 4. Coupons API
    await runTest('Validate Coupon (Missing info)', '/api/coupons/validate', 'POST', {});
    await runTest('Validate Coupon (Invalid Code)', '/api/coupons/validate', 'POST', { code: 'INVALID', totalAmount: 100 });

    // 5. Auth API
    await runTest('Login with bad credentials', '/api/auth/login', 'POST', { email: 'test@invalid.domain', password: 'wrong' });
    await runTest('Register missing data', '/api/auth/register', 'POST', {});

    console.log("\nAPI Tests Completed.");
}

main();
