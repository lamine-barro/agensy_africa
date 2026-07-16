export const products = [
  ['rice', 'Riz local', 'sac de 25 kg', 25, 'kg', 1, 20, 450, 'rice-v1.webp'],
  ['red-palm-oil', 'Huile de palme', 'bidon de 20 L', 20, 'L', 1, 20, 1000, 'red-palm-oil-v1.webp'],
  ['attieke', 'Attiéké', 'sac de 10 kg', 10, 'kg', 1, 20, 350, 'attieke-v1.webp'],
  ['gari', 'Gari', 'sac de 25 kg', 25, 'kg', 1, 10, 600, 'gari-v1.webp'],
  ['cassava-flour', 'Farine de manioc', 'sac de 25 kg', 25, 'kg', 1, 10, 600, 'cassava-flour-v1.webp'],
  ['maize', 'Maïs', 'sac de 50 kg', 50, 'kg', 1, 10, 250, 'maize-v1.webp'],
  ['peanut-paste', "Pâte d'arachide", 'seau de 5 kg', 5, 'kg', 1, 20, 1800, 'peanut-paste-v1.webp'],
  ['peanut-oil', "Huile d'arachide", 'bidon de 5 L', 5, 'L', 1, 20, 1800, 'peanut-oil-v1.webp'],
  ['roasted-peanuts', 'Arachides grillées', 'carton de 5 kg', 5, 'kg', 1, 20, 1800, 'roasted-peanuts-v1.webp'],
  ['cocoa-powder', 'Poudre de cacao', 'sac de 25 kg', 25, 'kg', 1, 10, 5000, 'cocoa-powder-v1.webp'],
  ['honey', 'Miel', 'seau de 5 kg', 5, 'kg', 1, 20, 3500, 'honey-v1.webp'],
  ['dried-coconut', 'Coco sec', 'sac de 25 kg', 25, 'kg', 1, 20, 800, 'dried-coconut-v1.webp'],
  ['dried-mango', 'Mangue séchée', 'carton de 5 kg', 5, 'kg', 1, 20, 5000, 'dried-mango-v1.webp'],
  ['dried-pineapple', 'Ananas séché', 'carton de 5 kg', 5, 'kg', 1, 20, 6000, 'dried-pineapple-v1.webp'],
  ['chili-powder', 'Poudre de piment', 'sac de 5 kg', 5, 'kg', 1, 20, 3500, 'chili-powder-v1.webp'],
  ['dried-hibiscus', 'Bissap / hibiscus séché', 'sac de 25 kg', 25, 'kg', 1, 10, 2500, 'dried-hibiscus-v1.webp'],
  ['dried-ginger', 'Gingembre séché', 'sac de 25 kg', 25, 'kg', 1, 10, 3500, 'dried-ginger-v1.webp'],
  ['cashew-nuts', 'Noix de cajou brutes', 'sac de 25 kg', 25, 'kg', 1, 10, 400, 'cashew-nuts-v1.webp'],
  ['cocoa-beans', 'Fèves de cacao', 'sac de 65 kg', 65, 'kg', 1, 10, 1200, 'cocoa-beans-v1.webp'],
  ['shea-butter', 'Beurre de karité', 'seau de 25 kg', 25, 'kg', 1, 10, 3000, 'shea-butter-v1.webp']
].map(([id, name, unitLabel, unitContent, unit, minQuantity, maxQuantity, unitPrice, image]) => ({
  id, name, unitLabel, unitContent, unit, minQuantity, maxQuantity, unitPrice,
  image: `/assets/${image}`, origin: 'Producteur partenaire Agensy, Côte d’Ivoire',
  regulation: 'Conforme au référentiel applicable en vigueur', monthlyPriceGuaranteed: true
}));
