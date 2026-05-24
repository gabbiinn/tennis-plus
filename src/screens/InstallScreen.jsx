import { useState } from "react";
import { Share, Plus } from "lucide-react";

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent);

export default function InstallScreen({ onIgnorer }) {
  const [etape, setEtape] = useState(0);

  const etapesIOS = [
    {
      icon: "🌐",
      titre: "Ouvre cette page dans Safari",
      desc: "L'installation ne fonctionne qu'avec Safari sur iPhone. Si tu utilises Chrome ou un autre navigateur, copie le lien et colle-le dans Safari.",
    },
    {
      icon: null,
      iconComponent: <Share size={28} className="text-blue-500" />,
      titre: 'Appuie sur "Partager"',
      desc: 'En bas de Safari, appuie sur le bouton Partager — le carré avec une flèche qui pointe vers le haut.',
    },
    {
      icon: null,
      iconComponent: <Plus size={28} className="text-blue-500" strokeWidth={2.5} />,
      titre: '"Sur l\'écran d\'accueil"',
      desc: 'Dans le menu qui s\'ouvre, fais défiler et appuie sur "Sur l\'écran d\'accueil", puis "Ajouter".',
    },
    {
      icon: "🎾",
      titre: "Tennis+ est installée !",
      desc: "L'icône Tennis+ apparaît sur ton écran d'accueil. Ouvre-la — elle se lance en plein écran comme une vraie app.",
    },
  ];

  const etapesAndroid = [
    {
      icon: "🌐",
      titre: "Ouvre cette page dans Chrome",
      desc: "L'installation fonctionne mieux avec Chrome sur Android.",
    },
    {
      icon: "⋮",
      titre: 'Appuie sur les 3 points',
      desc: "En haut à droite de Chrome, appuie sur le menu (les 3 points verticaux).",
    },
    {
      icon: "📲",
      titre: '"Installer l\'application"',
      desc: 'Dans le menu, appuie sur "Installer l\'application" ou "Ajouter à l\'écran d\'accueil".',
    },
    {
      icon: "🎾",
      titre: "Tennis+ est installée !",
      desc: "L'icône Tennis+ apparaît sur ton écran d'accueil. Lance-la comme une vraie app.",
    },
  ];

  const etapes = isAndroid ? etapesAndroid : etapesIOS;
  const etapeActuelle = etapes[etape];
  const derniere = etape === etapes.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 pt-12 pb-10" style={{ maxWidth: "430px", margin: "0 auto" }}>
      <div className="flex-1 flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2">
          INSTALLER L'APP · {etape + 1}/{etapes.length}
        </p>
        <h1 className="text-3xl font-black mb-8 leading-tight" style={{ fontFamily: "Archivo Black, sans-serif" }}>
          TENNIS+<br />
          <span style={{ color: "#1E5FAF" }}>SUR TON TÉLÉPHONE</span>
        </h1>

        <div className="flex gap-1.5 mb-10">
          {etapes.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all"
              style={{ backgroundColor: i <= etape ? "#1E5FAF" : "#E5E7EB" }} />
          ))}
        </div>

        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-sm"
            style={{ backgroundColor: "#EFF6FF" }}>
            {etapeActuelle.iconComponent
              ? <div className="scale-150">{etapeActuelle.iconComponent}</div>
              : <span className="text-5xl">{etapeActuelle.icon}</span>
            }
          </div>
          <h2 className="text-xl font-black mb-3" style={{ fontFamily: "Archivo Black, sans-serif" }}>
            {etapeActuelle.titre}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            {etapeActuelle.desc}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <button
          onClick={() => derniere ? onIgnorer() : setEtape(e => e + 1)}
          className="w-full py-4 rounded-2xl text-white font-bold text-sm"
          style={{ backgroundColor: "#1E5FAF" }}>
          {derniere ? "Commencer →" : "Suivant →"}
        </button>
        {etape === 0 && (
          <button onClick={onIgnorer} className="text-center text-sm text-gray-400 py-2">
            Ignorer, continuer sur le navigateur
          </button>
        )}
        {etape > 0 && (
          <button onClick={() => setEtape(e => e - 1)} className="text-center text-sm text-gray-400 py-2">
            ← Retour
          </button>
        )}
      </div>
    </div>
  );
}
