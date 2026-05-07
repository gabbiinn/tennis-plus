import { useState } from "react";
import { Trophy, Users, Calendar, MapPin, ChevronDown, ChevronUp, Check } from "lucide-react";

const TOURNOIS = [
  {
    id: 1,
    nom: "Open Amical Thabor",
    date: "24-25 mai 2026",
    lieu: "Courts Thabor, Rennes",
    niveau: ["15/1", "15/2", "15/3"],
    inscrits: 14,
    max: 16,
    prix: "Gratuit",
    statut: "ouvert",
    couleur: "#1E5FAF",
    joueurs: ["Thomas R.", "Sophie M.", "Lucas B.", "Camille D.", "Maxime L.", "Julie P.", "Antoine K.", "Marie T.", "Pierre L.", "Sarah B.", "Kevin M.", "Laura D.", "Nicolas F.", "Emma R."],
    tableau: [
      { tour: "Quarts de finale", matchs: [
        { j1: "Thomas R.", j2: "Antoine K.", score: "6-3 6-2", fini: true },
        { j1: "Sophie M.", j2: "Marie T.", score: "6-4 7-5", fini: true },
        { j1: "Lucas B.", j2: "Pierre L.", score: "À jouer", fini: false },
        { j1: "Camille D.", j2: "Sarah B.", score: "À jouer", fini: false },
      ]},
      { tour: "Demi-finales", matchs: [
        { j1: "Thomas R.", j2: "Sophie M.", score: "À jouer", fini: false },
        { j1: "TBD", j2: "TBD", score: "À jouer", fini: false },
      ]},
      { tour: "Finale", matchs: [
        { j1: "TBD", j2: "TBD", score: "À jouer", fini: false },
      ]},
    ],
  },
  {
    id: 2,
    nom: "Tournoi du Printemps",
    date: "7-8 juin 2026",
    lieu: "TC Rennes",
    niveau: ["30", "15/3", "15/2"],
    inscrits: 8,
    max: 16,
    prix: "5€",
    statut: "ouvert",
    couleur: "#C75D3F",
    joueurs: ["Kevin M.", "Laura D.", "Nicolas F.", "Emma R.", "Pierre L.", "Sarah B.", "Marie T.", "Antoine K."],
    tableau: [],
  },
  {
    id: 3,
    nom: "Cup Gayeulles Été",
    date: "12-13 juil. 2026",
    lieu: "Courts Gayeulles, Rennes",
    niveau: ["Tous niveaux"],
    inscrits: 6,
    max: 32,
    prix: "Gratuit",
    statut: "ouvert",
    couleur: "#2D5016",
    joueurs: ["Thomas R.", "Lucas B.", "Maxime L.", "Julie P.", "Kevin M.", "Nicolas F."],
    tableau: [],
  },
];

const MES_INSCRIPTIONS = [
  { id: 1, nom: "Open Amical Thabor", date: "24-25 mai 2026", statut: "Confirmée ✅" },
];

const NIVEAUX = ["Tous", "15/1", "15/2", "15/3", "30"];

