import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

// ===== Utils =====
function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isValidPin(pin: string) {
  return /^\d{6,8}$/.test(pin);
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

// ===== "DB" TEMPORÁRIO (trocar por banco real) =====
type User = {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;

  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: number;

  personalTokenHash?: string; // token escolhido pelo usuário (hash)
  personalTokenExpiresAt?: number; // epoch ms (30 dias)
};

const usersByEmail = new Map<string, User>();
const usersByPersonalTokenHash = new Map<string, User>();
const sessions = new Map<string, { userId: string; expiresAt: number }>();

// ===== Config =====
const SESSION_DAYS = 30;

// ===== 1) Cadastro inicial: email + senha (6-8 dígitos) =====
app.post("/auth/register", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) return res.status(400).json({ error: "MISSING_FIELDS" });
  if (!isValidPin(password)) return res.status(400).json({ error: "INVALID_PASSWORD_PIN" });

  const normalizedEmail = String(email).trim().toLowerCase();
  const now = Date.now();

  const existing = usersByEmail.get(normalizedEmail);
  if (existing) return res.status(409).json({ error: "EMAIL_ALREADY_REGISTERED" });

  const verificationToken = randomToken(24);
  const user: User = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash: sha256(password),
    emailVerified: false,
    emailVerificationTokenHash: sha256(verificationToken),
    emailVerificationExpiresAt: now + 30 * 60 * 1000 // 30 min
  };

  usersByEmail.set(normalizedEmail, user);

  // TODO: Enviar e-mail real com link contendo verificationToken
  // Exemplo de link: https://libidoapp.com.br/verify-email?token=VERIFICATION_TOKEN
  return res.status(201).json({
    ok: true,
    message: "VERIFICATION_EMAIL_SENT",
    dev_only_verification_token: verificationToken
  });
});

// ===== 2) Confirma e-mail (só na 1ª vez) =====
app.post("/auth/verify-email", (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: "MISSING_TOKEN" });

  const tokenHash = sha256(token);
  const now = Date.now();

  const user = [...usersByEmail.values()].find(u => u.emailVerificationTokenHash === tokenHash);
  if (!user) return res.status(400).json({ error: "INVALID_TOKEN" });

  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < now) {
    return res.status(400).json({ error: "TOKEN_EXPIRED" });
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;

  return res.json({ ok: true });
});

// ===== 3) Definir token pessoal (qualquer texto, pode repetir entre usuários - NÃO recomendado, mas conforme pedido) =====
app.post("/auth/set-token", (req, res) => {
  const { email, password, personalToken } = req.body as {
    email?: string;
    password?: string;
    personalToken?: string;
  };

  if (!email || !password || !personalToken) return res.status(400).json({ error: "MISSING_FIELDS" });
  if (!isValidPin(password)) return res.status(400).json({ error: "INVALID_PASSWORD_PIN" });

  const user = usersByEmail.get(String(email).trim().toLowerCase());
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

  if (!user.emailVerified) return res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
  if (user.passwordHash !== sha256(password)) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  // Observação: token repetido entre usuários é inseguro.
  // Mesmo assim, vamos aceitar "repetido" conforme sua regra.
  const tokenHash = sha256(personalToken);

  // Se esse usuário já tinha token, removemos o índice antigo
  if (user.personalTokenHash) usersByPersonalTokenHash.delete(user.personalTokenHash);

  user.personalTokenHash = tokenHash;
  user.personalTokenExpiresAt = addDays(new Date(), SESSION_DAYS).getTime();
  usersByPersonalTokenHash.set(tokenHash, user);

  // Cria sessão de 30 dias também (se você quiser manter sessão separada do token)
  const sessionToken = randomToken(32);
  sessions.set(sessionToken, { userId: user.id, expiresAt: user.personalTokenExpiresAt });

  return res.json({ ok: true, sessionToken, expiresAt: user.personalTokenExpiresAt });
});

// ===== 4) Login usando SOMENTE token (dentro dos 30 dias) =====
app.post("/auth/login-with-token", (req, res) => {
  const { personalToken } = req.body as { personalToken?: string };
  if (!personalToken) return res.status(400).json({ error: "MISSING_TOKEN" });

  const tokenHash = sha256(personalToken);
  const user = usersByPersonalTokenHash.get(tokenHash);
  if (!user) return res.status(401).json({ error: "INVALID_TOKEN" });

  const now = Date.now();
  if (!user.personalTokenExpiresAt || user.personalTokenExpiresAt < now) {
    return res.status(401).json({ error: "TOKEN_EXPIRED" });
  }

  const sessionToken = randomToken(32);
  sessions.set(sessionToken, { userId: user.id, expiresAt: user.personalTokenExpiresAt });

  return res.json({ ok: true, sessionToken, expiresAt: user.personalTokenExpiresAt });
});

// ===== 5) Renovação após expirar (email + senha, sem re-confirmar e-mail) =====
app.post("/auth/renew", (req, res) => {
  const { email, password, personalToken } = req.body as {
    email?: string;
    password?: string;
    personalToken?: string;
  };

  if (!email || !password || !personalToken) return res.status(400).json({ error: "MISSING_FIELDS" });
  if (!isValidPin(password)) return res.status(400).json({ error: "INVALID_PASSWORD_PIN" });

  const user = usersByEmail.get(String(email).trim().toLowerCase());
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
  if (!user.emailVerified) return res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
  if (user.passwordHash !== sha256(password)) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const tokenHash = sha256(personalToken);
  if (user.personalTokenHash) usersByPersonalTokenHash.delete(user.personalTokenHash);

  user.personalTokenHash = tokenHash;
  user.personalTokenExpiresAt = addDays(new Date(), SESSION_DAYS).getTime();
  usersByPersonalTokenHash.set(tokenHash, user);

  const sessionToken = randomToken(32);
  sessions.set(sessionToken, { userId: user.id, expiresAt: user.personalTokenExpiresAt });

  return res.json({ ok: true, sessionToken, expiresAt: user.personalTokenExpiresAt });
});

// ===== Health =====
app.get("/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
