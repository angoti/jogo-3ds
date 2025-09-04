// =============================
// src/utils/normalizar.js
// =============================

export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .replace(/ç/gi, 'c')
    .toLowerCase()
    .trim();
}

export function alfanumericoBasico(texto) {
  return normalizar(texto).replace(/[^a-z0-9]/g, '');
}
