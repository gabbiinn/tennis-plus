import { useState, useEffect, useRef } from "react";
import { Check, X, Send, Users, ChevronRight, Clock } from "lucide-react";
import { couleurSaison } from "../App";
import { supabase } from "../lib/supabase";

const GROUPES = [
  { id: 1, nom: "15/1 — 15/2 Rennes Centre", membres: 12, dernier: "Quelqu'un dispo dimanche ?", heure: "11:20", nonLu: 5 },
  { id: 2, nom: "Disponibles le soir", membres: 8, dernier: "Je suis dispo mardi 19h", heure: "Hier", nonLu: 0 },
  { id: 3, nom: "Secteur Thabor / Centre", membres: 15, dernier: "Courts Thabor libres ce matin", heure: "Hier", nonLu: 3 },
  { id: 4, nom: "Débutants bienvenus (30+)", membres: 6, dernier: "On organise un tournoi amical ?", heure: "Lun.", nonLu: 0 },
];

const HORAIRES = ["Lundi 18h", "Mardi 19h", "Mercredi 18h", "Samedi 9h", "Samedi 11h", "Dimanche 10h"];

function ConversationView({ contact, currentUser, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showHoraires, setShowHoraires] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    chargerMessages();
    const channel = supabase
      .channel("messages-" + contact.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new;
        if ((m.expediteur_id === currentUser.id && m.destinataire_id === contact.id) ||
            (m.expediteur_id === contact.id && m.destinataire_id === currentUser.id)) {
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
        <div>
          <p className="font-bold text-sm">{contact.nom}</p>
          <p className="text-xs text-gray-400">{contact.serie}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🎾</p>
            <p className="text-sm">Commence la conversation !</p>
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
    </div>
  );
}

export default function MessagesScreen() {
  const [convActive, setConvActive] = useState(null);
  const [onglet, setOnglet] = useState("messages");
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
        .select("*, expediteur:profils!messages_expediteur_id_fkey(id, nom, serie), destinataire:profils!messages_destinataire_id_fkey(id, nom, serie)")
        .or(`expediteur_id.eq.${user.id},destinataire_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (data) {
        const convMap = {};
        data.forEach((m) => {
          const autre = m.expediteur_id === user.id ? m.destinataire : m.expediteur;
          if (autre && !convMap[autre.id]) {
            convMap[autre.id] = { ...autre, dernier: m.contenu, heure: new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
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
        <div className="flex gap-1 mt-3">
          {["messages", "groupes"].map((o) => (
            <button key={o} onClick={() => setOnglet(o)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: onglet === o ? couleurSaison : "#F3F4F6", color: onglet === o ? "white" : "#6B7280" }}>
              {o === "messages" ? "💬 Messages" : "👥 Groupes"}
            </button>
          ))}
        </div>
      </div>

      {onglet === "messages" && (
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
      )}

      {onglet === "groupes" && (
        <div className="px-4 mt-4 pb-24">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tes groupes ({GROUPES.length})</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {GROUPES.map((g, i) => (
              <div key={g.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all"
                style={{ borderBottom: i < GROUPES.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: couleurSaison }}>
                    <Users size={20} />
                  </div>
                  {g.nonLu > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {g.nonLu}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm">{g.nom}</p>
                    <p className="text-xs text-gray-400">{g.heure}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{g.dernier}</p>
                  <p className="text-xs text-gray-400">{g.membres} membres</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}