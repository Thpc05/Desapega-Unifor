/**
 * Validação de formulário com FUNÇÕES PURAS.
 *
 * Cada validador recebe um valor e devolve `undefined` (ok) ou uma string (o erro).
 * Sem efeito colateral, sem estado — fáceis de testar e reusar em qualquer form.
 * Espelham as regras que o backend (Zod) já exige, pra dar feedback antes de enviar.
 */

export type FieldError = string | undefined;

/** Roda vários validadores em ordem e retorna o PRIMEIRO erro (ou undefined). */
export function firstError(value: string, ...validators: ((v: string) => FieldError)[]): FieldError {
  for (const validate of validators) {
    const err = validate(value);
    if (err) return err;
  }
  return undefined;
}

/** Campo obrigatório (não vazio depois de tirar espaços). */
export const required =
  (msg = 'Campo obrigatório') =>
  (v: string): FieldError =>
    v.trim() === '' ? msg : undefined;

/** Tamanho mínimo. */
export const minLen =
  (n: number, msg?: string) =>
  (v: string): FieldError =>
    v.trim().length < n ? (msg ?? `Mínimo de ${n} caracteres`) : undefined;

/** Só dígitos com tamanho exato (matrícula da Unifor = 7 dígitos). */
export const matricula = (v: string): FieldError =>
  /^\d{7}$/.test(v.trim()) ? undefined : 'Matrícula deve ter 7 dígitos';

/** E-mail em formato válido (checagem simples, o backend confirma de novo). */
export const email = (v: string): FieldError =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : 'E-mail inválido';

/** Número dentro de um intervalo (ex.: semestre 0–10, preço > 0). */
export const numberInRange =
  (min: number, max: number, msg?: string) =>
  (v: string): FieldError => {
    const n = Number(v);
    if (v.trim() === '' || Number.isNaN(n)) return msg ?? 'Informe um número';
    if (n < min || n > max) return msg ?? `Valor entre ${min} e ${max}`;
    return undefined;
  };

/** Preço de venda: obrigatório e maior que zero. */
export const price = (v: string): FieldError => {
  const n = Number(v);
  if (v.trim() === '') return 'Informe o preço em esmeraldas';
  if (Number.isNaN(n) || n <= 0) return 'Preço deve ser maior que zero';
  return undefined;
};

/**
 * Valida um objeto inteiro a partir de um mapa {campo: validador}.
 * Devolve { errors, ok } — `ok` é true quando não há nenhum erro.
 */
export function validateForm<T extends Record<string, string>>(
  values: T,
  rules: Partial<Record<keyof T, (v: string) => FieldError>>,
): { errors: Partial<Record<keyof T, string>>; ok: boolean } {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key in rules) {
    const validate = rules[key];
    if (!validate) continue;
    const err = validate(values[key] ?? '');
    if (err) errors[key] = err;
  }
  return { errors, ok: Object.keys(errors).length === 0 };
}
