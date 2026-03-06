const cloudinary = require('cloudinary').v2;

const baseSecretArr = "5fcpOMSu8n5GlZpVNnqNJPVVFvY".split("");

// positions:
// 4: O or 0
// 6: S or s
// 12: l or I or 1
// 15: V or v
// 16: N or n
// 19: N or n
// 22: V or v
// 23: V or v
// 25: v or V

const options = {
    4: ['O', '0'],
    6: ['S', 's'],
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

async function testAll() {
    let count = 0;
    for (const secret of combinations) {
        count++;
        cloudinary.config({
            cloud_name: 'doye2mt3j',
            api_key: '116242683339867',
            api_secret: secret
        });
        try {
            const res = await cloudinary.api.ping();
            if (res.status === 'ok') {
                console.log('SUCCESS WITH:', secret);
                process.exit(0);
            }
        } catch (err) {
            // failed
        }
        if (count % 50 === 0) console.log(`Tested ${count}`);
    }
    console.log("Failed all");
}

testAll();
