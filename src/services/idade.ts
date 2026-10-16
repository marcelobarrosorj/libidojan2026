// IDADE-AUTOMATICA: calcula a idade a partir da data de nascimento.
// No dia do aniversario a idade muda sozinha, em todo o app.
export const calcularIdade = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  const nasc = new Date(birthDate);
  if (isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade < 0 ? null : idade;
};