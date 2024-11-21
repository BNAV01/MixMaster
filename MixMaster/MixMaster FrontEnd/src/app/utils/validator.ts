// src/app/utils/validator.ts

export function validarRut(rut: string): boolean {
  rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length < 8 || rut.length > 9) return false;

  const cuerpo = rut.slice(0, -1);
  const digitoVerificador = rut.slice(-1).toUpperCase();
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const digitoEsperado = 11 - resto === 11 ? '0' : 11 - resto === 10 ? 'K' : (11 - resto).toString();
  return digitoVerificador === digitoEsperado;
}
