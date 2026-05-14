import { useState, useEffect } from "react";
import { MapPin, Clock, Lock, Unlock } from "lucide-react";
import { couleurSaison } from "../App";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const SURFACES = ["Toutes", "Dur", "Terre", "Gazon"];
const CRENEAUX_DEFAUT = ["09:00", "10:30", "12:00", "14:00", "16:00", "17:30", "19:00"];

const surfaceColor = (s) => {
  if (s === "clay" || s === "Terre") return { bg: "#FEF3C7", text: "#92400E" };
  if (s === "grass" || s === "Gazon") return { bg: "#DCFCE7", text: "#166534" };
  return { bg: "#DBEAFE", text: "#1E40AF" };
};

const surfaceLabel = (s) => {
  const map = { clay: "Terre", hard: "Dur", grass: "Gazon" };
  return map[s] || s;
};

export default function ReserverScreen() {
  const { user: currentUser } = useAuth();
  const [surfaceFiltre, setSurfaceFiltre] = useState("Toutes");
  const [typeFiltre, setTypeFiltre] = useState("Tous");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courtSelectionne, setCourtSelectionne] = useState(null);
  const [creneauSelectionne, setCreneauSelectionne] = useState(null);
  const [reservationConfirmee, setReservationConfirmee] = useState(false);
  const [reservationErreur, setReservationErreur] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    const { data } = await supabase.from("clubs").select("*").order("name");
    if (data) setClubs(data);
    setLoading(false);
  };

  const getType = (club) => {
    if (club.type) return club.type;
    if (!club.price_per_hour || Number(club.price_per_hour) === 0) return "municipal";
    return "club";
  };

  const getPrix = (club) => {
    if (!club.price_per_hour || Number(club.price_per_hour) === 0) return "Gratuit";
    return `${Number(club.price_per_hour)}€/h`;
  };

  const getCreneaux = (club) => {
    if (club.creneaux && club.creneaux.length > 0) return club.creneaux;
    if (getType(club) === "municipal") return ["Libre accès"];
    return CRENEAUX_DEFAUT;
  };

  const getSurfaces = (club) => {
    if (!club.surfaces) return [];
    return club.surfaces.map(surfaceLabel);
  };

  const clubsFiltres = clubs.filter((c) => {
    if (typeFiltre === "Club" && getType(c) !== "club") return false;
    if (typeFiltre === "Municipal" && getType(c) !== "municipal") return false;
    if (surfaceFiltre !== "Toutes") {
      const surfaces = getSurfaces(c);
      if (!surfaces.includes(surfaceFiltre)) return false;
    }
    return true;
  });

  const confirmerReservation = async () => {
    if (!courtSelectionne || !creneauSelectionne || saving) return;
    setSaving(true);
    setReservationErreur(false);

    const today = new Date();
    const [h, m] = creneauSelectionne.split(":");
    today.setHours(parseInt(h), parseInt(m || 0), 0, 0);

    const { error } = await supabase.from("bookings").insert({
      user_id: currentUser.id,
      club_id: courtSelectionne.id,
      start_time: today.toISOString(),
      duration_minutes: 60,
      status: "confirmed",
    });

    setSaving(false);
    if (error) {
      setReservationErreur(true);
      setTimeout(() => setReservationErreur(false), 3000);
    } else {
      setReservationConfirmee(true);
      setTimeout(() => {
        setReservationConfirmee(false);
        setCourtSelectionne(null);
        setCreneauSelectionne(null);
      }, 2500);
    }
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
            <p className="text-xs text-gray-500">Rennes — {clubsFiltres.length} courts disponibles</p>
          </div>
        </div>
        {clubsFiltres.slice(0, 5).map((c, i) => (
          <div key={c.id}
            className="absolute w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer"
            style={{ backgroundColor: couleurSaison, top: `${15 + (i % 3) * 30}%`, left: `${10 + i * 17}%` }}
            onClick={() => { setCourtSelectionne(c); setCreneauSelectionne(null); }}>
            {getType(c) === "municipal" ? "M" : "C"}
          </div>
        ))}
      </div>

      <div className="px-4 mt-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded-full w-16" />
                  <div className="h-6 bg-gray-100 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : clubsFiltres.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🎾</p>
            <p className="font-bold">Aucun court trouvé</p>
            <p className="text-sm mt-1">Change les filtres !</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              {clubsFiltres.length} court{clubsFiltres.length > 1 ? "s" : ""} trouvé{clubsFiltres.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-3">
              {clubsFiltres.map((court) => {
                const type = getType(court);
                const prix = getPrix(court);
                const creneaux = getCreneaux(court);
                const surfaces = getSurfaces(court);
                const estSelectionne = courtSelectionne?.id === court.id;
                return (
                  <div key={court.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer"
                    style={{ borderColor: estSelectionne ? couleurSaison : "#F3F4F6", borderWidth: estSelectionne ? 2 : 1 }}
                    onClick={() => { setCourtSelectionne(court); setCreneauSelectionne(null); }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: couleurSaison + "20" }}>
                          {type === "municipal"
                            ? <Unlock size={18} style={{ color: couleurSaison }} />
                            : <Lock size={18} style={{ color: couleurSaison }} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{court.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin size={10} /> {court.address || court.city || "Rennes"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm"
                          style={{ color: prix === "Gratuit" ? "#2D5016" : couleurSaison }}>{prix}</span>
                        {type === "club" && (
                          <p className="text-xs text-orange-500 font-medium">Club</p>
                        )}
                      </div>
                    </div>
                    {surfaces.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {surfaces.map((s) => {
                          const col = surfaceColor(s);
                          return (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: col.bg, color: col.text }}>
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {estSelectionne && (
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 font-medium">
                          <Clock size={11} /> Créneaux disponibles aujourd'hui
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {creneaux.map((c) => (
                            <button key={c}
                              onClick={(e) => { e.stopPropagation(); setCreneauSelectionne(c); }}
                              className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                              style={{ backgroundColor: creneauSelectionne === c ? couleurSaison : "#F3F4F6", color: creneauSelectionne === c ? "white" : "#374151" }}>
                              {c}
                            </button>
                          ))}
                        </div>
                        {creneauSelectionne && creneauSelectionne !== "Libre accès" && (
                          <button onClick={(e) => { e.stopPropagation(); confirmerReservation(); }}
                            disabled={saving}
                            className="w-full mt-3 py-2.5 rounded-xl text-white font-bold text-sm transition-all"
                            style={{ backgroundColor: saving ? "#9CA3AF" : couleurSaison }}>
                            {saving ? "Réservation en cours..." : `Réserver ${creneauSelectionne} →`}
                          </button>
                        )}
                        {creneauSelectionne === "Libre accès" && (
                          <p className="text-xs text-gray-400 mt-2 text-center">Court en libre accès — aucune réservation nécessaire</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {reservationConfirmee && (
        <div className="fixed bottom-24 left-4 right-4 bg-green-500 text-white text-center py-3 rounded-2xl font-bold shadow-lg z-50">
          ✅ Réservation confirmée !
        </div>
      )}
      {reservationErreur && (
        <div className="fixed bottom-24 left-4 right-4 bg-red-500 text-white text-center py-3 rounded-2xl font-bold shadow-lg z-50">
          ❌ Erreur lors de la réservation
        </div>
      )}
    </div>
  );
}
