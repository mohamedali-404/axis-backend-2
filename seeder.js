const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Settings = require('./src/models/Settings');

dotenv.config({ override: true });

mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        await Settings.deleteMany();

        const createdUser = await User.create({ username: 'admin', password: 'password123' });

        const products = [
            {
                name: 'AXIS Core Training Tee',
                descriptionEn: 'Engineered for peak performance, this minimal training tee offers breathability and freedom of movement.',
                descriptionAr: 'مصمم لتحقيق أعلى أداء، هذا التيشيرت التدريبي يوفر التهوية وحرية الحركة.',
                price: 25.00,
                discountPrice: 20.00,
                stock: 50,
                images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
                sizes: ['S', 'M', 'L', 'XL'],
                sleeveType: 'Short',
                status: 'active'
            },
            {
                name: 'AXIS Long Sleeve Shield',
                descriptionEn: 'Stay warm and focused with the Shield long sleeve, perfect for outdoor sessions and warmups.',
                descriptionAr: 'حافظ على دفئك وتركيزك مع تيشيرت درع ذو الأكمام الطويلة، مثالي للتدريبات الخارجية.',
                price: 35.00,
                stock: 30,
                images: ['https://images.unsplash.com/photo-1618354691438-25af047511cc?auto=format&fit=crop&q=80&w=800'],
                sizes: ['M', 'L', 'XL'],
                sleeveType: 'Long',
                status: 'active'
            },
            {
                name: 'AXIS Essential Gym Tee',
                descriptionEn: 'The must-have tee for your daily grind. Comfort and style merged perfectly.',
                descriptionAr: 'التيشيرت الأساسي لتدريبك اليومي. راحة وأناقة لا مثيل لها.',
                price: 22.00,
                stock: 0,
                images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'],
                sizes: ['S', 'M', 'L'],
                sleeveType: 'Short',
                status: 'active'
            }
        ];

        await Product.insertMany(products);

        await Settings.create({
            heroHeadline: 'Train Hard. Look Sharp.',
            subHeadline: 'Minimal design. Maximum performance.',
            shippingRates: [{ city: 'Cairo', cost: 50 }, { city: 'Alexandria', cost: 60 }]
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