export default function TournoisScreen() {
  const [niveauFiltre, setNiveauFiltre] = useState("Tous");
  const [tournoisInscrits, setTournoisInscrits] = useState([1]);
  const [tournoisOuverts, setTournoisOuverts] = useState({});
  const [onglet, setOnglet] = useState("tournois");
  const [vueTournoi, setVueTournoi] = useState(null);

  const tournoisFiltres = TOURNOIS.filter((t) => {
    if (niveauFiltre === "Tous") return true;
    return t.niveau.includes(niveauFiltre);
  });

  const toggleOuvrir = (id) => {
    setTournoisOuverts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sInscrire = (id) => {
    if (!tournoisInscrits.includes(id)) setTournoisInscrits([...tournoisInscrits, id]);
  };

  if (vueTournoi) {
    const t = TOURNOIS.find((x) => x.id === vueTournoi);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => setVueTournoi(null)} className="text-gray-400 font-bold text-lg">←</button>
          <h1 className="text-lg font-black" style={{ fontFamily: "Archivo Black, sans-serif" }}>{t.nom}</h1>
        </div>
        <div className="px-4 mt-4 pb-24">
          {/* Tableau */}
          {t.tableau.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tableau</p>
              {t.tableau.map((tour) => (
                <div key={tour.tour} className="mb-3">
                  <p className="text-xs font-bold mb-2" style={{ color: t.couleur }}>{tour.tour}</p>
                  <div className="flex flex-col gap-2">
                    {tour.matchs.map((m, i) => (
                      <div key={i} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-medium">{m.j1}</p>
                          <p className="text-gray-400 text-xs">vs</p>
                          <p className="font-medium">{m.j2}</p>
                        </div>
                        <span className="text-sm font-bold px-3 py-1 rounded-lg"
                          style={{ backgroundColor: m.fini ? "#DCFCE7" : "#F3F4F6", color: m.fini ? "#166534" : "#6B7280" }}>
                          {m.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Joueurs inscrits */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Joueurs inscrits ({t.joueurs.length})</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {t.joueurs.map((j, i) => (
                <div key={j} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < t.joueurs.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: t.couleur }}>
                    {j[0]}
                  </div>
                  <p className="text-sm font-medium">{j}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-black mb-3" style={{ fontFamily: "Archivo Black, sans-serif" }}>
          Tournois
        </h1>
        <div className="flex gap-1 mb-3">
          {["tournois", "mes-inscriptions"].map((o) => (
            <button key={o} onClick={() => setOnglet(o)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: onglet === o ? "#1E5FAF" : "#F3F4F6", color: onglet === o ? "white" : "#6B7280" }}>
              {o === "tournois" ? "🏆 Tournois" : "📋 Mes inscriptions"}
            </button>
          ))}
        </div>
        {onglet === "tournois" && (
          <div className="flex gap-2 flex-wrap">
            {NIVEAUX.map((n) => (
              <button key={n} onClick={() => setNiveauFiltre(n)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{ backgroundColor: niveauFiltre === n ? "#1E5FAF" : "#F3F4F6", color: niveauFiltre === n ? "white" : "#374151" }}>
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {onglet === "tournois" && (
        <div className="px-4 mt-4 pb-24 flex flex-col gap-3">
          {tournoisFiltres.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: t.couleur + "20" }}>
                      <Trophy size={18} style={{ color: t.couleur }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.nom}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {t.date}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm" style={{ color: t.prix === "Gratuit" ? "#2D5016" : "#1E5FAF" }}>
                    {t.prix}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <MapPin size={10} /> {t.lieu}
                </p>
                <div className="flex gap-1 mb-3 flex-wrap">
                  {t.niveau.map((n) => (
                    <span key={n} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "#EFF6FF", color: "#1E5FAF" }}>{n}</span>
                  ))}
                </div>
                {/* Jauge inscrits */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="flex items-center gap-1"><Users size={10} /> {t.inscrits}/{t.max} inscrits</span>
                    <span>{Math.round((t.inscrits / t.max) * 100)}% complet</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(t.inscrits / t.max) * 100}%`, backgroundColor: t.couleur }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleOuvrir(t.id)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 flex items-center justify-center gap-1">
                    {tournoisOuverts[t.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Détails
                  </button>
                  <button
                    onClick={() => sInscrire(t.id)}
                    disabled={tournoisInscrits.includes(t.id)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1"
                    style={{ backgroundColor: tournoisInscrits.includes(t.id) ? "#F3F4F6" : t.couleur, color: tournoisInscrits.includes(t.id) ? "#9CA3AF" : "white" }}>
                    {tournoisInscrits.includes(t.id) ? <><Check size={14} /> Inscrit</> : "S'inscrire →"}
                  </button>
                </div>
              </div>
              {tournoisOuverts[t.id] && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <button onClick={() => setVueTournoi(t.id)}
                    className="w-full py-2 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: t.couleur }}>
                    Voir tableau et joueurs →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {onglet === "mes-inscriptions" && (
        <div className="px-4 mt-4 pb-24">
          {tournoisInscrits.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Pas encore inscrit à un tournoi</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {TOURNOIS.filter((t) => tournoisInscrits.includes(t.id)).map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: t.couleur + "20" }}>
                      <Trophy size={18} style={{ color: t.couleur }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{t.nom}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>
                      Confirmée ✅
                    </span>
                  </div>
                  <button onClick={() => setVueTournoi(t.id)}
                    className="w-full mt-3 py-2 rounded-xl text-sm font-bold border"
                    style={{ borderColor: t.couleur, color: t.couleur }}>
                    Voir le tableau →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}