import { useState, useEffect } from "react";
import { Camera, Edit2, LogOut, Trophy, Check, X, Calendar, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";
import { couleurSaison } from "../App";

function TournoisProfil() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("tournament_registrations")
        .select("registered_at, tournaments(id, name, start_date, entry_fee, clubs(name))")
        .eq("user_id", user.id)
        .order("registered_at", { ascending: false });
      if (data) setInscriptions(data);
      setLoading(false);
    };
    charger();
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) return <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>;

  if (inscriptions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400">
        <Trophy size={32} className="mx-auto mb-2 opacity-30" />
        <p className="font-medium text-sm">Pas encore de tournois</p>
        <p className="text-xs mt-1">Inscris-toi depuis l'onglet Tournois !</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
        {inscriptions.length} inscription{inscriptions.length > 1 ? "s" : ""}
      </p>
      {inscriptions.map((insc, i) => {
        const t = insc.tournaments;
        if (!t) return null;
        return (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: couleurSaison + "20" }}>
                <Trophy size={18} style={{ color: couleurSaison }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={10} /> {formatDate(t.start_date)}
                </p>
                {t.clubs?.name && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {t.clubs.name}
                  </p>
                )}
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>✅</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const BADGES_DEF = [
  { id: 1, emoji: "🎾", nom: "Premier match", desc: "Tu as joué ton 1er match" },
  { id: 2, emoji: "🏆", nom: "Finaliste", desc: "Finaliste d'un tournoi amical" },
  { id: 3, emoji: "🔥", nom: "3 victoires d'affilée", desc: "3 matchs gagnés de suite" },
  { id: 4, emoji: "🤝", nom: "Sociable", desc: "5 partenaires différents" },
  { id: 5, emoji: "⭐", nom: "Régulier", desc: "10 matchs joués" },
  { id: 6, emoji: "👑", nom: "Champion", desc: "Gagner un tournoi amical" },
];

const computeBadges = (matches, userId, inscriptions) => {
  const played = matches.filter(m => m.winner_id !== null);
  const wins = played.filter(m => m.winner_id === userId);
  const partenaires = new Set(matches.map(m => m.player1_id === userId ? m.player2_id : m.player1_id));

  const sorted = [...played].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  let maxStreak = 0, streak = 0;
  sorted.forEach(m => {
    if (m.winner_id === userId) { streak++; maxStreak = Math.max(maxStreak, streak); }
    else { streak = 0; }
  });

  return BADGES_DEF.map(b => ({
    ...b,
    obtenu: b.id === 1 ? matches.length > 0
          : b.id === 2 ? false
          : b.id === 3 ? maxStreak >= 3
          : b.id === 4 ? partenaires.size >= 5
          : b.id === 5 ? matches.length >= 10
          : false,
  }));
};

const SERIES = ["NC","40","30/4","30/3","30/2","30/1","30","15/5","15/4","15/3","15/2","15/1","15","5/6","4/6","3/6","2/6","1/6","0","-2/6","-4/6","-15","-30"];
const DISPOS = ["Matin semaine","Soir semaine","Week-end matin","Week-end après-midi","Flexible"];
const SECTEURS = ["Rennes Centre","Rennes Nord","Rennes Sud","Rennes Est","Rennes Ouest","Saint-Grégoire","Cesson-Sévigné","Thorigné-Fouillard","Chantepie","Saint-Jacques-de-la-Lande","Bruz","Chartres-de-Bretagne","Pacé","Mordelles","Betton","Acigné","Noyal-sur-Vilaine","Liffré","Vern-sur-Seiche","Chateaubourg","Janzé","Bain-de-Bretagne","Guichen","Laillé","Gévezé","La Mézière","Melesse","Servon-sur-Vilaine","Noyal-Châtillon"];
const CLUBS = ["TC Saint-Grégoire","TC Cesson-Sévigné","TC Bruz","TC Betton","TC Pacé","TC Chartres-de-Bretagne","TC Mordelles","TC Thorigné-Fouillard","TC Chantepie","TC Saint-Jacques-de-la-Lande","TC Acigné","TC Noyal-sur-Vilaine","TC Liffré","TC Bois Orcan","TC La Flume","TC Laillé","TC Bain-de-Bretagne","TC Vern-sur-Seiche","TC Noyal-Châtillon","TC Guichen","TC Chateaubourg","TC Servon-sur-Vilaine","TC Gévezé","TC La Mézière","TC Melesse","TC Janzé","Sans club","Je joue en loisir"];

const getInitiales = (nom) => {
  if (!nom) return "?";
  const parts = nom.split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : nom[0];
};

export default function ProfilScreen() {
  const [editMode, setEditMode] = useState(false);
  const [onglet, setOnglet] = useState("stats");
  const [profil, setProfil] = useState(null);
  const [profilTemp, setProfilTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [badges, setBadges] = useState(BADGES_DEF.map(b => ({ ...b, obtenu: false })));
  const [matches, setMatches] = useState([]);
  const [adversaires, setAdversaires] = useState({});

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profilData }, { data: matchesData }, { data: inscrData }] = await Promise.all([
        supabase.from("profils").select("*").eq("id", user.id).single(),
        supabase.from("matches").select("*").or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`).order("scheduled_at", { ascending: false }),
        supabase.from("tournament_registrations").select("tournament_id").eq("user_id", user.id),
      ]);

      if (profilData) setProfil(profilData);
      if (matchesData) {
        setBadges(computeBadges(matchesData, user.id, inscrData || []));
        setMatches(matchesData);

        const adversaireIds = [...new Set(matchesData.map(m =>
          m.player1_id === user.id ? m.player2_id : m.player1_id
        ).filter(Boolean))];

        if (adversaireIds.length > 0) {
          const { data: profilsAdv } = await supabase
            .from("profils").select("id, nom, serie").in("id", adversaireIds);
          if (profilsAdv) {
            const map = {};
            profilsAdv.forEach(p => { map[p.id] = p; });
            setAdversaires(map);
          }
        }
      }
      setLoading(false);
    };
    charger();
  }, []);

  const sauvegarder = async () => {
    setSaving(true);
    const { error } = await supabase.from("profils").update({
      serie: profilTemp.serie,
      dispos: profilTemp.dispos || [],
      secteurs: profilTemp.secteurs || [],
      club: profilTemp.club,
      sexe: profilTemp.sexe,
    }).eq("id", profilTemp.id);
    if (!error) setProfil(profilTemp);
    setSaving(false);
    setEditMode(false);
  };

  const deconnecter = async () => { await supabase.auth.signOut(); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 font-medium">Chargement...</p>
      </div>
    );
  }

  if (!profil) return null;

  const userId = profil.id;
  const matchesAvecResultat = matches.filter(m => m.winner_id !== null);
  const victoires = matchesAvecResultat.filter(m => m.winner_id === userId).length;
  const defaites = matchesAvecResultat.filter(m => m.winner_id !== userId).length;
  const winRate = matchesAvecResultat.length > 0 ? Math.round((victoires / matchesAvecResultat.length) * 100) : null;
  const dernierMatchs = matches.slice(0, 5);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black"
                style={{ backgroundColor: couleurSaison }}>
                {getInitiales(profil.nom)}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                <Camera size={12} style={{ color: couleurSaison }} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "Archivo Black, sans-serif" }}>{profil.nom}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: couleurSaison + "20", color: couleurSaison }}>{profil.serie}</span>
                <span className="text-sm text-gray-400">{profil.club}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {profil.sexe} · {profil.annees_tennis} de tennis
              </p>
              {profil.secteurs && profil.secteurs.length > 0 && (
                <p className="text-xs text-gray-400">📍 {profil.secteurs.join(", ")}</p>
              )}
              {profil.dispos && profil.dispos.length > 0 && (
                <p className="text-xs text-gray-400">🕐 {profil.dispos.join(", ")}</p>
              )}
            </div>
          </div>
          <button onClick={() => { setEditMode(true); setProfilTemp({...profil}); }}
            className="p-2 rounded-xl border border-gray-200">
            <Edit2 size={16} style={{ color: couleurSaison }} />
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 px-4 py-2 sticky top-0 z-10">
        <div className="flex gap-1">
          {[{ id: "stats", label: "📊 Stats" }, { id: "badges", label: "🏅 Badges" }, { id: "tournois", label: "🏆 Tournois" }].map((o) => (
            <button key={o.id} onClick={() => setOnglet(o.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ backgroundColor: onglet === o.id ? couleurSaison : "#F3F4F6", color: onglet === o.id ? "white" : "#6B7280" }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 pb-24">
        {onglet === "stats" && (
          <div className="flex flex-col gap-4">
            {matches.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400">
                <p className="text-3xl mb-2">🎾</p>
                <p className="font-medium text-sm">Aucun match enregistré</p>
                <p className="text-xs mt-1">Saisis ton score après chaque match !</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                    <p className="text-2xl font-black">{matches.length}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">Joués</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                    <p className="text-2xl font-black" style={{ color: "#22C55E" }}>{victoires}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">Victoires</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                    <p className="text-2xl font-black" style={{ color: "#EF4444" }}>{defaites}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">Défaites</p>
                  </div>
                </div>

                {winRate !== null && (
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Win rate</p>
                    <p className="text-xl font-black" style={{ color: winRate >= 50 ? "#22C55E" : "#EF4444" }}>
                      {winRate}%
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 px-4 pt-4 pb-2">Derniers matchs</p>
                  {dernierMatchs.map((m, i) => {
                    const advId = m.player1_id === userId ? m.player2_id : m.player1_id;
                    const adv = adversaires[advId];
                    const estVictoire = m.winner_id === userId;
                    const estDefaite = m.winner_id && m.winner_id !== userId;
                    return (
                      <div key={m.id}
                        className={`flex items-center gap-3 px-4 py-3 ${i < dernierMatchs.length - 1 ? "border-b border-gray-50" : ""}`}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: estVictoire ? "#DCFCE7" : estDefaite ? "#FEE2E2" : "#F3F4F6",
                            color: estVictoire ? "#22C55E" : estDefaite ? "#EF4444" : "#6B7280",
                          }}>
                          {estVictoire ? "V" : estDefaite ? "D" : "—"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">
                            {adv ? adv.nom : "Adversaire"}
                            {adv?.serie && <span className="text-xs font-normal text-gray-400 ml-1">({adv.serie})</span>}
                          </p>
                          <p className="text-xs text-gray-400">{m.score || "Score non renseigné"}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold"
                            style={{ color: estVictoire ? "#22C55E" : estDefaite ? "#EF4444" : "#6B7280" }}>
                            {estVictoire ? "Victoire" : estDefaite ? "Défaite" : "—"}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(m.scheduled_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {onglet === "badges" && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              {badges.filter((b) => b.obtenu).length}/{badges.length} badges obtenus
            </p>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-4 border text-center"
                  style={{ borderColor: b.obtenu ? couleurSaison : "#F3F4F6", opacity: b.obtenu ? 1 : 0.5 }}>
                  <div className="text-3xl mb-2">{b.emoji}</div>
                  <p className="font-bold text-sm">{b.nom}</p>
                  <p className="text-xs text-gray-400 mt-1">{b.desc}</p>
                  {b.obtenu && (
                    <span className="text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: couleurSaison + "20", color: couleurSaison }}>Obtenu ✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {onglet === "tournois" && (
          <TournoisProfil />
        )}

        <button onClick={deconnecter}
          className="w-full mt-6 py-3 rounded-2xl border border-red-200 text-red-500 font-bold text-sm flex items-center justify-center gap-2">
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>

      {editMode && profilTemp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl px-4 pt-6 pb-10 overflow-y-auto" style={{ maxWidth: "430px", margin: "0 auto", maxHeight: "85vh" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg" style={{ fontFamily: "Archivo Black, sans-serif" }}>Modifier mon profil</h2>
              <button onClick={() => setEditMode(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Série</p>
                <div className="flex gap-2 flex-wrap">
                  {SERIES.map((s) => (
                    <button key={s} onClick={() => setProfilTemp({ ...profilTemp, serie: s })}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={{ backgroundColor: profilTemp.serie === s ? couleurSaison : "#F3F4F6", color: profilTemp.serie === s ? "white" : "#374151" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Club</p>
                <div className="flex gap-2 flex-wrap">
                  {CLUBS.map((c) => (
                    <button key={c} onClick={() => setProfilTemp({ ...profilTemp, club: c })}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={{ backgroundColor: profilTemp.club === c ? couleurSaison : "#F3F4F6", color: profilTemp.club === c ? "white" : "#374151" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Disponibilités</p>
                <div className="flex gap-2 flex-wrap">
                  {DISPOS.map((d) => (
                    <button key={d} onClick={() => {
                      const dispos = profilTemp.dispos || [];
                      setProfilTemp({ ...profilTemp, dispos: dispos.includes(d) ? dispos.filter((x) => x !== d) : [...dispos, d] });
                    }}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1"
                      style={{ backgroundColor: (profilTemp.dispos || []).includes(d) ? couleurSaison : "#F3F4F6", color: (profilTemp.dispos || []).includes(d) ? "white" : "#374151" }}>
                      {(profilTemp.dispos || []).includes(d) && <Check size={12} />}{d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Secteurs</p>
                <div className="flex gap-2 flex-wrap">
                  {SECTEURS.map((s) => (
                    <button key={s} onClick={() => {
                      const secteurs = profilTemp.secteurs || [];
                      setProfilTemp({ ...profilTemp, secteurs: secteurs.includes(s) ? secteurs.filter((x) => x !== s) : [...secteurs, s] });
                    }}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1"
                      style={{ backgroundColor: (profilTemp.secteurs || []).includes(s) ? couleurSaison : "#F3F4F6", color: (profilTemp.secteurs || []).includes(s) ? "white" : "#374151" }}>
                      {(profilTemp.secteurs || []).includes(s) && <Check size={12} />}{s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={sauvegarder} disabled={saving}
                className="w-full py-3 rounded-2xl text-white font-bold mt-2"
                style={{ backgroundColor: couleurSaison }}>
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}