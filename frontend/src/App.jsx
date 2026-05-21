import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Plus, MessageSquare, User, Sparkles, Settings, Crown, X, Check } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumEmail, setPremiumEmail] = useState('');
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumSuccess, setPremiumSuccess] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubscribe = async () => {
    if (!premiumEmail.includes('@')) return;
    setPremiumLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: premiumEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPremium(true);
        setPremiumSuccess(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⭐ ${data.message}\n\nVos avantages Premium :\n${data.features.map(f => `• ${f}`).join('\n')}`
        }]);
        setTimeout(() => setShowPremiumModal(false), 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Erreur de réseau : Vérifiez que l\'API backend est en cours d\'exécution (Docker).' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#212121] text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-[260px] bg-[#171717] px-3 py-4 border-r border-white/5">
        <button className="flex items-center gap-3 bg-transparent hover:bg-[#2f2f2f] transition-colors p-3 rounded-lg border border-white/10 text-sm font-medium w-full text-left">
          <Plus size={16} />
          Nouveau Chat
        </button>

        {/* Bouton Premium */}
        <button
          onClick={() => { setShowPremiumModal(true); setPremiumSuccess(false); }}
          className={`mt-3 flex items-center gap-3 p-3 rounded-lg text-sm font-medium w-full text-left transition-colors border ${
            isPremium
              ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
              : 'bg-transparent border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10'
          }`}
        >
          <Crown size={16} />
          {isPremium ? 'Abonné Premium ✓' : 'Passer Premium'}
        </button>
        
        <div className="flex-1 overflow-y-auto mt-6 space-y-2">
          <p className="text-xs text-gray-500 font-semibold px-3 mb-3">Aujourd'hui</p>
          <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg bg-[#2f2f2f] text-sm truncate">
            <MessageSquare size={16} className="shrink-0 text-gray-400" />
            <span className="truncate text-gray-200">Session TP DevOps</span>
          </button>
        </div>

        <div className="mt-auto border-t border-white/5 pt-4">
          <button className="flex items-center gap-3 hover:bg-[#2f2f2f] p-3 rounded-lg text-sm font-medium w-full text-left transition-colors">
            <Settings size={16} className="text-gray-400" />
            Paramètres
          </button>
        </div>
      </div>

      {/* Zone Principale */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header Mobile / Top bar */}
        <header className="flex items-center justify-between p-3 border-b border-white/5 text-gray-300 md:px-6">
          <button className="md:hidden p-2 hover:bg-white/5 rounded-md">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 mx-auto md:mx-0 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
            <span className="font-semibold text-sm">DevOpsGPT</span>
            {isPremium ? (
              <span className="text-xs bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-400 font-semibold flex items-center gap-1">
                <Crown size={10} /> Premium
              </span>
            ) : (
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400 font-medium">3.5</span>
            )}
          </div>
          <div className="w-8 md:hidden"></div>
        </header>

        {/* Zone des messages */}
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full flex flex-col pb-32">
            {messages.length === 1 && (
               <div className="flex flex-col items-center justify-center mt-32 opacity-40">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-2xl font-bold">Comment puis-je vous aider ?</h2>
               </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-4 px-4 py-6 md:px-6 group">
                <div className="shrink-0 pt-1">
                  {msg.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-full bg-green-600/90 flex items-center justify-center border border-green-500/30">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <User size={16} className="text-gray-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1 text-gray-400">
                    {msg.role === 'assistant' ? 'DevOpsGPT' : 'Vous'}
                  </p>
                  <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed text-[15px]">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 px-4 py-6 md:px-6">
                 <div className="shrink-0 pt-1">
                    <div className="w-8 h-8 rounded-full bg-green-600/50 flex items-center justify-center border border-green-500/30 animate-pulse">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Zone de saisie (fixée en bas) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6 pb-6 px-4 md:px-6">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative bg-[#2f2f2f] rounded-2xl border border-white/10 shadow-lg focus-within:border-white/20 focus-within:bg-[#343434] transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message à DevOpsGPT..."
                className="w-full bg-transparent text-gray-100 py-4 pl-4 pr-12 focus:outline-none placeholder-gray-500 rounded-2xl"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-white/10"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3 font-medium">
              DevOpsGPT peut faire des erreurs. C'est un outil d'évaluation pour votre TP Docker & CI/CD.
            </p>
          </div>
        </div>

      </div>

      {/* Modal Premium */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2f2f2f] rounded-2xl border border-yellow-500/30 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Abonnement Premium</h2>
              </div>
              <button onClick={() => setShowPremiumModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {premiumSuccess ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Check size={28} className="text-yellow-400" />
                </div>
                <p className="text-yellow-400 font-semibold">Premium activé !</p>
              </div>
            ) : (
              <>
                <ul className="space-y-2 mb-6">
                  {['Réponses illimitées', 'Accès GPT-4', 'Support prioritaire'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={14} className="text-yellow-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <input
                  type="email"
                  value={premiumEmail}
                  onChange={e => setPremiumEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full bg-[#212121] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 mb-3"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={premiumLoading || !premiumEmail.includes('@')}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Crown size={16} />
                  {premiumLoading ? 'Activation...' : 'Activer Premium'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
