import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { signToken } from '../utils/jwt';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  POR QUE HASH DE SENHA (bcrypt) EM VEZ DE GUARDAR A SENHA?
 * ─────────────────────────────────────────────────────────────────────────
 *  Guardamos um HASH (transformação de mão única) da senha, nunca a senha em si.
 *   - Mão única: não dá para "desfazer" o hash de volta à senha.
 *   - Salt: valor aleatório embutido em cada hash → mesma senha gera hashes
 *     diferentes (impede rainbow tables).
 *   - Fator de custo (o 10 abaixo): nº de rodadas; quanto maior, mais lento de
 *     calcular, de propósito, para dificultar força bruta.
 *  No login, usamos bcrypt.compare (re-hasheia com o mesmo salt e compara).
 */

const SALT_ROUNDS = 10;

interface RegisterInput {
  matricula: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  bio?: string;
  course?: IUser['course'];
  semester?: number;
}

export const authService = {
  async register(input: RegisterInput) {
    // A matrícula É o _id do usuário. Se já existe, recusa (409).
    const exists = await User.findById(input.matricula);
    if (exists) {
      throw { status: 409, message: 'Enrollment ID already registered' };
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await User.create({
      _id: input.matricula, // matrícula como identidade
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      bio: input.bio,
      course: input.course,
      semester: input.semester,
    });

    // O token carrega a matrícula (user.id === user._id === matrícula).
    const token = signToken(user.id);
    return { user: sanitize(user), token };
  },

  async login(matricula: string, password: string) {
    // Busca por _id (matrícula), pedindo o passwordHash escondido (select:false).
    const user = await User.findById(matricula).select('+passwordHash');

    // Mensagem genérica de propósito (não revela se foi matrícula ou senha).
    if (!user) {
      throw { status: 401, message: 'Invalid enrollment ID or password' };
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw { status: 401, message: 'Invalid enrollment ID or password' };
    }

    const token = signToken(user.id);
    return { user: sanitize(user), token };
  },

  async getById(matricula: string) {
    const user = await User.findById(matricula);
    if (!user) throw { status: 404, message: 'User not found' };
    return sanitize(user);
  },
};

/** Remove o passwordHash e expõe a matrícula de forma clara na resposta. */
function sanitize(user: IUser & { toObject: () => Record<string, unknown> }) {
  const obj = user.toObject();
  delete obj.passwordHash;
  obj.matricula = obj._id; // deixa explícito na resposta
  return obj;
}
