import { useState } from "react";
import { ChevronRight, Check } from "lucide-react";

const SLIDES = [
  { emoji: "🎾", titre: "Bienvenue sur TENNIS+", desc: "L'app qui connecte les joueurs de tennis à Rennes. Trouve des partenaires, réserve des courts, rejoins des tournois amicaux.", couleur: "#1E5FAF" },
  { emoji: "🤝", titre: "Trouve ton partenaire idéal", desc: "Filtre par niveau, secteur et disponibilités. Envoie une demande de match en un tap.", couleur: "#C75D3F" },
  { emoji: "🏟️", titre: "Réserve un court", desc: "Courts municipaux gratuits ou clubs privés — tous les terrains de Rennes au même endroit.", couleur: "#2D5016" },
  { emoji: "🏆", titre: "Rejoins des tournois amicaux", desc: "Des tournois organisés par et pour les joueurs. Sans prise de tête, juste pour le plaisir du jeu.", couleur: "#1E5FAF" },
];

const CLASSEMENTS = ["NC", "40", "30/4", "30/3", "30/2", "30/1", "30", "15/5", "15/4", "15/3", "15/2", "15/1", "15", "5/6", "4/6", "3/6", "2/6", "1/6", "0", "-2/6", "-4/6", "-15", "-30"];
const DISPOS = ["Matin semaine", "Soir semaine", "Week-end matin", "Week-end après-midi", "Flexible"];
const SECTEURS = ["Rennes Centre", "Rennes Nord", "Rennes Sud", "Rennes Est", "Rennes Ouest", "Saint-Grégoire", "Cesson-Sévigné", "Thorigné-Fouillard", "Chantepie", "Saint-Jacques-de-la-Lande", "Bruz", "Chartres-de-Bretagne", "Pacé", "Mordelles", "Betton", "Acigné", "Noyal-sur-Vilaine", "Liffré", "Vern-sur-Seiche", "Chateaubourg", "Janzé", "Bain-de-Bretagne", "Guichen", "Laillé", "Gévezé", "La Mézière", "Melesse", "Servon-sur-Vilaine", "Noyal-Châtillon"];
const CLUBS = ["TC Saint-Grégoire", "TC Cesson-Sévigné", "TC Bruz", "TC Betton", "TC Pacé", "TC Chartres-de-Bretagne", "TC Mordelles", "TC Thorigné-Fouillard", "TC Chantepie", "TC Saint-Jacques-de-la-Lande", "TC Acigné", "TC Noyal-sur-Vilaine", "TC Liffré", "TC Bois Orcan", "TC La Flume", "TC Laillé", "TC Bain-de-Bretagne", "TC Vern-sur-Seiche", "TC Noyal-Châtillon", "TC Guichen", "TC Chateaubourg", "TC Servon-sur-Vilaine", "TC Gévezé", "TC La Mézière", "TC Melesse", "TC Janzé", "Sans club", "Je joue en loisir"];
const ANNEES = ["Moins d'1 an", "1-2 ans", "3-5 ans", "6-10 ans", "Plus de 10 ans"];

