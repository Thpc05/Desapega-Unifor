import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import { COURSES } from '../constants';
import { email, matricula, minLen, numberInRange, required } from '../utils/validation';
import styles from './Auth.module.css';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm(
    { matricula: '', name: '', email: '', phone: '', password: '', course: '', semester: '' },
    {
      matricula,
      name: required('Informe seu nome'),
      email,
      phone: required('Informe um telefone'),
      password: minLen(6, 'A senha tem no mínimo 6 caracteres'),
      course: required('Selecione seu curso'),
      semester: (v) => (v.trim() === '' ? undefined : numberInRange(0, 10)(v)),
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!form.validate()) return;
    setSubmitting(true);
    try {
      const { matricula, name, email, phone, password, course, semester } = form.values;
      await register({
        matricula,
        name,
        email,
        phone,
        password,
        course: course || undefined,
        semester: semester ? Number(semester) : undefined,
      });
      navigate('/', { replace: true });
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
          <img className={styles.logo} src="/villager-face.png" alt="" />
          <h1>Criar conta</h1>
          <span className={styles.sub}>Entre para a economia circular do campus.</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.rowTwo}>
            <Field label="Matrícula" error={form.errors.matricula}>
              <Input placeholder="2312345" inputMode="numeric" {...form.bind('matricula')} />
            </Field>
            <Field label="Nome" error={form.errors.name}>
              <Input placeholder="Seu nome" {...form.bind('name')} />
            </Field>
          </div>
          <Field label="E-mail" error={form.errors.email}>
            <Input type="email" placeholder="voce@edu.unifor.br" {...form.bind('email')} />
          </Field>
          <div className={styles.rowTwo}>
            <Field label="Telefone" error={form.errors.phone}>
              <Input placeholder="(85) 9...." {...form.bind('phone')} />
            </Field>
            <Field label="Senha" error={form.errors.password}>
              <Input type="password" placeholder="••••••••" {...form.bind('password')} />
            </Field>
          </div>
          <div className={styles.rowTwo}>
            <Field label="Curso" error={form.errors.course}>
              <Select {...form.bind('course')}>
                <option value="" disabled>
                  Selecione
                </option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Semestre" error={form.errors.semester} hint="opcional">
              <Input type="number" min={0} max={10} placeholder="3" {...form.bind('semester')} />
            </Field>
          </div>
          {serverError && (
            <span className={styles.serverError}>
              <img className={styles.serverErrorIcon} src="/warning.png" alt="" />
              {serverError}
            </span>
          )}
          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Cadastrar
          </Button>
        </form>

        <span className={styles.foot}>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </span>
      </Panel>
    </div>
  );
}
