import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { matricula, minLen } from '../utils/validation';
import styles from './Auth.module.css';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm(
    { matricula: '', password: '' },
    { matricula, password: minLen(6, 'A senha tem no mínimo 6 caracteres') },
  );

  // pra onde voltar depois de logar (se veio de uma rota protegida)
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!form.validate()) return;
    setSubmitting(true);
    try {
      await login(form.values.matricula, form.values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <Panel elevated className={styles.card}>
        <div className={styles.head}>
          <img className={styles.logo} src="/emerald.png" alt="" />
          <h1>Entrar</h1>
          <span className={styles.sub}>Use sua matrícula e senha da Unifor.</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field label="Matrícula" error={form.errors.matricula}>
            <Input placeholder="Ex.: 2312345" inputMode="numeric" {...form.bind('matricula')} />
          </Field>
          <Field label="Senha" error={form.errors.password}>
            <Input type="password" placeholder="••••••••" {...form.bind('password')} />
          </Field>
          {serverError && <span className={styles.serverError}>{serverError}</span>}
          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Entrar
          </Button>
        </form>

        <span className={styles.foot}>
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </span>
      </Panel>
    </div>
  );
}
