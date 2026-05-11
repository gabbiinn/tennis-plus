import { useState } from "react";
import { MapPin, Clock, Lock, Unlock } from "lucide-react";
import { couleurSaison } from "../App";

const COURTS = [
  { id: 1, nom: "TC Rennes", type: "club", adresse: "2 rue de la Racquette, Rennes", distance: "0.8 km", surfaces: ["Dur", "Terre"], prix: "8€/h", adherents: true, creneaux: ["09:00", "10:30", "14:00", "17:30"] },
  { id: 2, nom: "Rennes Ill. Tennis", type: "club", adresse: "15 av. des Sports, Rennes", distance: "1.4 km", surfaces: ["Terre"], prix: "10€/h", adherents: true, creneaux: ["08:00", "11:00", "15:00", "18:00"] },
  { id: 3, nom: "Courts Thabor", type: "municipal", adresse: "Parc du Thabor, Rennes", distance: "1.1 km", surfaces: ["Dur"], prix: "Gratuit", adherents: false, creneaux: ["Libre accès"] },
  { id: 4, nom: "TC Cesson-Sévigné", type: "club", adresse: "8 rue du Stade, Cesson", distance: "3.2 km", surfaces: ["Dur", "Gazon"], prix: "12€/h", adherents: true, creneaux: ["09:30", "11:00", "14:30", "16:00", "19:00"] },
  { id: 5, nom: "Courts Gayeulles", type: "municipal", adresse: "Parc des Gayeulles, Rennes", distance: "2.3 km", surfaces: ["Dur"], prix: "Gratuit", adherents: false, creneaux: ["Libre accès"] },
  { id: 6, nom: "Tennis Club Villejean", type: "club", adresse: "3 rue Villejean, Rennes", distance: "2.9 km", surfaces: ["Terre"], prix: "7€/h", adherents: false, creneaux: ["10:00", "13:00", "16:00", "18:30"] },
];

const SURFACES = ["Toutes", "Dur", "Terre", "Gazon"];

export default function ReserverScreen() {
  const [surfaceFiltre, setSurfaceFiltre] = useState("Toutes");
  const [typeFiltre, setTypeFiltre] = useState("Tous");
  const [courtSelectionne, setCourtSelectionne] = useState(null);
  const [creneauSelectionne, setCreneauSelectionne] = useState(null);
  const [reservationConfirmee, setReservationConfirmee] = useState(false);

  const courtsFiltres = COURTS.filter((c) => {
    if (typeFiltre === "Club" && c.type !== "club") return false;
    if (typeFiltre === "Municipal" && c.type !== "municipal") return false;
    if (surfaceFiltre !== "Toutes" && !c.surfaces.includes(surfaceFiltre)) return false;
    return true;
  });

  const confirmerReservation = () => {
    setReservationConfirmee(true);
    setTimeout(() => {
      setReservationConfirmee(false);
      setCourtSelectionne(null);
      setCreneauSelectionne(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-black mb-3" style={{ fontFamily: "Archivo Black, sans-serif" }}>Réserver un court</h1>
        <div className="flex gap-2 mb-3">
          {["Tous", "Club", "Municipal"].map((t) => (
            <button key={t} onClick={() => setTypeFiltre(t)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: typeFiltre === t ? couleurSaison : "#F3F4F6", color: typeFiltre === t ? "white" : "#374151" }}>
              {t === "Club" && <Lock size={11} />}
              {t === "Municipal" && <Unlock size={11} />}
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {SURFACES.map((s) => (
            <button key={s} onClick={() => setSurfaceFiltre(s)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{ backgroundColor: surfaceFiltre === s ? couleurSaison : "#F3F4F6", color: surfaceFiltre === s ? "white" : "#374151" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-200 relative" style={{ height: "140px", backgroundColor: "#E8F4E8" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={24} style={{ color: couleurSaison }} className="mx-auto mb-1" />
            <p className="text-xs text-gray-500">Rennes — {courtsFiltres.length} courts disponibles</p>
          </div>
        </div>
        {courtsFiltres.slice(0, 5).map((c, i) => (
          <div key={c.id}
            className="absolute w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer"
            style={{ backgroundColor: couleurSaison, top: `${15 + (i % 3) * 30}%`, left: `${10 + i * 17}%` }}
            onClick={() => setCourtSelectionne(c)}>
            {c.type === "municipal" ? "M" : "C"}
          </div>
        ))}
      </div>

      <div className="px-4 mt-4 pb-24">
        <p className="text-sm text-gray-500 mb-3">{courtsFiltres.length} court{courtsFiltres.length > 1 ? "s" : ""} trouvé{courtsFiltres.length > 1 ? "s" : ""}</p>
        <div className="flex flex-col gap-3">
          {courtsFiltres.map((court) => (
            <div key={court.id}
              className="bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer"
              style={{ borderColor: courtSelectionne?.id === court.id ? couleurSaison : "#F3F4F6", borderWidth: courtSelectionne?.id === court.id ? 2 : 1 }}
              onClick={() => { setCourtSelectionne(court); setCreneauSelectionne(null); }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: couleurSaison + "20" }}>
                    {court.type === "municipal" ? <Unlock size={18} style={{ color: couleurSaison }} /> : <Lock size={18} style={{ color: couleurSaison }} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{court.nom}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {court.distance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm" style={{ color: court.prix === "Gratuit" ? "#2D5016" : couleurSaison }}>{court.prix}</span>
                  {court.adherents && <p className="text-xs text-orange-500 font-medium">Adhérents</p>}
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {court.surfaces.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: s === "Terre" ? "#FEF3C7" : s === "Gazon" ? "#DCFCE7" : "#DBEAFE", color: s === "Terre" ? "#92400E" : s === "Gazon" ? "#166534" : "#1E40AF" }}>
                    {s}
                  </span>
                ))}
              </div>
              {courtSelectionne?.id === court.id && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 font-medium">
                    <Clock size={11} /> Créneaux disponibles aujourd'hui
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {court.creneaux.map((c) => (
                      <button key={c}
                        onClick={(e) => { e.stopPropagation(); setCreneauSelectionne(c); }}
                        className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                        style={{ backgroundColor: creneauSelectionne === c ? couleurSaison : "#F3F4F6", color: creneauSelectionne === c ? "white" : "#374151" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                  {creneauSelectionne && creneauSelectionne !== "Libre accès" && (
                    <button onClick={confirmerReservation}
                      className="w-full mt-3 py-2.5 rounded-xl text-white font-bold text-sm"
                      style={{ backgroundColor: couleurSaison }}>
                      Réserver {creneauSelectionne} →
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {reservationConfirmee && (
        <div className="fixed bottom-24 left-4 right-4 bg-green-500 text-white text-center py-3 rounded-2xl font-bold shadow-lg z-50">
          ✅ Réservation confirmée !
        </div>
      )}
    </div>
  );
}