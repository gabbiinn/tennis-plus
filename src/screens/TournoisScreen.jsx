import { useState, useEffect } from "react";
import { Trophy, Users, Calendar, MapPin, Check } from "lucide-react";
import { couleurSaison } from "../App";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const NIVEAUX_FILTRES = ["Tous", "15/1", "15/2", "15/3", "30", "NC"];

export default function TournoisScreen() {
  const { user: currentUser } = useAuth();
  const [niveauFiltre, setNiveauFiltre] = useState("Tous");
  const [tournois, setTournois] = useState([]);
  const [inscriptionsUser, setInscriptionsUser] = useState([]);
  const [inscriptionsCounts, setInscriptionsCounts] = useState({});
  const [onglet, setOnglet] = useState("tournois");
  const [vueTournoi, setVueTournoi] = useState(null);
  const [joueursTournoi, setJoueursTournoi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inscribing, setInscribing] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    charger();
  }, [currentUser]);

  const charger = async () => {
    setLoading(true);

    const { data: ts } = await supabase
      .from("tournaments")
      .select("*, clubs(name, address)")
      .order("start_date", { ascending: true });

    if (ts) setTournois(ts);

    const { data: allRegs } = await supabase
      .from("tournament_registrations")
      .select("tournament_id");

    if (allRegs) {
      const counts = {};
      allRegs.forEach((r) => {
        counts[r.tournament_id] = (counts[r.tournament_id] || 0) + 1;
      });
      setInscriptionsCounts(counts);
    }

    if (currentUser) {
      const { data: userRegs } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .eq("user_id", currentUser.id);
      if (userRegs) setInscriptionsUser(userRegs.map((r) => r.tournament_id));
    }

    setLoading(false);
  };

  const afficherToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const sInscrire = async (tournamentId) => {
    if (!currentUser) {
      afficherToast("Non connecté — reconnecte-toi", false);
      return;
    }
    if (inscriptionsUser.includes(tournamentId)) {
      afficherToast("Déjà inscrit à ce tournoi", false);
      return;
    }
    setInscribing(tournamentId);
    const { error } = await supabase.from("tournament_registrations").insert({
      tournament_id: tournamentId,
      user_id: currentUser.id,
    });
    if (!error) {
      setInscriptionsUser((prev) => [...prev, tournamentId]);
      setInscriptionsCounts((prev) => ({ ...prev, [tournamentId]: (prev[tournamentId] || 0) + 1 }));
      afficherToast("Inscription confirmée ✅");
    } else {
      console.error("Erreur inscription:", error);
      afficherToast(`Erreur : ${error.message}`, false);
    }
    setInscribing(null);
  };

  const seDesinscrire = async (tournamentId) => {
    if (!currentUser) {
      afficherToast("Non connecté — reconnecte-toi", false);
      return;
    }
    const { error } = await supabase
      .from("tournament_registrations")
      .delete()
      .eq("tournament_id", tournamentId)
      .eq("user_id", currentUser.id);
    if (!error) {
      setInscriptionsUser((prev) => prev.filter((id) => id !== tournamentId));
      setInscriptionsCounts((prev) => ({ ...prev, [tournamentId]: Math.max(0, (prev[tournamentId] || 1) - 1) }));
      afficherToast("Désinscription effectuée");
    } else {
      console.error("Erreur désinscription:", error);
      afficherToast(`Erreur : ${error.message}`, false);
    }
  };

  const ouvrirDetail = async (tournamentId) => {
    setVueTournoi(tournamentId);
    const { data: regs } = await supabase
      .from("tournament_registrations")
      .select("user_id")
      .eq("tournament_id", tournamentId);
    if (regs && regs.length > 0) {
      const { data: joueurs } = await supabase
        .from("profils")
        .select("nom, serie")
        .in("id", regs.map((r) => r.user_id));
      setJoueursTournoi(joueurs || []);
    } else {
      setJoueursTournoi([]);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date à confirmer";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatPrix = (fee) => {
    if (!fee || Number(fee) === 0) return "Gratuit";
    return `${Number(fee)}€`;
  };

  const getLieu = (t) => t.clubs?.name || t.lieu || "Lieu à confirmer";

  const tournoisFiltres = tournois.filter((t) => {
    if (niveauFiltre === "Tous") return true;
    if (!t.niveau) return true;
    return t.niveau.includes(niveauFiltre);
  });

  if (vueTournoi) {
    const t = tournois.find((x) => x.id === vueTournoi);
    if (!t) return null;
    const inscrits = inscriptionsCounts[t.id] || 0;
    const max = t.max_participants || 32;
    const estInscrit = inscriptionsUser.includes(t.id);
    const complet = inscrits >= max;

    const surfaceLabel = { clay: "Terre battue", hard: "Dur", grass: "Gazon" };
    const surfaceColor = { clay: { bg: "#FEF3C7", text: "#92400E" }, hard: { bg: "#DBEAFE", text: "#1E40AF" }, grass: { bg: "#DCFCE7", text: "#166534" } };
    const sc = surfaceColor[t.surface] || surfaceColor.hard;

    return (
      <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => { setVueTournoi(null); setJoueursTournoi([]); }} className="text-gray-400 font-bold text-lg">←</button>
          <h1 className="text-lg font-black flex-1" style={{ fontFamily: "Archivo Black, sans-serif" }}>{t.name}</h1>
          <span className="font-bold text-sm" style={{ color: !t.entry_fee || Number(t.entry_fee) === 0 ? "#2D5016" : couleurSaison }}>
            {formatPrix(t.entry_fee)}
          </span>
        </div>

        <div className="px-4 mt-4 pb-44 flex flex-col gap-4">
          {/* Infos principales */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
              <Calendar size={16} style={{ color: couleurSaison }} />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
                <p className="text-sm font-bold">{formatDate(t.start_date)}</p>
              </div>
            </div>
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
              <MapPin size={16} style={{ color: couleurSaison }} />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Lieu</p>
                <p className="text-sm font-bold">{getLieu(t)}</p>
                {t.clubs?.address && <p className="text-xs text-gray-400">{t.clubs.address}</p>}
              </div>
            </div>
            {t.surface && (
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: sc.bg }} />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Surface</p>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: sc.bg, color: sc.text }}>
                    {surfaceLabel[t.surface] || t.surface}
                  </span>
                </div>
              </div>
            )}
            <div className="px-4 py-3 flex items-center gap-3">
              <Users size={16} style={{ color: couleurSaison }} />
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Participants</p>
                <p className="text-sm font-bold">{inscrits} / {max} inscrits</p>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min((inscrits / max) * 100, 100)}%`, backgroundColor: complet ? "#EF4444" : couleurSaison }} />
                </div>
              </div>
            </div>
          </div>

          {/* Niveaux */}
          {t.niveau && t.niveau.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Niveaux acceptés</p>
              <div className="flex gap-2 flex-wrap">
                {t.niveau.map((n) => (
                  <span key={n} className="text-sm px-3 py-1 rounded-full font-bold"
                    style={{ backgroundColor: couleurSaison + "20", color: couleurSaison }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {t.description && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Infos</p>
              <p className="text-sm text-gray-700 leading-relaxed">{t.description}</p>
            </div>
          )}

          {/* Joueurs inscrits */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Joueurs inscrits ({joueursTournoi.length})
            </p>
            {joueursTournoi.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400">
                <Trophy size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sois le premier à t'inscrire !</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {joueursTournoi.map((j, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < joueursTournoi.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: couleurSaison }}>
                      {j.nom?.[0] || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{j.nom}</p>
                      {j.serie && <p className="text-xs text-gray-400">{j.serie}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton inscription fixé en bas */}
        <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-3 pt-3 bg-white border-t border-gray-100 z-10" style={{ maxWidth: "430px", margin: "0 auto" }}>
          {estInscrit ? (
            <button onClick={() => seDesinscrire(t.id)}
              className="w-full py-3.5 rounded-2xl text-sm font-bold border-2 border-gray-200 text-gray-500">
              ✅ Inscrit — Se désinscrire
            </button>
          ) : (
            <button onClick={() => sInscrire(t.id)}
              disabled={complet || inscribing === t.id}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all"
              style={{ backgroundColor: complet ? "#9CA3AF" : couleurSaison }}>
              {inscribing === t.id ? "Inscription..." : complet ? "Tournoi complet" : `S'inscrire${t.entry_fee && Number(t.entry_fee) > 0 ? ` — ${formatPrix(t.entry_fee)}` : " — Gratuit"} →`}
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-28 left-4 right-4 py-3 px-4 rounded-2xl font-bold text-sm text-white text-center shadow-lg z-50 transition-all"
          style={{ backgroundColor: toast.ok ? "#22C55E" : "#EF4444", maxWidth: "430px", margin: "0 auto" }}>
          {toast.msg}
        </div>
      )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-black mb-3" style={{ fontFamily: "Archivo Black, sans-serif" }}>Tournois</h1>
        <div className="flex gap-1 mb-3">
          {["tournois", "mes-inscriptions"].map((o) => (
            <button key={o} onClick={() => setOnglet(o)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: onglet === o ? couleurSaison : "#F3F4F6", color: onglet === o ? "white" : "#6B7280" }}>
              {o === "tournois" ? "🏆 Tournois" : "📋 Mes inscriptions"}
            </button>
          ))}
        </div>
        {onglet === "tournois" && (
          <div className="flex gap-2 flex-wrap">
            {NIVEAUX_FILTRES.map((n) => (
              <button key={n} onClick={() => setNiveauFiltre(n)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{ backgroundColor: niveauFiltre === n ? couleurSaison : "#F3F4F6", color: niveauFiltre === n ? "white" : "#374151" }}>
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {onglet === "tournois" && (
        <div className="px-4 mt-4 pb-24 flex flex-col gap-3">
          {loading ? (
            [1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-2 bg-gray-100 rounded-full w-full" />
              </div>
            ))
          ) : tournoisFiltres.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trophy size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">Aucun tournoi trouvé</p>
              <p className="text-sm mt-1">Reviens bientôt !</p>
            </div>
          ) : (
            tournoisFiltres.map((t) => {
              const inscrits = inscriptionsCounts[t.id] || 0;
              const max = t.max_participants || 32;
              const estInscrit = inscriptionsUser.includes(t.id);
              const complet = inscrits >= max;
              return (
                <div key={t.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: couleurSaison + "20" }}>
                          <Trophy size={18} style={{ color: couleurSaison }} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={10} /> {formatDate(t.start_date)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm"
                        style={{ color: !t.entry_fee || Number(t.entry_fee) === 0 ? "#2D5016" : couleurSaison }}>
                        {formatPrix(t.entry_fee)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <MapPin size={10} /> {getLieu(t)}
                    </p>
                    {t.niveau && t.niveau.length > 0 && (
                      <div className="flex gap-1 mb-3 flex-wrap">
                        {t.niveau.map((n) => (
                          <span key={n} className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: couleurSaison + "20", color: couleurSaison }}>{n}</span>
                        ))}
                      </div>
                    )}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="flex items-center gap-1"><Users size={10} /> {inscrits}/{max} inscrits</span>
                        <span>{Math.round((inscrits / max) * 100)}% complet</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min((inscrits / max) * 100, 100)}%`, backgroundColor: complet ? "#EF4444" : couleurSaison }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      {estInscrit ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); seDesinscrire(t.id); }}
                          className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1"
                          style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>
                          <Check size={14} /> Inscrit — Se désinscrire
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); sInscrire(t.id); }}
                          disabled={complet || inscribing === t.id}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                          style={{ backgroundColor: complet ? "#F3F4F6" : couleurSaison, color: complet ? "#9CA3AF" : "white" }}>
                          {inscribing === t.id ? "..." : complet ? "Complet" : "S'inscrire →"}
                        </button>
                      )}
                      <button
                        onClick={() => ouvrirDetail(t.id)}
                        className="px-3 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 whitespace-nowrap">
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {onglet === "mes-inscriptions" && (
        <div className="px-4 mt-4 pb-24">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
          ) : inscriptionsUser.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Pas encore inscrit à un tournoi</p>
              <p className="text-sm mt-1">Consulte les tournois disponibles !</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tournois.filter((t) => inscriptionsUser.includes(t.id)).map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: couleurSaison + "20" }}>
                      <Trophy size={18} style={{ color: couleurSaison }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(t.start_date)}</p>
                      <p className="text-xs text-gray-400">{getLieu(t)}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>Confirmée ✅</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => ouvrirDetail(t.id)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold border"
                      style={{ borderColor: couleurSaison, color: couleurSaison }}>
                      Voir les joueurs →
                    </button>
                    <button onClick={() => seDesinscrire(t.id)}
                      className="px-3 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-400">
                      Se désinscrire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 py-3 px-4 rounded-2xl font-bold text-sm text-white text-center shadow-lg z-50"
          style={{ backgroundColor: toast.ok ? "#22C55E" : "#EF4444" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
