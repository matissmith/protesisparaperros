export const PRODUCT_CATALOG = Object.freeze({
  walk: { name: 'Arnés de caminata asistida', priceMin: 55000, priceMax: 55000, reservationAmount: 27500 },
  lift: { name: 'Eslinga de elevación de cuerpo', priceMin: 95000, priceMax: 95000, reservationAmount: 47500 },
  ivdd: { name: 'Faja de soporte IVDD', priceMin: 125000, priceMax: 125000, reservationAmount: 62500 },
  wheelchair: { name: 'Silla de ruedas', priceMin: 308000, priceMax: 308000, reservationAmount: 77000 },
  cart: { name: 'Carro ortopédico', priceMin: 462000, priceMax: 462000, reservationAmount: 115500 },
  orthosis: { name: 'Órtesis tipo bota Walker', priceMin: 600000, priceMax: 1000000, reservationAmount: 150000 },
  prosthesis: { name: 'Prótesis personalizada', priceMin: 1500000, priceMax: 2500000, reservationAmount: 225000 }
});

export function getProduct(productId) {
  return PRODUCT_CATALOG[productId] || null;
}

export function followUpFor(productId) {
  return ['orthosis', 'prosthesis'].includes(productId) ? 'clinical_15m' : 'ops_measurements';
}
