import { doubleCsrf } from 'csrf-csrf';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { TokenPayloadDTO } from '../dto/token-payload.dto';

/**
 * getSessionIdentifier amarra o token CSRF ao usuário autenticado.
 * Isso garante que um token gerado para o usuário A não possa ser
 * reaproveitado por uma sessão do usuário B, mesmo que ambos tenham
 * acesso ao mesmo endpoint público de geração de token.
 *
 * IMPORTANTE: como sua rota de geração de token (`GET /csrf-token`)
 * provavelmente é chamada ANTES do login (no boot da app), o usuário
 * pode ainda não estar autenticado nesse momento. Nesse caso, caímos
 * num identificador anônimo estável por requisição (ver fallback abaixo).
 * Quando o usuário loga, você deve gerar um NOVO token CSRF logo após
 * a autenticação, agora com o ID real do usuário disponível.
 */
function getSessionIdentifier(req: Request): string {
  const requestObj: TokenPayloadDTO = req[REQUEST_TOKEN_PAYLOAD_KEY];

  const id = requestObj?.sub;

  if (id) return String(id);

  // Fallback para requests não autenticadas (ex: antes do login).
  // Não é "seguro" no mesmo sentido de um ID de usuário real, mas
  // ainda assim impede que o token seja usado fora do contexto da
  // sessão em que foi gerado, contanto que o cookie de auth também
  // esteja presente nessa mesma chamada.
  return 'anonymous';
}

function getSecret(): string {
  const secret = process.env.CSRF_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'CSRF_SECRET precisa estar definido no ambiente com pelo menos 32 caracteres.',
    );
  }
  return secret;
}

export const { generateCsrfToken, validateRequest, doubleCsrfProtection } =
  doubleCsrf({
    getSecret,
    getSessionIdentifier,
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Host-stm.x-csrf-token'
        : 'stm.x-csrf-token', // prefixo __Host- exige secure+https, então só em prod
    cookieOptions: {
      httpOnly: true, // o token vai pro front via JSON, não precisa ser lido do cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    },
    getCsrfTokenFromRequest: (req: Request) =>
      req.headers['x-csrf-token'] as string | undefined,
    // GET/HEAD/OPTIONS já ficam de fora por padrão (ignoredMethods default)
  });
