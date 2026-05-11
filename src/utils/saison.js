export function getCouleurSaison() {
  const mois = new Date().getMonth() + 1;
  if (mois >= 4 && mois <= 6) return "#C75D3F";
  if (mois >= 7 && mois <= 8) return "#2D5016";
  return "#1E5FAF";
}

export function getNomSaison() {
  const mois = new Date().getMonth() + 1;
  if (mois >= 4 && mois <= 6) return "clay";
  if (mois >= 7 && mois <= 8) return "grass";
  return "hard";
}