import { useState, useEffect, useRef } from "react";
import { Send, ChevronRight, Clock, Trophy, X } from "lucide-react";
import { couleurSaison } from "../App";
import { supabase } from "../lib/supabase";

const HORAIRES = ["Lundi 18h", "Mardi 19h", "Mercredi 18h", "Samedi 9h", "Samedi 11h", "Dimanche 10h"];

function ScoreModal({ currentUser, contact, onClose, onSaved }) {
  const [gagnant, setGagnant] = useState(null);
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);

  const valider = async () => {
    if (!gagnant) return;
    setSaving(true);
    const winnerId = gagnant === "moi" ? currentUser.id : contact.id;
    await supabase.from("matches").insert({
      player1_id: currentUser.id,
      player2_id: contact.id,
      winner_id: winnerId,
      score: score.trim() || null,
      scheduled_at: new Date().toISOString(),
      status: "played",
    });
    await supabase.from("messages").insert({
      expediteur_id: currentUser.id,
      destinataire_id: contact.id,
      contenu: `🏆 Score enregistré : ${score.trim() || "—"} — ${gagnant === "moi" ? "Victoire !" : `${contact.nom} a gagné`}`,
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" style={{ maxWidth: "430px", margin: "0 auto" }}>
      <div className="bg-white w-full rounded-t-3xl px-5 pt-5 pb-10">
        <div className="flex items-center justify-between mb-5">
          <p className="font-black text-lg" style={{ fontFamily: "Archivo Black, sans-serif" }}>Saisir le score</p>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Qui a gagné ?</p>
        <div className="flex gap-3 mb-5">
          <button onClick={() => setGagnant("moi")}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all border-2"
            style={{ borderColor: gagnant === "moi" ? couleurSaison : "#E5E7EB", backgroundColor: gagnant === "moi" ? couleurSaison + "15" : "white", color: gagnant === "moi" ? couleurSaison : "#374151" }}>
            Moi 🏆
          </button>
          <button onClick={() => setGagnant("contact")}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all border-2"
            style={{ borderColor: gagnant === "contact" ? "#EF4444" : "#E5E7EB", backgroundColor: gagnant === "contact" ? "#FEF2F2" : "white", color: gagnant === "contact" ? "#EF4444" : "#374151" }}>
            {contact.nom?.split(" ")[0] || "Lui/Elle"}
          </button>
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Score (optionnel)</p>
        <input
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="ex: 6-4 6-2"
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none mb-5"
        />

        <button onClick={valider} disabled={!gagnant || saving}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all"
          style={{ backgroundColor: !gagnant ? "#9CA3AF" : couleurSaison }}>
          {saving ? "Enregistrement..." : "Valider le résultat"}
        </button>
      </div>
    </div>
  );
}

function ConversationView({ contact, currentUser, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showHoraires, setShowHoraires] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    chargerMessages();
    const channel = supabase
      .channel("messages-" + contact.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new;
        if (
          (m.expediteur_id === currentUser.id && m.destinataire_id === contact.id) ||
          (m.expediteur_id === contact.id && m.destinataire_id === currentUser.id)
        ) {
          setMessages((prev) => [...prev, m]);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [contact.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chargerMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(expediteur_id.eq.${currentUser.id},destinataire_id.eq.${contact.id}),and(expediteur_id.eq.${contact.id},destinataire_id.eq.${currentUser.id})`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const envoyer = async () => {
    if (!message.trim()) return;
    const texte = message;
    setMessage("");
    await supabase.from("messages").insert({
      expediteur_id: currentUser.id,
      destinataire_id: contact.id,
      contenu: texte,
    });
  };

  const proposerHoraire = async (h) => {
    setShowHoraires(false);
    await supabase.from("messages").insert({
      expediteur_id: currentUser.id,
      destinataire_id: contact.id,
      contenu: `📅 Je propose : ${h}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" style={{ maxWidth: "430px", margin: "0 auto" }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button onClick={onClose} className="text-gray-400 font-bold text-lg">←</button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: couleurSaison }}>
          {contact.nom?.[0] || "?"}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{contact.nom}</p>
          <p className="text-xs text-gray-400">{contact.serie}</p>
        </div>
        <button onClick={() => setShowScore(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
          style={{ borderColor: couleurSaison, color: couleurSaison }}>
          <Trophy size={12} /> Score
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🎾</p>
            <p className="text-sm">Début de la conversation</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.expediteur_id === currentUser.id ? "justify-end" : "justify-start"}`}>
            <div className="max-w-xs px-4 py-2 rounded-2xl text-sm"
              style={{ backgroundColor: m.expediteur_id === currentUser.id ? couleurSaison : "white", color: m.expediteur_id === currentUser.id ? "white" : "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              {m.contenu}
              <p className="text-xs mt-1 opacity-60">
                {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showHoraires && (
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-500 mb-2 font-medium">Proposer un créneau :</p>
          <div className="flex gap-2 flex-wrap">
            {HORAIRES.map((h) => (
              <button key={h} onClick={() => proposerHoraire(h)}
                className="px-3 py-1 rounded-full text-xs font-medium border"
                style={{ borderColor: couleurSaison, color: couleurSaison }}>
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-center">
        <button onClick={() => setShowHoraires(!showHoraires)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: showHoraires ? couleurSaison : "#F3F4F6" }}>
          <Clock size={16} style={{ color: showHoraires ? "white" : "#6B7280" }} />
        </button>
        <input value={message} onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          placeholder="Écrire un message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" />
        <button onClick={envoyer}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: couleurSaison }}>
          <Send size={16} color="white" />
        </button>
      </div>

      {showScore && (
        <ScoreModal
          currentUser={currentUser}
          contact={contact}
          onClose={() => setShowScore(false)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}

export default function MessagesScreen() {
  const [convActive, setConvActive] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (!user) return;

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`expediteur_id.eq.${user.id},destinataire_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const autresIds = [...new Set(data.map((m) => m.expediteur_id === user.id ? m.destinataire_id : m.expediteur_id))];
        const { data: profils } = await supabase.from("profils").select("id, nom, serie").in("id", autresIds);
        const profilsMap = {};
        profils?.forEach((p) => { profilsMap[p.id] = p; });
        const convMap = {};
        data.forEach((m) => {
          const autreId = m.expediteur_id === user.id ? m.destinataire_id : m.expediteur_id;
          if (!convMap[autreId] && profilsMap[autreId]) {
            convMap[autreId] = {
              ...profilsMap[autreId],
              dernier: m.contenu,
              heure: new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            };
          }
        });
        setConversations(Object.values(convMap));
      }
      setLoading(false);
    };
    charger();
  }, []);

  if (convActive && currentUser) {
    return <ConversationView contact={convActive} currentUser={currentUser} onClose={() => setConvActive(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-black" style={{ fontFamily: "Archivo Black, sans-serif" }}>Messages</h1>
      </div>

      <div className="pb-24">
        <div className="px-4 mt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Conversations</p>
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center text-gray-400 text-sm">
              Chargement...
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="font-bold text-gray-500">Pas encore de messages</p>
              <p className="text-sm text-gray-400 mt-1">Va sur Partenaires et clique "Jouer" !</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {conversations.map((conv, i) => (
                <div key={conv.id} onClick={() => setConvActive(conv)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all"
                  style={{ borderBottom: i < conversations.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: couleurSaison }}>
                    {conv.nom?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm">{conv.nom}</p>
                      <p className="text-xs text-gray-400">{conv.heure}</p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.dernier}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
