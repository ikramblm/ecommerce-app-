require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const sampleProducts = [
  {
    title_fr: 'Rouge à lèvres mat "Rose Velours"',
    title_en: 'Matte Lipstick "Velvet Rose"',
    title_ar: 'أحمر شفاه مطفي "روز فيلور"',
    description_fr: 'Rouge à lèvres longue tenue, fini mat velouté, formule enrichie en vitamine E.',
    description_en: 'Long-lasting lipstick with a velvety matte finish, enriched with vitamin E.',
    description_ar: 'أحمر شفاه طويل الثبات بلمسة نهائية مطفية مخملية، مدعم بفيتامين E.',
    price: 1800,
    category: 'maquillage',
    image_url: null,
    is_featured: 1,
  },
  {
    title_fr: 'Palette fards à paupières "Sunset Glow"',
    title_en: 'Eyeshadow Palette "Sunset Glow"',
    title_ar: 'باليت ظلال العيون "سانسيت غلو"',
    description_fr: '12 teintes chaudes ultra pigmentées, textures mates et satinées.',
    description_en: '12 highly pigmented warm shades, matte and satin finishes.',
    description_ar: '12 درجة لون دافئة عالية التصبغ، بلمسات مطفية وساتان.',
    price: 3200,
    category: 'maquillage',
    image_url: null,
    is_featured: 1,
  },
  {
    title_fr: 'Fond de teint fluide "Peau Parfaite"',
    title_en: 'Fluid Foundation "Perfect Skin"',
    title_ar: 'كريم أساس سائل "بشرة مثالية"',
    description_fr: 'Couvrance modulable, fini naturel, disponible en plusieurs teintes.',
    description_en: 'Buildable coverage, natural finish, available in several shades.',
    description_ar: 'تغطية قابلة للتعديل، لمسة نهائية طبيعية، متوفر بعدة درجات.',
    price: 2500,
    category: 'maquillage',
    image_url: null,
    is_featured: 0,
  },
  {
    title_fr: 'Crème hydratante visage "Douceur Rose"',
    title_en: 'Face Moisturizing Cream "Rose Softness"',
    title_ar: 'كريم مرطب للوجه "نعومة الورد"',
    description_fr: 'Crème hydratante 24h à l\'eau de rose, pour tous types de peau.',
    description_en: '24h moisturizing cream with rose water, for all skin types.',
    description_ar: 'كريم مرطب لمدة 24 ساعة بماء الورد، لجميع أنواع البشرة.',
    price: 2200,
    category: 'soins',
    image_url: null,
    is_featured: 1,
  },
  {
    title_fr: 'Sérum visage à la vitamine C',
    title_en: 'Vitamin C Face Serum',
    title_ar: 'سيروم للوجه بفيتامين C',
    description_fr: 'Sérum éclat anti-taches, texture légère à absorption rapide.',
    description_en: 'Brightening anti-spot serum, lightweight fast-absorbing texture.',
    description_ar: 'سيروم مضيء مضاد للبقع، بقوام خفيف سريع الامتصاص.',
    price: 2800,
    category: 'soins',
    image_url: null,
    is_featured: 0,
  },
  {
    title_fr: 'Mascara volume "Regard Intense"',
    title_en: 'Volume Mascara "Intense Look"',
    title_ar: 'ماسكارا للحجم "نظرة كثيفة"',
    description_fr: 'Mascara waterproof volumateur, brosse spéciale cils courts.',
    description_en: 'Waterproof volumizing mascara, special brush for short lashes.',
    description_ar: 'ماسكارا مقاومة للماء لتكثيف الرموش، فرشاة خاصة للرموش القصيرة.',
    price: 1500,
    category: 'maquillage',
    image_url: null,
    is_featured: 1,
  },
];

async function seed() {
  const conn = await pool.getConnection();
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@doudisbeauty.dz';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const [existingAdmin] = await conn.query('SELECT id FROM admins WHERE email = ?', [adminEmail]);
    if (existingAdmin.length === 0) {
      await conn.query(
        'INSERT INTO admins (email, password_hash, full_name) VALUES (?, ?, ?)',
        [adminEmail, passwordHash, 'Administrateur Doudis Beauty']
      );
      console.log(`Admin créé: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('Admin déjà existant, ignoré.');
    }

    const [existingProducts] = await conn.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count === 0) {
      for (const p of sampleProducts) {
        await conn.query(
          `INSERT INTO products
            (title_fr, title_en, title_ar, description_fr, description_en, description_ar, price, category, image_url, is_featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.title_fr, p.title_en, p.title_ar, p.description_fr, p.description_en, p.description_ar, p.price, p.category, p.image_url, p.is_featured]
        );
      }
      console.log(`${sampleProducts.length} produits de démonstration insérés.`);
    } else {
      console.log('Produits déjà existants, insertion ignorée.');
    }

    console.log('Seed terminé.');
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Erreur lors du seed:', err);
  process.exit(1);
});
