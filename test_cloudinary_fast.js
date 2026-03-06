const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const baseSecretArr = "5fcpOMSu8n5GlZpVNnqNJPVVFvY".split("");

const options = {
    4: ['O', '0'],
    6: ['S', 's', '5'],
    11: ['G', '6'],
    12: ['l', 'I', '1'],
    15: ['V', 'v'],
    16: ['N', 'n'],
    19: ['N', 'n'],
    22: ['V', 'v'],
    23: ['V', 'v'],
    25: ['v', 'V']
};

let combinations = [''];

for (let i = 0; i < baseSecretArr.length; i++) {
    const newCombs = [];
    if (options[i]) {
        for (const comb of combinations) {
            for (const opt of options[i]) {
                newCombs.push(comb + opt);
            }
        }
        combinations = newCombs;
    } else {
        for (const comb of combinations) {
            newCombs.push(comb + baseSecretArr[i]);
        }
        combinations = newCombs;
    }
}

console.log("Testing " + combinations.length + " combinations...");

async function checkOne(secret) {
    return new Promise((resolve) => {
        cloudinary.config({
            cloud_name: 'doye2mt3j',
            api_key: '116242683339867',
            api_secret: secret
        });
        cloudinary.api.ping()
            .then(res => {
                if (res.status === 'ok') resolve(secret);
                else resolve(null);
            })
            .catch(() => resolve(null));
    });
}

async function testAll() {
    let count = 0;
    const batchSize = 100;
    for (let i = 0; i < combinations.length; i += batchSize) {
        const batch = combinations.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(secret => checkOne(secret)));
        const found = results.find(r => r !== null);
        if (found) {
            console.log("SUCCESS WITH FAST:", found);
            fs.writeFileSync('fast_success.txt', found);
            process.exit(0);
        }
        count += batch.length;
        console.log(`Tested ${count} / ${combinations.length}`);
    }
    console.log("Failed all in fast test");
}

testAll();
