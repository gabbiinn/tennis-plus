import { useState } from "react";
import { Camera, Edit2, LogOut, Trophy, Check, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const BADGES = [
  { id: 1, emoji: "🎾", nom: "Premier match", desc: "Tu as joué ton 1er match", obtenu: true },
  { id: 2, emoji: "🏆", nom: "Finaliste", desc: "Finaliste d'un tournoi amical", obtenu: true },
  { id: 3, emoji: "🔥", nom: "3 victoires d'affilée", desc: "3 matchs gagnés de suite", obtenu: true },
  { id: 4, emoji: "🤝", nom: "Sociable", desc: "5 partenaires différents", obtenu: false },
  { id: 5, emoji: "⭐", nom: "Régulier", desc: "10 matchs joués", obtenu: false },
  { id: 6, emoji: "👑", nom: "Champion", desc: "Gagner un tournoi amical", obtenu: false },
];

const MATCHS_PASSES = [
  { id: 1, adversaire: "Thomas R.", date: "3 mai 2026", score: "6-3 6-2", victoire: true, tournoi: false },
  { id: 2, adversaire: "Lucas B.", date: "28 avr. 2026", score: "4-6 6-4 10-7", victoire: true, tournoi: false },
  { id: 3, adversaire: "Maxime L.", date: "20 avr. 2026", score: "3-6 2-6", victoire: false, tournoi: true },
  { id: 4, adversaire: "Antoine K.", date: "12 avr. 2026", score: "6-1 6-0", victoire: true, tournoi: true },
  { id: 5, adversaire: "Pierre L.", date: "5 avr. 2026", score: "5-7 6-4 8-10", victoire: false, tournoi: false },
];

const SERIES = ["NC","40","30/4","30/3","30/2","30/1","30","15/5","15/4","15/3","15/2","15/1","15","5/6","4/6","3/6","2/6","1/6","0","-2/6","-4/6","-15","-30"];
const DISPOS = ["Matin semaine","Soir semaine","Week-end matin","Week-end après-midi","Flexible"];
const SECTEURS = ["Rennes Centre","Rennes Nord","Rennes Sud","Rennes Est","Rennes Ouest","Saint-Grégoire","Cesson-Sévigné","Thorigné-Fouillard","Chantepie","Saint-Jacques-de-la-Lande","Bruz","Chartres-de-Bretagne","Pacé","Mordelles","Betton","Acigné","Noyal-sur-Vilaine","Liffré","Vern-sur-Seiche","Chateaubourg","Janzé","Bain-de-Bretagne","Guichen","Laillé","Gévezé","La Mézière","Melesse","Servon-sur-Vilaine","Noyal-Châtillon"];

export default function ProfilScreen() {
  const [editMode, setEditMode] = useState(false);
  const [onglet, setOnglet] = useState("stats");
  const [profil, setProfil] = useState({
    nom: "Gabin Island",
    serie: "15/2",
    club: "TC Rennes",
    dispo: "Week-end matin",
    secteur: "Centre / Thabor",
    initiales: "GI",
  });
  const [profilTemp, setProfilTemp] = useState(profil);

  const victoires = MATCHS_PASSES.filter((m) => m.victoire).length;
  const defaites = MATCHS_PASSES.filter((m) => !m.victoire).length;
  const total = MATCHS_PASSES.length;
  const pct = Math.round((victoires / total) * 100);

  const sauvegarder = () => {
    setProfil(profilTemp);
    setEditMode(false);
  };

  const deconnecter = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black"
                style={{ backgroundColor: "#1E5FAF" }}>
                {profil.initiales}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                <Camera size={12} style={{ color: "#1E5FAF" }} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "Archivo Black, sans-serif" }}>{profil.nom}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#EFF6FF", color: "#1E5FAF" }}>{profil.serie}</span>
                <span className="text-sm text-gray-400">{profil.club}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">🕐 {profil.dispo} · 📍 {profil.secteur}</p>
            </div>
          </div>
          <button onClick={() => { setEditMode(true); setProfilTemp(profil); }}
            className="p-2 rounded-xl border border-gray-200">
            <Edit2 size={16} style={{ color: "#1E5FAF" }} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Matchs", value: total, couleur: "#1E5FAF" },
            { label: "Victoires", value: victoires, couleur: "#2D5016" },
            { label: "Défaites", value: defaites, couleur: "#C75D3F" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black" style={{ color: s.couleur }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Win rate</span>
            <span className="font-bold" style={{ color: "#2D5016" }}>{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#2D5016" }} />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 px-4 py-2 sticky top-0 z-10">
        <div className="flex gap-1">
          {[
            { id: "stats", label: "📊 Matchs" },
            { id: "badges", label: "🏅 Badges" },
            { id: "tournois", label: "🏆 Tournois" },
          ].map((o) => (
            <button key={o.id} onClick={() => setOnglet(o.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ backgroundColor: onglet === o.id ? "#1E5FAF" : "#F3F4F6", color: onglet === o.id ? "white" : "#6B7280" }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 pb-24">
        {onglet === "stats" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Historique des matchs</p>
            {MATCHS_PASSES.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl px-4 py-3 border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: m.victoire ? "#DCFCE7" : "#FEE2E2" }}>
                  {m.victoire ? <Check size={16} style={{ color: "#166534" }} /> : <X size={16} style={{ color: "#DC2626" }} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">vs {m.adversaire}</p>
                  <p className="text-xs text-gray-400">{m.date} {m.tournoi && "· 🏆 Tournoi"}</p>
                </div>
                <span className="font-bold text-sm" style={{ color: m.victoire ? "#166534" : "#DC2626" }}>{m.score}</span>
              </div>
            ))}
          </div>
        )}

        {onglet === "badges" && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              {BADGES.filter((b) => b.obtenu).length}/{BADGES.length} badges obtenus
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BADGES.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-4 border text-center"
                  style={{ borderColor: b.obtenu ? "#1E5FAF" : "#F3F4F6", opacity: b.obtenu ? 1 : 0.5 }}>
                  <div className="text-3xl mb-2">{b.emoji}</div>
                  <p className="font-bold text-sm">{b.nom}</p>
                  <p className="text-xs text-gray-400 mt-1">{b.desc}</p>
                  {b.obtenu && (
                    <span className="text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#EFF6FF", color: "#1E5FAF" }}>Obtenu ✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {onglet === "tournois" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Mes tournois</p>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF6FF" }}>
                <Trophy size={18} style={{ color: "#1E5FAF" }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Open Amical Thabor</p>
                <p className="text-xs text-gray-400">24-25 mai 2026 · Finaliste 🥈</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
                <Trophy size={18} style={{ color: "#C75D3F" }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Cup Gayeulles Été</p>
                <p className="text-xs text-gray-400">12-13 juil. 2026 · Inscrit ✅</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={deconnecter}
          className="w-full mt-6 py-3 rounded-2xl border border-red-200 text-red-500 font-bold text-sm flex items-center justify-center gap-2">
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>

      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl px-4 pt-6 pb-10" style={{ maxWidth: "430px", margin: "0 auto" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg" style={{ fontFamily: "Archivo Black, sans-serif" }}>Modifier mon profil</h2>
              <button onClick={() => setEditMode(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Série</p>
                <div className="flex gap-2 flex-wrap">
                  {SERIES.map((s) => (
                    <button key={s} onClick={() => setProfilTemp({ ...profilTemp, serie: s })}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={{ backgroundColor: profilTemp.serie === s ? "#1E5FAF" : "#F3F4F6", color: profilTemp.serie === s ? "white" : "#374151" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Disponibilité</p>
                <div className="flex gap-2 flex-wrap">
                  {DISPOS.map((d) => (
                    <button key={d} onClick={() => setProfilTemp({ ...profilTemp, dispo: d })}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={{ backgroundColor: profilTemp.dispo === d ? "#1E5FAF" : "#F3F4F6", color: profilTemp.dispo === d ? "white" : "#374151" }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Secteur</p>
                <div className="flex gap-2 flex-wrap">
                  {SECTEURS.map((s) => (
                    <button key={s} onClick={() => setProfilTemp({ ...profilTemp, secteur: s })}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={{ backgroundColor: profilTemp.secteur === s ? "#1E5FAF" : "#F3F4F6", color: profilTemp.secteur === s ? "white" : "#374151" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={sauvegarder}
                className="w-full py-3 rounded-2xl text-white font-bold mt-2"
                style={{ backgroundColor: "#1E5FAF" }}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}