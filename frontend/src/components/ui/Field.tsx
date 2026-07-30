import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import styles from './Field.module.css';

/** Campo de formulário: rótulo + controle + (opcional) mensagem de erro/dica. */
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </label>
  );
}

/** Junta a classe base do controle + estado inválido + classes externas. */
const cx = (invalid?: boolean, extra?: string) =>
  [styles.control, invalid && styles.invalid, extra].filter(Boolean).join(' ');

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export function Input({ className, invalid, ...rest }: InputProps) {
  return <input className={cx(invalid, className)} aria-invalid={invalid} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}
export function Select({ className, invalid, ...rest }: SelectProps) {
  return <select className={cx(invalid, className)} aria-invalid={invalid} {...rest} />;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}
export function Textarea({ className, invalid, ...rest }: TextareaProps) {
  return <textarea className={cx(invalid, className)} aria-invalid={invalid} {...rest} />;
}
