import { useState, useEffect } from "react";
import { MapPin, Filter } from "lucide-react";
import { couleurSaison } from "../App";
import { supabase } from "../lib/supabase";

const SERIES = ["Toutes", "NC", "40", "30/4", "30/3", "30/2", "30/1", "30", "15/5", "15/4", "15/3", "15/2", "15/1", "15", "5/6", "4/6", "3/6", "2/6"];

export default function PartenairesScreen() {
  const [sexeFiltre, setSexeFiltre] = useState("Tous");
  const [serieFiltre, setSerieFiltre] = useState("Toutes");
  const [showFiltres, setShowFiltres] = useState(false);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState([]);
  const [joueurs, setJoueurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setLoading(true);
      const { data, error } = await supabase
        .from("profils")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setJoueurs(data.filter((j) => j.id !== user?.id));
      setLoading(false);
    };
    charger();
  }, []);

  const joueursFiltres = joueurs.filter((j) => {
    if (sexeFiltre !== "Tous" && j.sexe !== sexeFiltre) return false;
    if (serieFiltre !== "Toutes" && j.serie !== serieFiltre) return false;
    return true;
  });

  const envoyerDemande = async (joueur) => {
    if (demandeEnvoyee.includes(joueur.id) || !currentUser) return;
    await supabase.from("messages").insert({
      expediteur_id: currentUser.id,
      destinataire_id: joueur.id,
      contenu: "👋 Salut ! Je cherche un partenaire pour jouer. Tu es dispo ?",
    });
    setDemandeEnvoyee((prev) => [...prev, joueur.id]);
  };

  const getInitiales = (nom) => {
    if (!nom) return "?";
    const parts = nom.split(" ");
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : nom[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black" style={{ fontFamily: "Archivo Black, sans-serif" }}>
            Partenaires
          </h1>
          <button
            onClick={() => setShowFiltres(!showFiltres)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border"
            style={{ borderColor: couleurSaison, color: couleurSaison }}>
            <Filter size={14} />
            Filtres
            {(sexeFiltre !== "Tous" || serieFiltre !== "Toutes") && (
              <span className="w-2 h-2 rounded-full ml-1" style={{ backgroundColor: couleurSaison }} />
            )}
          </button>
        </div>

        {showFiltres && (
          <div className="pt-3 border-t border-gray-100">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Sexe</p>
              <div className="flex gap-2">
                {["Tous", "Homme", "Femme"].map((s) => (
                  <button key={s} onClick={() => setSexeFiltre(s)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{ backgroundColor: sexeFiltre === s ? couleurSaison : "#F3F4F6", color: sexeFiltre === s ? "white" : "#374151" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Série</p>
              <div className="flex gap-2 flex-wrap">
                {SERIES.map((s) => (
                  <button key={s} onClick={() => setSerieFiltre(s)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{ backgroundColor: serieFiltre === s ? couleurSaison : "#F3F4F6", color: serieFiltre === s ? "white" : "#374151" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-200 relative" style={{ height: "140px", backgroundColor: "#E8F0E8" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={24} style={{ color: couleurSaison }} className="mx-auto mb-1" />
            <p className="text-xs text-gray-500">Rennes — {joueursFiltres.length} joueur{joueursFiltres.length > 1 ? "s" : ""} à proximité</p>
          </div>
        </div>
        {joueursFiltres.slice(0, 4).map((j, i) => (
          <div key={j.id}
            className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
            style={{ backgroundColor: couleurSaison, top: `${20 + (i % 2) * 50}%`, left: `${15 + i * 20}%` }}>
            {getInitiales(j.nom)[0]}
          </div>
        ))}
      </div>

      <div className="px-4 mt-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : joueursFiltres.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🎾</p>
            <p className="font-bold">Aucun joueur trouvé</p>
            <p className="text-sm mt-1">Change les filtres ou reviens plus tard !</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">{joueursFiltres.length} partenaire{joueursFiltres.length > 1 ? "s" : ""} trouvé{joueursFiltres.length > 1 ? "s" : ""}</p>
            <div className="flex flex-col gap-3">
              {joueursFiltres.map((joueur) => (
                <div key={joueur.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: couleurSaison }}>
                    {getInitiales(joueur.nom)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{joueur.nom}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: couleurSaison + "20", color: couleurSaison }}>
                        {joueur.serie}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                        {joueur.sexe}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{joueur.club}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {joueur.secteurs && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={11} /> {joueur.secteurs[0]}
                        </span>
                      )}
                      {joueur.dispos && joueur.dispos[0] && (
                        <span className="text-xs text-gray-400">🕐 {joueur.dispos[0]}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => envoyerDemande(joueur)}
                    disabled={demandeEnvoyee.includes(joueur.id)}
                    className="px-3 py-2 rounded-xl text-sm font-bold transition-all flex-shrink-0"
                    style={{ backgroundColor: demandeEnvoyee.includes(joueur.id) ? "#F3F4F6" : couleurSaison, color: demandeEnvoyee.includes(joueur.id) ? "#9CA3AF" : "white" }}>
                    {demandeEnvoyee.includes(joueur.id) ? "Envoyé ✓" : "Jouer"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}