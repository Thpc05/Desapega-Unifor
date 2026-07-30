import { useState, type ChangeEvent } from 'react';
import { validateForm, type FieldError } from '../utils/validation';

type Validator = (v: string) => FieldError;
type Rules<T> = Partial<Record<keyof T, Validator>>;
/** As regras podem depender dos valores atuais (ex.: preço só se for venda). */
type RulesArg<T> = Rules<T> | ((values: T) => Rules<T>);

/**
 * Hook genérico de formulário (reuso em Login/Cadastro/Anunciar).
 * Guarda valores + erros, liga os inputs (`bind`) e valida sob demanda.
 */
export function useForm<T extends Record<string, string>>(initial: T, rules: RulesArg<T>) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  function setField(key: keyof T, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    // some com o erro do campo assim que o usuário corrige
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  /** Props prontas pra um <Input>/<Select>/<Textarea>. */
  function bind(key: keyof T) {
    return {
      value: values[key],
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setField(key, e.target.value),
      invalid: Boolean(errors[key]),
    };
  }

  /** Valida tudo; preenche os erros e retorna true se estiver ok. */
  function validate(): boolean {
    const resolved = typeof rules === 'function' ? rules(values) : rules;
    const { errors: errs, ok } = validateForm(values, resolved);
    setErrors(errs);
    return ok;
  }

  return { values, errors, setField, bind, validate };
}
