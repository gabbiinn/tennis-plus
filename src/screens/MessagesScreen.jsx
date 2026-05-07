import { useState } from "react";
import { Check, X, Send, Users, ChevronRight, Clock } from "lucide-react";

const DEMANDES = [
  { id: 1, nom: "Thomas R.", serie: "15/1", avatar: "TR", couleur: "#1E5FAF", message: "Dispo samedi matin pour un match ?", heure: "Il y a 10 min" },
  { id: 2, nom: "Maxime L.", serie: "4/6", avatar: "ML", couleur: "#C75D3F", message: "Partie en semaine possible ?", heure: "Il y a 1h" },
];

const CONVERSATIONS = [
  { id: 1, nom: "Sophie M.", serie: "15", avatar: "SM", couleur: "#C75D3F", dernier: "Ok super, à samedi alors !", heure: "14:32", nonLu: 2 },
  { id: 2, nom: "Lucas B.", serie: "15/2", avatar: "LB", couleur: "#2D5016", dernier: "Tu joues où d'habitude ?", heure: "Hier", nonLu: 0 },
  { id: 3, nom: "Camille D.", serie: "30", avatar: "CD", couleur: "#1E5FAF", dernier: "Merci pour le match 🎾", heure: "Lun.", nonLu: 0 },
];

const GROUPES = [
  { id: 1, nom: "15/1 — 15/2 Rennes Centre", membres: 12, dernier: "Quelqu'un dispo dimanche ?", heure: "11:20", couleur: "#1E5FAF", nonLu: 5 },
  { id: 2, nom: "Disponibles le soir", membres: 8, dernier: "Je suis dispo mardi 19h", heure: "Hier", couleur: "#C75D3F", nonLu: 0 },
  { id: 3, nom: "Secteur Thabor / Centre", membres: 15, dernier: "Courts Thabor libres ce matin", heure: "Hier", couleur: "#2D5016", nonLu: 3 },
  { id: 4, nom: "Débutants bienvenus (30+)", membres: 6, dernier: "On organise un tournoi amical ?", heure: "Lun.", couleur: "#C75D3F", nonLu: 0 },
];

function ConversationView({ contact, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, moi: false, texte: contact.dernier || "Salut !", heure: "14:30" },
    { id: 2, moi: true, texte: "Salut ! Tu es dispo quand ?", heure: "14:31" },
  ]);
  const [showHoraires, setShowHoraires] = useState(false);
  const HORAIRES = ["Lundi 18h", "Mardi 19h", "Mercredi 18h", "Samedi 9h", "Samedi 11h", "Dimanche 10h"];

  const envoyer = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), moi: true, texte: message, heure: "maintenant" }]);
    setMessage("");
  };

  const proposerHoraire = (h) => {
    setMessages([...messages, { id: Date.now(), moi: true, texte: `📅 Je propose : ${h}`, heure: "maintenant" }]);
    setShowHoraires(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" style={{ maxWidth: "430px", margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button onClick={onClose} className="text-gray-400 font-bold text-lg">←</button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: contact.couleur }}>{contact.avatar}</div>
        <div>
          <p className="font-bold text-sm">{contact.nom}</p>
          <p className="text-xs text-gray-400">{contact.serie}</p>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.moi ? "justify-end" : "justify-start"}`}>
            <div className="max-w-xs px-4 py-2 rounded-2xl text-sm"
              style={{ backgroundColor: m.moi ? "#1E5FAF" : "white", color: m.moi ? "white" : "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              {m.texte}
              <p className="text-xs mt-1 opacity-60">{m.heure}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Proposer horaire */}
      {showHoraires && (
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-500 mb-2 font-medium">Proposer un créneau :</p>
          <div className="flex gap-2 flex-wrap">
            {HORAIRES.map((h) => (
              <button key={h} onClick={() => proposerHoraire(h)}
                className="px-3 py-1 rounded-full text-xs font-medium border"
                style={{ borderColor: "#1E5FAF", color: "#1E5FAF" }}>
                {h}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-center">
        <button onClick={() => setShowHoraires(!showHoraires)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: showHoraires ? "#1E5FAF" : "#F3F4F6" }}>
          <Clock size={16} style={{ color: showHoraires ? "white" : "#6B7280" }} />
        </button>
        <input value={message} onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          placeholder="Écrire un message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" />
        <button onClick={envoyer}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#1E5FAF" }}>
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}

export default function MessagesScreen() {
  const [demandes, setDemandes] = useState(DEMANDES);
  const [convActive, setConvActive] = useState(null);
  const [onglet, setOnglet] = useState("messages");

  const accepter = (id) => setDemandes(demandes.filter((d) => d.id !== id));
  const refuser = (id) => setDemandes(demandes.filter((d) => d.id !== id));

  if (convActive) return <ConversationView contact={convActive} onClose={() => setConvActive(null)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-black" style={{ fontFamily: "Archivo Black, sans-serif" }}>Messages</h1>
        <div className="flex gap-1 mt-3">
          {["messages", "groupes"].map((o) => (
            <button key={o} onClick={() => setOnglet(o)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: onglet === o ? "#1E5FAF" : "#F3F4F6", color: onglet === o ? "white" : "#6B7280" }}>
              {o === "messages" ? "💬 Messages" : "👥 Groupes"}
            </button>
          ))}
        </div>
      </div>

      {onglet === "messages" && (
        <div className="pb-24">
          {/* Demandes */}
          {demandes.length > 0 && (
            <div className="px-4 mt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Demandes de match ({demandes.length})
              </p>
              <div className="flex flex-col gap-2">
                {demandes.map((d) => (
                  <div key={d.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: d.couleur }}>{d.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{d.nom}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: "#EFF6FF", color: "#1E5FAF" }}>{d.serie}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{d.message}</p>
                        <p className="text-xs text-gray-400">{d.heure}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => refuser(d.id)}
                        className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 flex items-center justify-center gap-1">
                        <X size={14} /> Refuser
                      </button>
                      <button onClick={() => accepter(d.id)}
                        className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1"
                        style={{ backgroundColor: "#1E5FAF" }}>
                        <Check size={14} /> Accepter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversations */}
          <div className="px-4 mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Conversations</p>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {CONVERSATIONS.map((conv, i) => (
                <div key={conv.id}
                  onClick={() => setConvActive(conv)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all"
                  style={{ borderBottom: i < CONVERSATIONS.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: conv.couleur }}>{conv.avatar}</div>
                    {conv.nonLu > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                        {conv.nonLu}
                      </div>
                    )}
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
          </div>
        </div>
      )}

      {onglet === "groupes" && (
        <div className="px-4 mt-4 pb-24">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tes groupes ({GROUPES.length})</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {GROUPES.map((g, i) => (
              <div key={g.id}
                onClick={() => setConvActive({ ...g, avatar: g.nom[0] + g.nom[1], serie: `${g.membres} membres`, dernier: g.dernier })}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all"
                style={{ borderBottom: i < GROUPES.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: g.couleur }}>
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