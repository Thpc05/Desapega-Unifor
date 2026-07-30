import { User, IUser } from '../models/User';
import { Review } from '../models/Review';
import { computeLevel } from '../utils/xp';

/**
 * Campos que o usuário PODE editar em si mesmo. Note que matricula NÃO está aqui
 * (é imutável) e passwordHash também não (senha se troca por fluxo próprio).
 */
interface UpdateMeInput {
  name?: string;
  bio?: string;
  email?: string;
  phone?: string;
  course?: IUser['course'];
  semester?: number;
}

export const userService = {
  /**
   * Perfil PÚBLICO: o que qualquer visitante pode ver de um usuário.
   * Expomos reputação (xp, nível, média) e o contato (phone) para o negócio, mas
   * NÃO o email nem dados sensíveis. O nível é calculado na hora (função pura).
   */
  async getPublicProfile(matricula: string) {
    const user = await User.findById(matricula);
    if (!user) throw { status: 404, message: 'User not found' };

    // Só avaliações públicas aparecem no perfil.
    const reviews = await Review.find({ reviewee: matricula, visibility: 'public' })
      .sort({ createdAt: -1 })
      .populate('reviewer', 'name') // troca a matrícula do reviewer pelos dados básicos
      .populate('item', 'title');

    return {
      matricula: user.id, // = _id
      name: user.name,
      bio: user.bio,
      course: user.course,
      semester: user.semester,
      phone: user.phone,
      xp: user.xp,
      level: computeLevel(user.xp), // derivado, não guardado
      avgXpRating: user.avgXpRating,
      xpRatingCount: user.xpRatingCount,
      salesCount: user.salesHistory.length,
      donationCount: user.donationHistory.length,
      createdAt: (user as unknown as { createdAt: Date }).createdAt,
      reviews,
    };
  },

  /** Atualiza os campos mutáveis do próprio usuário. */
  async updateMe(id: string, data: UpdateMeInput) {
    // runValidators garante que enums (course) e limites (semester) sejam checados.
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },
};