export default function OnboardingScreen({ onTermine }) {
  const [slide, setSlide] = useState(0);
  const [etape, setEtape] = useState("slides");
  const [profil, setProfil] = useState({ sexe: "", serie: "", anneesTennis: "", dispos: [], secteurs: [], club: "" });

  const currentSlide = SLIDES[slide];

  const suivant = () => {
    if (slide < SLIDES.length - 1) setSlide(slide + 1);
    else setEtape("formulaire");
  };

  const toggleDispo = (d) => {
    setProfil((prev) => ({ ...prev, dispos: prev.dispos.includes(d) ? prev.dispos.filter((x) => x !== d) : [...prev.dispos, d] }));
  };

  const toggleSecteur = (secteur) => {
    setProfil((prev) => ({ ...prev, secteurs: prev.secteurs.includes(secteur) ? prev.secteurs.filter((x) => x !== secteur) : [...prev.secteurs, secteur] }));
  };

  const peutTerminer = profil.sexe && profil.serie && profil.secteurs.length > 0 && profil.club && profil.anneesTennis;

  if (etape === "slides") {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentSlide.couleur }}>
        <div className="flex justify-end px-6 pt-6">
          <button onClick={() => setEtape("formulaire")} className="text-white text-sm font-medium opacity-70">Passer →</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-8xl mb-8">{currentSlide.emoji}</div>
          <h1 className="text-3xl font-black text-white mb-4" style={{ fontFamily: "Archivo Black, sans-serif" }}>{currentSlide.titre}</h1>
          <p className="text-white text-base opacity-80 leading-relaxed">{currentSlide.desc}</p>
        </div>
        <div className="px-8 pb-12">
          <div className="flex justify-center gap-2 mb-8">
            {SLIDES.map((_, i) => (
              <div key={i} className="rounded-full transition-all"
                style={{ width: i === slide ? "24px" : "8px", height: "8px", backgroundColor: i === slide ? "white" : "rgba(255,255,255,0.4)" }} />
            ))}
          </div>
          <button onClick={suivant}
            className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: "white", color: currentSlide.couleur }}>
            {slide < SLIDES.length - 1 ? "Suivant" : "Commencer"} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: "#1E5FAF" }}>T+</div>
          <h1 className="text-xl font-black" style={{ fontFamily: "Archivo Black, sans-serif" }}>Mon profil joueur</h1>
        </div>
        <p className="text-sm text-gray-400">2 minutes pour bien démarrer 🎾</p>
      </div>

      <div className="px-4 py-5 pb-32 flex flex-col gap-6">

        {/* Sexe */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Je suis <span className="text-red-400">*</span></p>
          <div className="flex gap-3">
            {["Homme", "Femme"].map((genre) => (
              <button key={genre} onClick={() => setProfil({ ...profil, sexe: genre })}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ backgroundColor: profil.sexe === genre ? "#1E5FAF" : "#F3F4F6", color: profil.sexe === genre ? "white" : "#374151" }}>
                {genre === "Homme" ? "👨 Homme" : "👩 Femme"}
              </button>
            ))}
          </div>
        </div>

        {/* Classement */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1">Mon classement FFT <span className="text-red-400">*</span></p>
          <p className="text-xs text-gray-400 mb-3">Du plus faible au plus fort</p>
          <div className="flex gap-2 flex-wrap">
            {CLASSEMENTS.map((niveau) => (
              <button key={niveau} onClick={() => setProfil({ ...profil, serie: niveau })}
                className="px-3 py-2 rounded-full text-sm font-bold transition-all"
                style={{ backgroundColor: profil.serie === niveau ? "#1E5FAF" : "#F3F4F6", color: profil.serie === niveau ? "white" : "#374151" }}>
                {niveau}
              </button>
            ))}
          </div>
        </div>

        {/* Années tennis */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Depuis combien de temps joues-tu ? <span className="text-red-400">*</span></p>
          <div className="flex gap-2 flex-wrap">
            {ANNEES.map((annee) => (
              <button key={annee} onClick={() => setProfil({ ...profil, anneesTennis: annee })}
                className="px-3 py-2 rounded-full text-sm font-bold transition-all"
                style={{ backgroundColor: profil.anneesTennis === annee ? "#C75D3F" : "#F3F4F6", color: profil.anneesTennis === annee ? "white" : "#374151" }}>
                {annee}
              </button>
            ))}
          </div>
        </div>

        {/* Disponibilités */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1">Mes disponibilités</p>
          <p className="text-xs text-gray-400 mb-3">Plusieurs choix possibles</p>
          <div className="flex gap-2 flex-wrap">
            {DISPOS.map((dispo) => (
              <button key={dispo} onClick={() => toggleDispo(dispo)}
                className="px-3 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1"
                style={{ backgroundColor: profil.dispos.includes(dispo) ? "#1E5FAF" : "#F3F4F6", color: profil.dispos.includes(dispo) ? "white" : "#374151" }}>
                {profil.dispos.includes(dispo) && <Check size={12} />}{dispo}
              </button>
            ))}
          </div>
        </div>

        {/* Secteurs */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1">Mon secteur <span className="text-red-400">*</span></p>
          <p className="text-xs text-gray-400 mb-3">Plusieurs choix possibles</p>
          <div className="flex gap-2 flex-wrap">
            {SECTEURS.map((secteur) => (
              <button key={secteur} onClick={() => toggleSecteur(secteur)}
                className="px-3 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1"
                style={{ backgroundColor: profil.secteurs.includes(secteur) ? "#1E5FAF" : "#F3F4F6", color: profil.secteurs.includes(secteur) ? "white" : "#374151" }}>
                {profil.secteurs.includes(secteur) && <Check size={12} />}{secteur}
              </button>
            ))}
          </div>
        </div>

        {/* Club */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Mon club <span className="text-red-400">*</span></p>
          <div className="flex gap-2 flex-wrap">
            {CLUBS.map((club) => (
              <button key={club} onClick={() => setProfil({ ...profil, club: club })}
                className="px-3 py-2 rounded-full text-sm font-bold transition-all"
                style={{ backgroundColor: profil.club === club ? "#1E5FAF" : "#F3F4F6", color: profil.club === club ? "white" : "#374151" }}>
                {club}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton terminer */}
        <button onClick={onTermine} disabled={!peutTerminer}
          className="w-full py-4 rounded-2xl font-black text-lg transition-all"
          style={{ backgroundColor: peutTerminer ? "#1E5FAF" : "#E5E7EB", color: peutTerminer ? "white" : "#9CA3AF" }}>
          {peutTerminer ? "C'est parti ! 🎾" : "Remplis les champs obligatoires *"}
        </button>

      </div>
    </div>
  );
}