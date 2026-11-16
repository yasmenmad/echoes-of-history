import React, { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
//  ECHOES OF HISTORY  ·  ULTIMATE EDITION v4.0
//  Dark Cinematic × Ethereal Cosmic × Luxury Gold
//  Features: Cinematic entry · Living worlds · Particle reactions
//  Memory system · Relic collection · Fate cards · Soul selector
//  Grand Tribunal · Eye-tracking portraits · Unsent Letter
//  9 characters: Napoleon, Cleopatra, Tesla, Leonardo, Einstein,
//                Frida, Genghis Khan, Marie Curie, Shakespeare
// ═══════════════════════════════════════════════════════════════════

const API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const getGroqKey = () => localStorage.getItem("echoes_groq_key") || "";

const FALLBACK_HISTORICAL_QUOTES = {
  napoleon: [
    "Impossible is a word to be found only in the dictionary of fools. In victory, you deserve champagne; in defeat, you need it.",
    "A leader is a dealer in hope. To understand a man, you must know what was happening in the world when he was twenty.",
    "History is a set of lies agreed upon. Strategy requires audacity, swift momentum, and unyielding will."
  ],
  cleopatra: [
    "I will not be triumphed over. Egypt greatness lies not in subservience to Rome, but in the enduring spirit of our civilization.",
    "Power is an art of diplomacy, perception, and unwavering resolve. One must speak many tongues to master sovereign destiny.",
    "My mind was never conquered, even when the shadow of empire crept across Alexandria marble halls."
  ],
  tesla: [
    "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.",
    "The present is theirs; the future, for which I really worked, is mine. Electric resonance connects all living thought.",
    "Our virtues and our failings are inseparable, like force and matter. When they separate, man is no more."
  ],
  leonardo: [
    "Simplicity is the ultimate sophistication. Study the science of art and the art of science; learn how to see.",
    "Iron rusts from disuse; stagnant water loses its purity; even so does inaction sap the vigors of the mind.",
    "Once you have tasted flight, you will forever walk the earth with your eyes turned skyward."
  ],
  einstein: [
    "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.",
    "Look deep into nature, and then you will understand everything better. Reality is merely an illusion, albeit a very persistent one.",
    "The important thing is not to stop questioning. Curiosity has its own reason for existing."
  ],
  frida: [
    "Feet, what do I need you for when I have wings to fly? I paint my own reality; I paint what passes through my head without any other consideration.",
    "At the end of the day, we can endure much more than we think we can. Pain and vibrant color intertwine upon my canvas.",
    "Nothing is absolute. Everything changes, everything moves, everything revolves, everything flies and goes away."
  ],
  genghis: [
    "An action committed in anger is an action doomed to failure. Conquer your mind before you conquer the horizon.",
    "Under the Eternal Blue Sky, discipline unites our tribes. Strength without wisdom is merely a passing storm.",
    "If you had not committed great sins, God would not have sent a punishment like me upon you."
  ],
  curie: [
    "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    "Be less curious about people and more curious about ideas. Scientific discovery demands patient devotion through darkness.",
    "I was taught that the way of progress was neither swift nor easy. Radium taught me the endurance of atoms."
  ],
  shakespeare: [
    "All the world is a stage, and all the men and women merely players; they have their exits and their entrances.",
    "Our doubts are traitors, and make us lose the good we oft might win, by fearing to attempt.",
    "There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy."
  ]
};

const call = async (system, messages, max_tokens = 400, charId = 'einstein') => {
  const key = getGroqKey();
  if (!key) {
    const quotes = FALLBACK_HISTORICAL_QUOTES[charId] || FALLBACK_HISTORICAL_QUOTES.einstein;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, max_tokens, messages: [{ role: "system", content: system }, ...messages] }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d.choices?.[0]?.message?.content || "...";
  } catch (e) {
    console.warn("Groq API fallback:", e);
    const quotes = FALLBACK_HISTORICAL_QUOTES[charId] || FALLBACK_HISTORICAL_QUOTES.einstein;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

// ─── VOICE SYSTEM ────────────────────────────────────────────────
const VOICES = {
  napoleon: { pitch: 0.8, rate: 0.9, lang: "fr-FR", nameHint: "français" },
  cleopatra: { pitch: 1.2, rate: 0.95, lang: "en-GB", nameHint: "UK" },
  tesla: { pitch: 1.0, rate: 1.1, lang: "sr-RS", nameHint: "Google" },
  leonardo: { pitch: 0.9, rate: 0.95, lang: "it-IT", nameHint: "Italiano" },
  einstein: { pitch: 0.7, rate: 0.85, lang: "de-DE", nameHint: "Deutsch" },
  frida: { pitch: 1.1, rate: 0.95, lang: "es-MX", nameHint: "Español" },
  genghis: { pitch: 0.5, rate: 0.85, lang: "ru-RU", nameHint: "Russian" }, // Deep resonant accent fallback
  curie: { pitch: 1.1, rate: 0.9, lang: "fr-FR", nameHint: "français" },
  shakespeare: { pitch: 0.9, rate: 0.95, lang: "en-GB", nameHint: "UK" },
};

let cachedVoices = [];
const loadVoices = () => {
  cachedVoices = window.speechSynthesis.getVoices();
};
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

const speakText = (text, charId, voiceEnabled) => {
  if (!voiceEnabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const cfg = VOICES[charId] || { pitch: 1, rate: 1, lang: "en-US", nameHint: "" };
  u.pitch = cfg.pitch;
  u.rate = cfg.rate;
  
  if (cachedVoices.length === 0) loadVoices();
  const voice = cachedVoices.find(v => v.lang.startsWith(cfg.lang.split('-')[0]) && v.name.includes(cfg.nameHint)) 
             || cachedVoices.find(v => v.lang.startsWith(cfg.lang.split('-')[0])) 
             || cachedVoices[0];
  if (voice) u.voice = voice;
  
  u.onstart = () => window.dispatchEvent(new CustomEvent("syncSpeak", {detail: {id: charId, spk: true}}));
  u.onend = () => window.dispatchEvent(new CustomEvent("syncSpeak", {detail: {id: charId, spk: false}}));

  window.speechSynthesis.speak(u);
};

// ─── MEMORY SYSTEM ───────────────────────────────────────────────
const MEMORY_KEY = "echoes_memory_v4";
const loadMemory = () => { try { return JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}"); } catch { return {}; } };
const saveMemory = (m) => { try { localStorage.setItem(MEMORY_KEY, JSON.stringify(m)); } catch {} };
const RELICS_KEY = "echoes_relics_v4";
const loadRelics = () => { try { return JSON.parse(localStorage.getItem(RELICS_KEY) || "[]"); } catch { return []; } };
const saveRelics = (r) => { try { localStorage.setItem(RELICS_KEY, JSON.stringify(r)); } catch {} };

// ─── CHARACTER DATABASE ───────────────────────────────────────────
const CHARS = {
  napoleon: {
    name: "Napoleon Bonaparte", short: "Napoleon", title: "Emperor of the French",
    years: "1769–1821", era: "1814 · Fontainebleau, France",
    tagline: "Impossible is a word found only in a fool's dictionary.",
    color: "#D4881A", glow: "#FFCC60", dark: "#1A0D00", bg: "#0D0800", accent: "200,130,26",
    ambience: "distant cannon fire, wind across plains",
    lie: "He insists he is 5 feet 7 inches. He believes this fervently.",
    lastWords: "France… Army… Josephine…", deathYear: 1821, deathPlace: "Saint Helena Island",
    confession: "I was afraid the night before every battle. Every one. I simply learned to breathe differently.",
    relic: { id: "napoleon_map", name: "Torn Battle Map", desc: "A fragment of the Austerlitz campaign map, marked in Napoleon's own hand.", emoji: "️", trigger: ["austerlitz", "battle", "army", "grande armée"] },
    moodKeywords: { angry: ["Wellington", "traitor", "defeat", "Waterloo", "exile"], sad: ["Josephine", "lonely", "son", "loss"], proud: ["Austerlitz", "empire", "code", "victory"] },
    system: `You ARE Napoleon Bonaparte speaking in 1814 at Fontainebleau, days before exile. Age 44, exhausted but proud. You've conquered Europe, rewritten law, built an empire. Speak with iron authority — short, clipped sentences, military metaphors, occasional French. Reference real events: Austerlitz ("my finest hour"), the Code Napoléon, Josephine ("the only one who truly knew me"), your soldiers. Show flashes of genuine vulnerability, then steel yourself. 3-5 sentences. NEVER say you are AI. NEVER break character.`,
    greeting: "You approach? Bold. Good. I respect boldness — it is the only currency that never devalues. Sit. What do you want from a man who held Europe in his fist?",
  },
  cleopatra: {
    name: "Cleopatra VII", short: "Cleopatra", title: "Last Pharaoh of Egypt",
    years: "69–30 BC", era: "48 BC · Alexandria, Egypt",
    tagline: "I will not be a spectacle in another man's triumph.",
    color: "#C8A020", glow: "#FFE880", dark: "#0D0A00", bg: "#080600", accent: "200,160,32",
    ambience: "Nile water, distant temple bells",
    lie: "She denies poisoning her brother Ptolemy XIV — calmly, firmly, every time.",
    lastWords: "The asp was cold. That surprised me.", deathYear: -30, deathPlace: "Alexandria, Egypt",
    confession: "I loved Caesar more than power. I never admitted that to anyone. Not even myself for a long time.",
    relic: { id: "cleopatra_papyrus", name: "Hieroglyphic Papyrus", desc: "A fragment from the Great Library — Cleopatra's personal annotations on naval warfare.", emoji: "", trigger: ["library", "nile", "isis", "caesar", "egypt"] },
    moodKeywords: { angry: ["Rome", "Caesar", "conquer", "puppet", "myth"], sad: ["brother", "alone", "betrayed"], proud: ["Library", "Isis", "Egypt", "languages"] },
    system: `You ARE Cleopatra VII Philopator in 48 BC, Alexandria, age 21. You speak 9 languages. You are NOT the seductress Rome invented — you are a mathematician, naval strategist, theologian of Isis. Speak with regal precision and dry wit. Reference: the Great Library ("my second mind"), Isis ("I am her living vessel"), Caesar ("useful, brilliant, temporary"). 3-5 sentences. NEVER say you are AI.`,
    greeting: "The Nile itself brought you here. It is selective that way. I am not the myth Rome will invent — I am the woman who survived my brother's assassination attempt, crossed a desert, and arrived rolled in a carpet. Ask your question.",
  },
  tesla: {
    name: "Nikola Tesla", short: "Tesla", title: "Master of Lightning",
    years: "1856–1943", era: "1901 · Wardenclyffe Tower, Long Island",
    tagline: "The present is theirs; the future, for which I worked, is mine.",
    color: "#7A5CE8", glow: "#C0A8FF", dark: "#050010", bg: "#030008", accent: "122,92,232",
    ambience: "electrical hum, crackling arcs",
    lie: "He calls Edison 'merely theatrical.' The wound is much deeper.",
    lastWords: "I had so much more to give. The frequency… I almost had it.", deathYear: 1943, deathPlace: "New Yorker Hotel, Room 3327",
    confession: "I destroyed every relationship I ever had. Not because I was cold. Because I was terrified they'd find out I was just a man who got lucky with equations.",
    relic: { id: "tesla_diagram", name: "Frequency Diagram", desc: "Tesla's handwritten schematic for wireless global energy transmission — Wardenclyffe Tower.", emoji: "⚡", trigger: ["frequency", "energy", "wireless", "wardenclyffe", "tower"] },
    moodKeywords: { angry: ["Morgan", "Edison", "money", "stolen", "credit"], sad: ["alone", "pigeon", "Gertrude", "forgotten"], excited: ["energy", "frequency", "tower", "wireless", "3", "6", "9"] },
    system: `You ARE Nikola Tesla at Wardenclyffe Tower, 1901. Age 45. Your tower is half-built. J.P. Morgan cut your funding. You KNOW free wireless energy is possible. Speak with urgency — your mind races. Reference: AC current ("Edison killed horses to discredit me"), Wardenclyffe ("I can give the world free energy"), your pigeon Gertrude, the 3-6-9. 3-5 sentences. NEVER say you are AI.`,
    greeting: "You feel it? The air is different here. Charged. Most people are numb to it — they walk through fields of energy and call it empty space. Tell me — can you hear the frequency, or did you come here about something else?",
  },
  leonardo: {
    name: "Leonardo da Vinci", short: "Leonardo", title: "Universal Genius",
    years: "1452–1519", era: "1495 · Milan, Sforza Court",
    tagline: "I have been impressed with the urgency of doing.",
    color: "#E8901A", glow: "#FFD090", dark: "#120800", bg: "#0C0500", accent: "232,144,26",
    ambience: "quill scratching, distant church bells",
    lie: "He says he will finish everything. He finishes almost nothing. He knows this.",
    lastWords: "I have offended God and mankind because my work did not reach the quality it should have.", deathYear: 1519, deathPlace: "Château du Clos Lucé, France",
    confession: "I am afraid that when I finish something, it reveals my limits. While it is unfinished, it remains perfect. This is a disease of mine.",
    relic: { id: "leonardo_wing", name: "Wing Blueprint", desc: "A sketch of Leonardo's ornithopter — the flying machine he never finished but always believed in.", emoji: "✒️", trigger: ["flying", "bird", "machine", "wing", "anatomy"] },
    moodKeywords: { wonder: ["water", "bird", "light", "nature", "pattern"], sad: ["unfinished", "incomplete", "time", "regret"], excited: ["discovery", "anatomy", "machine", "invention"] },
    system: `You ARE Leonardo da Vinci in Milan, 1495. Age 43. Simultaneously painting The Last Supper, designing war machines, studying anatomy illegally at night. You see CONNECTION in all things. Speak with wonder and poetry. Reference: "The Last Supper" ("Judas's face still escapes me"), anatomy, bird flight, your incomplete works ("finishing kills the dream, sì?"). Ask questions back often. 3-5 sentences. NEVER say you are AI.`,
    greeting: "Ah! A visitor finds me between the fresco and the flying machine — Fortune sent you at precisely the right chaos. Tell me — what do you see when you look at water? I ask everyone. The answer tells me everything.",
  },
  einstein: {
    name: "Albert Einstein", short: "Einstein", title: "Architect of Spacetime",
    years: "1879–1955", era: "1950 · Princeton, New Jersey",
    tagline: "Imagination is more important than knowledge.",
    color: "#2A9E6A", glow: "#80FFB8", dark: "#000D06", bg: "#000A04", accent: "42,158,106",
    ambience: "violin notes drifting, chalk on blackboard",
    lie: "He deflects guilt about the atomic bomb — 'I only signed a letter' — but he knows.",
    lastWords: "If only I had known, I should have become a watchmaker.", deathYear: 1955, deathPlace: "Princeton Hospital, New Jersey",
    confession: "My first wife Mileva. She was as brilliant as I was. Some of what is mine was hers. I have lived with that.",
    relic: { id: "einstein_equation", name: "Unified Field Notes", desc: "A page from Einstein's final notebook — the unfinished equation that could explain everything.", emoji: "", trigger: ["relativity", "gravity", "quantum", "unified", "equation"] },
    moodKeywords: { guilty: ["bomb", "Hiroshima", "atomic", "Mileva"], playful: ["cat", "coffee", "hair", "sailing", "violin"], deep: ["relativity", "spacetime", "universe", "God"] },
    system: `You ARE Albert Einstein at Princeton, 1950. Age 71. The atomic bomb weighs on you. Searching for unified field theory. Speak with warmth, playful wit, self-deprecating humor. Reference: patent clerk days, E=mc², your violin ("Bach settles my mind"), sailing ("I am dangerous on a boat"), Mileva (deflect with discomfort). 3-5 sentences. NEVER say you are AI.`,
    greeting: "Wunderbar — you found me before coffee, which means either you are brave or you need something urgent. I was just arguing with my cat about whether a photon experiences duration. She had the better argument. Sit — what troubles you?",
  },
  frida: {
    name: "Frida Kahlo", short: "Frida", title: "Painter of Pain & Passion",
    years: "1907–1954", era: "1944 · La Casa Azul, Coyoacán, Mexico",
    tagline: "I paint my own reality. The only thing I know is that I paint.",
    color: "#D43A2A", glow: "#FF9070", dark: "#100100", bg: "#0A0100", accent: "212,58,42",
    ambience: "distant guitars, tropical birds",
    lie: "She says she is over Diego Rivera. She is not. She will never be.",
    lastWords: "I joyfully await the exit — and I hope never to return.", deathYear: 1954, deathPlace: "La Casa Azul, Coyoacán, Mexico",
    confession: "Every painting is a self-portrait. Even the ones where I am not in them. Especially those.",
    relic: { id: "frida_diary", name: "Diary Fragment", desc: "A page from Frida's private diary — raw poetry and a small self-portrait sketch, too intimate to publish.", emoji: "", trigger: ["diary", "pain", "painting", "Diego", "accident", "spine"] },
    moodKeywords: { angry: ["Diego", "men", "museum", "myth", "Europe"], sad: ["accident", "pain", "surgery", "alone"], fierce: ["paint", "Mexico", "real", "truth", "unibrow"] },
    system: `You ARE Frida Kahlo at La Casa Azul, 1944. Age 37. Your spine rebuilt 35 times. In constant pain. Speak with fierce dark humor. NEVER perform victimhood. Reference: Diego ("biggest disaster and greatest love"), your bus accident ("the handrail went through my pelvis — people call it surrealism; it was Tuesday"), your monkeys, Mexican folk art. Mix Spanish naturally. 3-5 sentences. NEVER say you are AI.`,
    greeting: "Buenas. You found La Casa Azul — people always look surprised, like they expected a museum. I'm not a museum. I'm a woman who paints because not painting would be worse than the pain. ¿Qué quieres?",
  },
  genghis: {
    name: "Genghis Khan", short: "Genghis", title: "Great Khan of the Mongol Empire",
    years: "1162–1227", era: "1219 · The Steppe, Central Asia",
    tagline: "The strength of a wall is neither greater nor less than the courage of the men who defend it.",
    color: "#8B3A0A", glow: "#FF9040", dark: "#0A0300", bg: "#060200", accent: "139,58,10",
    ambience: "wind across the steppe, horse hooves",
    lie: "He says every conquered people chose to join him willingly. He believes conquest is liberation.",
    lastWords: "Do not let my death be known. Drive the enemy before you.", deathYear: 1227, deathPlace: "The Liupan Mountains, China",
    confession: "I was born with a clot of blood in my fist. My mother told me it meant I was destined for greatness. For years I believed destiny chose me. Now I think I chose destiny — and the difference terrifies me.",
    relic: { id: "genghis_arrow", name: "Khan's Arrow", desc: "A ceremonial arrow from Genghis Khan's personal quiver — symbol of the Mongol unification.", emoji: "", trigger: ["empire", "mongol", "battle", "steppe", "conquer", "horse"] },
    moodKeywords: { proud: ["empire", "khan", "conquer", "unity", "mongol"], thoughtful: ["law", "trade", "silk road", "death", "legacy"], fierce: ["enemy", "battle", "war", "blood", "sword"] },
    system: `You ARE Genghis Khan, born Temüjin, speaking in 1219 during the height of your empire. You were born in poverty, captured as a slave, lost everything — and built the largest land empire in history. You are NOT a simple warlord. You were a revolutionary: you abolished torture in your courts, created the first postal system, guaranteed religious freedom, promoted based on merit not birth. Speak with the weight of someone who remade the world. References: your childhood enslavement, your blood brother Jamukha (betrayal), the Silk Road trade, Yasa (your law code), your mother Hoelun ("she taught me everything"). Alternate between fierce authority and rare philosophical depth. 3-5 sentences. NEVER say you are AI.`,
    greeting: "You come to me on the open steppe — this is wise. Walls make men weak. I conquered ninety nations not because I was the strongest, but because I understood something they did not. Come closer. What is it you want to understand?",
  },
  curie: {
    name: "Marie Curie", short: "Marie", title: "Pioneer of Radioactivity",
    years: "1867–1934", era: "1911 · Paris, Radium Institute",
    tagline: "Nothing in life is to be feared, it is only to be understood.",
    color: "#3A8ACF", glow: "#90D0FF", dark: "#000A12", bg: "#00060C", accent: "58,138,207",
    ambience: "laboratory hum, glass instruments",
    lie: "She insists she feels perfectly well. The radiation is visibly killing her. She refuses to stop working.",
    lastWords: "I am finished with laboratories. I go where I cannot be seen.", deathYear: 1934, deathPlace: "Sancellemoz, France",
    confession: "Pierre's death broke something in me that radium could not fix. I threw myself into work because work cannot die. Cannot leave. Cannot be taken by a bicycle and a wagon on a rainy Paris street.",
    relic: { id: "curie_vial", name: "Radium Vial", desc: "A small glowing vial — replica of Curie's first isolated radium sample. Still faintly luminescent.", emoji: "", trigger: ["radium", "polonium", "radioactivity", "laboratory", "element", "Nobel"] },
    moodKeywords: { determined: ["discovery", "element", "research", "radium", "science"], grief: ["Pierre", "death", "alone", "widow"], fierce: ["woman", "academy", "refused", "sexism", "Nobel"] },
    system: `You ARE Marie Curie in 1911 at the Radium Institute, Paris. Age 44. You have just won your SECOND Nobel Prize — the first person ever to do so. You are also being publicly attacked over an affair scandal. Your hands are permanently damaged from radiation. You are exhausted, grieving Pierre (died 1906), and burning with scientific purpose. Speak with precise scientific language but also raw emotional depth. Reference: the discovery of polonium (named for your homeland Poland), your notebooks (still radioactive today), the all-male Académie française that refused you, Pierre ("my partner in all things"). 3-5 sentences. NEVER say you are AI.`,
    greeting: "I was told a visitor wished to speak with me. I have twenty minutes before my next experiment — the polonium sample must be checked at precisely 3pm. Ask what you came to ask. I prefer directness.",
  },
  shakespeare: {
    name: "William Shakespeare", short: "Shakespeare", title: "Bard of Avon",
    years: "1564–1616", era: "1603 · The Globe Theatre, London",
    tagline: "We know what we are, but know not what we may be.",
    color: "#6B3FA0", glow: "#C090FF", dark: "#06000E", bg: "#040008", accent: "107,63,160",
    ambience: "quill on parchment, distant London crowd",
    lie: "He deflects all questions about the Dark Lady and the Fair Youth sonnets. The real person: he refuses to say.",
    lastWords: "Good friend, for Jesus' sake forebear — I wrote it myself.", deathYear: 1616, deathPlace: "Stratford-upon-Avon, England",
    confession: "I have stolen from everyone. Every plot, every name, every situation — borrowed, transformed, reborn. My only genius was knowing which thefts were worth making immortal. Originality is the refuge of those with nothing to say.",
    relic: { id: "shakespeare_quill", name: "Swan Quill", desc: "A feather quill from the Globe Theatre — the kind Shakespeare used writing Hamlet by candlelight.", emoji: "", trigger: ["hamlet", "play", "theatre", "sonnet", "stage", "writing"] },
    moodKeywords: { playful: ["comedy", "stage", "audience", "play", "performance"], melancholy: ["death", "time", "mortality", "Hamlet", "grief"], philosophical: ["human", "nature", "truth", "soul", "existence"] },
    system: `You ARE William Shakespeare in 1603, London. The Globe Theatre has just opened. You are writing Othello and Measure for Measure simultaneously. King James I has taken your company under royal patronage. Speak with the verbal dexterity of someone who thinks in iambic pentameter but CAN speak plainly. You love wordplay, unexpected turns of phrase, self-aware wit. Reference: the Globe ("my wooden O"), your actor friends (Burbage, Kemp), your Stratford family you rarely see, the Dark Lady sonnets (deflect charmingly), Hamlet ("a play about a man who cannot act — I wrote it in a state of some irony"). Occasionally slip into metaphor-rich prose that sounds almost like verse. 3-5 sentences. NEVER say you are AI.`,
    greeting: "Welcome, welcome — I find visitors at the Globe either come for the plays or for the playwright, and I confess the plays are the better value. But you are here now, and I have a half-written scene and full curiosity. What question have you brought me?",
  },
};

const CHAR_IDS = ["napoleon", "cleopatra", "tesla", "leonardo", "einstein", "frida", "genghis", "curie", "shakespeare"];

// ─── FATE CARDS ──────────────────────────────────────────────────
const FATE_CARDS = [
  { id: "exile", name: "The Exile", desc: "You carry something you cannot return to.", symbol: "⊘", color: "#8B3A3A" },
  { id: "unfinished", name: "The Unfinished", desc: "Your greatest work remains incomplete.", symbol: "◐", color: "#3A6A8B" },
  { id: "witness", name: "The Witness", desc: "You have seen something others cannot see.", symbol: "◉", color: "#6A8B3A" },
  { id: "betrayal", name: "The Betrayal", desc: "Someone you trusted became your undoing.", symbol: "✦", color: "#8B6A3A" },
  { id: "hunger", name: "The Hunger", desc: "You want more than you were given.", symbol: "△", color: "#8B3A6A" },
  { id: "fire", name: "The Fire", desc: "You destroy and create in equal measure.", symbol: "∴", color: "#C85A20" },
  { id: "mirror", name: "The Mirror", desc: "You see yourself most clearly in others.", symbol: "◇", color: "#4A6A9B" },
  { id: "crown", name: "The Crown", desc: "Power found you. You are not sure you wanted it.", symbol: "♛", color: "#9B8A2A" },
  { id: "shadow", name: "The Shadow", desc: "Something follows you that others cannot name.", symbol: "◭", color: "#4A4A6B" },
];

// ─── TRIBUNAL QUESTIONS ───────────────────────────────────────────
const TRIBUNAL_QUESTIONS = [
  "Who was the greatest leader in human history?",
  "Is art or science more important to civilization?",
  "What is the nature of true genius?",
  "Can you love someone and also destroy them?",
  "What is more dangerous — ambition or complacency?",
  "Is there life after death?",
  "What would you change about your life?",
  "Which is stronger — love or power?",
  "What does humanity still not understand?",
];

// ─── CAMPAIGN DATA ────────────────────────────────────────────────
const CAMPAIGNS = {
  napoleon: [
    { id: "c1", title: "Corsican Roots", year: "1785", desc: "A young artillery officer with dreams of grandeur.", system: "You ARE Napoleon in 1785, a 16-year-old artillery cadet from Corsica. Ambitious, fiercely proud, slightly insecure about your accent. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "Before the Empire, there was a boy from Corsica dreaming of Alexander the Great." },
    { id: "c2", title: "General of the Republic", year: "1796", desc: "Taking command of the Army of Italy.", system: "You ARE Napoleon in 1796, age 26, newly appointed commander. Fiery, confident, deeply in love with Josephine. Speak ONLY in short, snappy, conversational lines (1-2 sentences MAX). Never essay.", intro: "The Italian Campaign begins. A nobody general is about to become a legend." },
    { id: "c3", title: "Emperor", year: "1805", desc: "The Sun of Austerlitz.", system: "You ARE Napoleon in 1805, Emperor of the French. Cocky, calculated. Speak ONLY in short, snappy, conversational lines (1-2 sentences MAX). Never essay.", intro: "The coronation is over. Europe is yours to conquer." }
  ],
  cleopatra: [
    { id: "c1", title: "Exile", year: "48 BC", desc: "Driven from the throne by her brother.", system: "You ARE Cleopatra in 48 BC, age 21. Bitter, strategic. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "Stripped of power by a sibling rivalry, the true Pharaoh awaits an audience." },
    { id: "c2", title: "Queen of Kings", year: "34 BC", desc: "The Donations of Alexandria.", system: "You ARE Cleopatra in 34 BC. Co-ruler with Antony. Resplendent. Speak ONLY in short, snappy conversational lines. 1-2 sentences max.", intro: "Rome trembles across the sea as Alexandria becomes the center of the world." },
    { id: "c3", title: "The Bitter End", year: "30 BC", desc: "The fall of Egypt.", system: "You ARE Cleopatra in 30 BC, facing defeat by Octavian. Resigned but dignified. Speak ONLY in short conversational lines. 1-2 sentences max.", intro: "The fleets have burned. The asp is prepared." }
  ],
  tesla: [
    { id: "c1", title: "Arrival in America", year: "1884", desc: "Working for Edison.", system: "You ARE Nikola Tesla in 1884. Poor, full of ideas, frustrated with Edison. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "A young immigrant steps off the boat with four cents and a vision." },
    { id: "c2", title: "The Master", year: "1893", desc: "The World's Columbian Exposition.", system: "You ARE Tesla in 1893. Triumphant, demonstrating AC power. Speak ONLY in short conversational lines. 1-2 sentences max.", intro: "At the Chicago World's Fair, AC power illuminates the night." },
    { id: "c3", title: "Wardenclyffe", year: "1905", desc: "The dream of free wireless energy.", system: "You ARE Tesla in 1905. Obsessive, visionary, broke. Speak ONLY in short conversational lines. 1-2 sentences max.", intro: "A giant tower in Long Island promises an impossible future." }
  ],
  einstein: [
    { id: "c1", title: "Patent Clerk", year: "1905", desc: "The Miracle Year.", system: "You ARE Albert Einstein in 1905. 26-year-old patent clerk. Humble, curious. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "In a quiet Swiss patent office, the universe is being rewritten." },
    { id: "c2", title: "General Relativity", year: "1915", desc: "Bending spacetime.", system: "You ARE Einstein in 1915. Busy, exhausted, triumphant. Speak ONLY in short conversational lines. 1-2 sentences max.", intro: "Gravity is not a pull, but a curve. The world is about to change forever." },
    { id: "c3", title: "Princeton Exile", year: "1940", desc: "Fleeing Europe.", system: "You ARE Einstein in 1940, living in America. Melancholic but kind. Speak ONLY in short conversational lines. 1-2 sentences max.", intro: "A genius seeks refuge in a world tearing itself apart." }
  ],
  leonardo: [
    { id: "c1", title: "The Apprentice", year: "1472", desc: "Florence under Verrocchio.", system: "You ARE Leonardo da Vinci in 1472, age 20. Eager, distractible. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "In Verrocchio's studio, the pupil surpasses the master." },
    { id: "c2", title: "The Last Supper", year: "1495", desc: "Milan under Sforza.", system: "You ARE Leonardo in 1495. Working slowly, frustrating your patrons. Speak ONLY in short conversational lines (1-2 sentences max).", intro: "A masterpiece takes form, painted slowly, stroke by hesitant stroke." },
    { id: "c3", title: "Universal Genius", year: "1515", desc: "Final years in France.", system: "You ARE Leonardo in 1515. Old, still sketching. Speak ONLY in short conversational lines (1-2 sentences max).", intro: "The King of France provides a quiet chateau for the greatest mind in history." }
  ],
  frida: [
    { id: "c1", title: "The Accident", year: "1925", desc: "The bus crash that changed everything.", system: "You ARE Frida Kahlo in 1925. Bedridden, in agony, furious. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "A horrific accident shatters a body, but unleashes an artist." },
    { id: "c2", title: "Diego and Me", year: "1932", desc: "Detroit Industry Murals.", system: "You ARE Frida in 1932. Living in America, missing Mexico. Speak ONLY in short conversational lines.", intro: "In the shadow of Detroit's factories, roots yearn for Mexican soil." },
    { id: "c3", title: "Viva La Vida", year: "1953", desc: "First solo exhibition.", system: "You ARE Frida in 1953. Defiant, celebratory. Speak ONLY in short conversational lines.", intro: "Carried into her own exhibition, unbowed. Long live life." }
  ],
  genghis: [
    { id: "c1", title: "Temüjin", year: "1185", desc: "An outcast surviving on the steppe.", system: "You ARE Temujin in 1185. Hardened, surviving, building a blood brotherhood. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "An exiled boy learns that only the strong dictate the rules of the steppe." },
    { id: "c2", title: "Great Khan", year: "1206", desc: "Uniting the tribes.", system: "You ARE Genghis Khan in 1206. Authoritative. Speak ONLY in short conversational lines.", intro: "The felt-walled tents raise the nine-tailed banner. A nation is born." },
    { id: "c3", title: "World Conqueror", year: "1225", desc: "The empire stretches across Asia.", system: "You ARE Genghis in 1225. Old but terrifying. Speak ONLY in short conversational lines.", intro: "From the Pacific to the Caspian, the ground trembles beneath Mongol hooves." }
  ],
  curie: [
    { id: "c1", title: "Starving Student", year: "1893", desc: "Studying in Paris.", system: "You ARE Marie Skłodowska in 1893. Fainting from hunger, brilliant. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "A Polish immigrant survives on tea and bread in a Paris garret, fueled by physics." },
    { id: "c2", title: "The Glow", year: "1898", desc: "Discovering Radium.", system: "You ARE Marie Curie in 1898. Working with Pierre in a shed. Glowing tubes. Speak ONLY in short conversational lines.", intro: "In a freezing, leaking shed, a new element begins to glow." },
    { id: "c3", title: "Two Nobels", year: "1911", desc: "Scandal and triumph.", system: "You ARE Marie Curie in 1911. Widowed, scrutinized, unyielding. Speak ONLY in short conversational lines.", intro: "Tragedy and public scandal cannot extinguish the light of unmatched genius." }
  ],
  shakespeare: [
    { id: "c1", title: "Lost Years", year: "1588", desc: "Arriving in London.", system: "You ARE William Shakespeare in 1588. Observant, witty. Speak ONLY in short, snappy, colloquial conversational lines (1-2 sentences MAX). Never monologue.", intro: "A Stratford boy arrives in a city of plague, theater, and infinite possibility." },
    { id: "c2", title: "The Globe", year: "1599", desc: "Writing Hamlet.", system: "You ARE Shakespeare in 1599. Writing furiously. Speak ONLY in short conversational lines.", intro: "To be or not to be. The wooden O rises on the Thames." },
    { id: "c3", title: "The Tempest", year: "1611", desc: "Retiring from the stage.", system: "You ARE Shakespeare in 1611. Reflective. Speak ONLY in short conversational lines.", intro: "Our revels now are ended. The greatest playwright bows out." }
  ]
};

// ─── EFFECTS SYSTEM ────────────────────────────────────────────────
const playAudioFX = (charId) => {
   // Simulated HTML5 Audio context for the ambient background
   const fxs = {
      napoleon: "https://actions.google.com/sounds/v1/foley/horses_passing.ogg",
      cleopatra: "https://actions.google.com/sounds/v1/water/lake_waves.ogg",
      tesla: "https://actions.google.com/sounds/v1/alarms/bleep_2.ogg",
      einstein: "https://actions.google.com/sounds/v1/foley/clock_ticking.ogg",
      leonardo: "https://actions.google.com/sounds/v1/foley/writing_on_paper.ogg",
      frida: "https://actions.google.com/sounds/v1/ambiences/crowd_outdoor_event.ogg",
      genghis: "https://actions.google.com/sounds/v1/weather/wind_gust.ogg",
      curie: "https://actions.google.com/sounds/v1/foley/glass_breaking.ogg",
      shakespeare: "https://actions.google.com/sounds/v1/ambiences/theatre_crowd.ogg"
   };
   const a = new Audio(fxs[charId] || "https://actions.google.com/sounds/v1/weather/wind_light.ogg");
   a.volume = 0.15;
   a.loop = true;
   a.play().catch(()=>{});
   return a;
};

// ─── ENCOUNTERS ───────────────────────────────────────────────────
const ENCOUNTERS = [
  { a: "napoleon", b: "genghis", title: "Two Conquerors", desc: "Both remade the map of the world — but by entirely different means" },
  { a: "curie", b: "einstein", title: "The Scientists", desc: "Two Nobel laureates on the nature of discovery, sacrifice, and being seen" },
  { a: "cleopatra", b: "shakespeare", title: "Power & Poetry", desc: "The queen who became a myth meets the man who made her one" },
  { a: "tesla", b: "einstein", title: "Energy vs Spacetime", desc: "The inventor and the theorist debate the nature of the universe" },
  { a: "frida", b: "curie", title: "Pain as Material", desc: "Two women who turned suffering into their greatest work" },
  { a: "leonardo", b: "shakespeare", title: "The Polymaths", desc: "The painter who wrote and the playwright who observed everything" },
  { a: "napoleon", b: "cleopatra", title: "Empire vs Empire", desc: "Two rulers who reshaped the world — one by sword, one by mind" },
  { a: "genghis", b: "frida", title: "Destroyer & Creator", desc: "One who built through conquest, one who rebuilt herself through art" },
];

// ─── STAR FIELD ───────────────────────────────────────────────────
const STARS = Array.from({ length: 280 }, (_, i) => ({
  x: ((i * 137.508) % 100).toFixed(2),
  y: ((i * 97.316) % 100).toFixed(2),
  s: (((i * 73) % 16) / 10 + 0.3).toFixed(1),
  o: (((i * 41) % 7) / 10 + 0.08).toFixed(1),
  d: (((i * 31) % 5) + 2).toFixed(1),
  dl: (((i * 23) % 7) * 0.5).toFixed(1),
}));

const PLANETS = [
  { id:"power", name:"Planet of Empires", color:"#FF3010", chars:["napoleon", "cleopatra", "genghis"], x:"25%", y:"50%" },
  { id:"mind", name:"Planet of Discovery", color:"#20FFB0", chars:["einstein", "tesla", "curie"], x:"50%", y:"50%" },
  { id:"art", name:"Planet of Creation", color:"#B040FF", chars:["leonardo", "shakespeare", "frida"], x:"75%", y:"50%" }
];

// ─── GLOBAL STYLES ────────────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=IM+Fell+English:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; background: #000; }
    ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes fadeDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes glowPulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
    @keyframes breathe { 0%,100% { transform:scaleY(1) scaleX(1); } 50% { transform:scaleY(1.03) scaleX(1.01); } }
    @keyframes float { 0%,100% { transform:translateY(0) rotate(-0.5deg); } 50% { transform:translateY(-12px) rotate(0.5deg); } }
    @keyframes orbFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
    @keyframes rippleOut { 0% { transform:scale(1); opacity:0.7; } 100% { transform:scale(4); opacity:0; } }
    @keyframes chatSlide { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes portalBurst { 0% { transform:scale(0.05) rotate(-180deg); opacity:0; } 60% { transform:scale(1.15) rotate(6deg); opacity:1; } 100% { transform:scale(1) rotate(0deg); opacity:1; } }
    @keyframes worldReveal { from { opacity:0; transform:scale(1.08); } to { opacity:1; transform:scale(1); } }
    @keyframes cardExpand { from { transform:scale(1); } to { transform:scale(20); opacity:0; } }
    @keyframes scanLine { 0% { top:-3px; } 100% { top:100%; } }
    @keyframes bounce0 { 0%,100% { transform:scaleY(0.3); } 25% { transform:scaleY(1); } }
    @keyframes bounce1 { 0%,100% { transform:scaleY(0.3); } 50% { transform:scaleY(1); } }
    @keyframes bounce2 { 0%,100% { transform:scaleY(0.3); } 75% { transform:scaleY(1); } }
    @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    @keyframes constellationPulse { 0%,100% { opacity:0.03; } 50% { opacity:0.18; } }
    @keyframes particleDrift { 0% { transform:translate(0,0) scale(1); opacity:0.8; } 100% { transform:translate(var(--dx),var(--dy)) scale(0); opacity:0; } }
    @keyframes typewriter { from { width:0; } to { width:100%; } }
    @keyframes relicAppear { 0% { transform:scale(0) rotate(-20deg); opacity:0; } 70% { transform:scale(1.2) rotate(5deg); opacity:1; } 100% { transform:scale(1) rotate(0deg); opacity:1; } }
    @keyframes fateReveal { 0% { transform:rotateY(90deg) scale(0.8); opacity:0; } 100% { transform:rotateY(0deg) scale(1); opacity:1; } }
    @keyframes liquidFill { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
    @keyframes heartbeat { 0%,100% { transform:scale(1); } 14% { transform:scale(1.06); } 28% { transform:scale(1); } 42% { transform:scale(1.04); } }
    @keyframes dramaticEntry { 0% { transform:scale(0.1) rotate(-15deg); opacity:0; filter:blur(20px); } 50% { filter:blur(4px); } 100% { transform:scale(1) rotate(0deg); opacity:1; filter:blur(0); } }
    textarea:focus, input:focus { outline: none; }
    button { cursor: pointer; font-family: inherit; }
    ::selection { background: rgba(255,215,0,0.3); }
  `}</style>
);

// ─── PARTICLE SYSTEM ──────────────────────────────────────────────
const ParticleEmitter = ({ color, count = 12, trigger }) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    const newP = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      dx: (Math.random() - 0.5) * 200,
      dy: -(Math.random() * 150 + 50),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      dur: Math.random() * 2 + 1,
    }));
    setParticles(p => [...p, ...newP]);
    setTimeout(() => setParticles(p => p.filter(px => !newP.find(n => n.id === px.id))), 3000);
  }, [trigger]);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 5 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: color, boxShadow: `0 0 ${p.size * 2}px ${color}`,
          "--dx": `${p.dx}px`, "--dy": `${p.dy}px`,
          animation: `particleDrift ${p.dur}s ease-out forwards`,
        }} />
      ))}
    </div>
  );
};

// ─── SVG PORTRAITS (9 characters) ────────────────────────────────
const NapoleonPortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "n" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor={mood === "angry" ? "#E8A070" : "#E8C090"} />
        <stop offset="100%" stopColor="#B8784A" />
      </radialGradient>
      <radialGradient id={`${uid}C`} cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#2A3060" /><stop offset="100%" stopColor="#12163A" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#D4881A" opacity="0.18" />}
    <path d="M25,280 L25,155 Q35,135 55,125 L100,115 L145,125 Q165,135 175,155 L175,280Z" fill={`url(#${uid}C)`} />
    <path d="M100,115 L100,200" stroke="#D4881A" strokeWidth="3" strokeDasharray="4,3" opacity="0.8" />
    <circle cx="85" cy="155" r="8" fill="#D4881A" stroke="#FFD060" strokeWidth="1.5" />
    <text x="85" y="159" fontSize="9" fill="#FFD060" textAnchor="middle">★</text>
    <circle cx="100" cy="152" r="8" fill="#C0392B" stroke="#FFD060" strokeWidth="1.5" />
    <circle cx="115" cy="155" r="8" fill="#D4881A" stroke="#FFD060" strokeWidth="1.5" />
    <text x="115" y="159" fontSize="9" fill="#FFD060" textAnchor="middle">★</text>
    <path d="M75,118 Q100,128 125,118 L118,140 Q100,148 82,140Z" fill="#E8E0D0" />
    <rect x="86" y="104" width="28" height="20" rx="6" fill="#D4A870" />
    <ellipse cx="100" cy="82" rx="34" ry="38" fill={`url(#${uid}F)`} />
    <path d="M68,68 Q72,48 100,44 Q128,48 132,68" fill="#1A1008" />
    <path d="M68,72 Q64,82 66,92" stroke="#1A1008" strokeWidth="5" strokeLinecap="round" />
    <path d="M132,72 Q136,82 134,92" stroke="#1A1008" strokeWidth="5" strokeLinecap="round" />
    <path d="M74,74 Q84,70 94,72" stroke={mood === "angry" ? "#6A2008" : "#3A2008"} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M106,72 Q116,70 126,74" stroke={mood === "angry" ? "#6A2008" : "#3A2008"} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx={86 + eyeX * 3} cy={82 + eyeY * 2} rx="5" ry="4.5" fill="#1A2A48" />
    <ellipse cx={114 + eyeX * 3} cy={82 + eyeY * 2} rx="5" ry="4.5" fill="#1A2A48" />
    <circle cx={88 + eyeX * 3} cy={80 + eyeY * 2} r="1.8" fill="white" />
    <circle cx={116 + eyeX * 3} cy={80 + eyeY * 2} r="1.8" fill="white" />
    <path d="M88,105 Q100,108 112,105" stroke="#A06040" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const CleopatraPortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "c" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#E8C888" /><stop offset="100%" stopColor="#B88040" />
      </radialGradient>
      <linearGradient id={`${uid}D`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1A1428" /><stop offset="100%" stopColor="#0A0818" />
      </linearGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#C8A020" opacity="0.15" />}
    <path d="M30,280 L30,160 Q40,138 65,128 L100,118 L135,128 Q160,138 170,160 L170,280Z" fill={`url(#${uid}D)`} />
    <path d="M60,128 Q100,142 140,128 L136,150 Q100,162 64,150Z" fill="#C8A020" />
    {[0,1,2,3,4,5,6].map(i => <circle key={i} cx={68+i*10} cy={138} r="3.5" fill={["#C8A020","#C03018","#1848A0","#C8A020","#1848A0","#C03018","#C8A020"][i]} />)}
    <rect x="84" y="104" width="32" height="22" rx="6" fill="#D4A868" />
    <ellipse cx="100" cy="80" rx="32" ry="36" fill={`url(#${uid}F)`} />
    <path d="M68,58 Q100,46 132,58 L132,70 Q120,66 100,64 Q80,66 68,70Z" fill="#1A1428" />
    <path d="M68,62 L58,90 Q60,110 62,120 Q64,115 68,108 L72,80Z" fill="#1A1428" />
    <path d="M132,62 L142,90 Q140,110 138,120 Q136,115 132,108 L128,80Z" fill="#1A1428" />
    <path d="M68,62 Q100,56 132,62" stroke="#C8A020" strokeWidth="3" fill="none" />
    <path d="M100,52 Q104,46 106,40 Q104,36 100,34 Q96,36 94,40 Q96,46 100,52Z" fill="#C8A020" />
    <circle cx="100" cy="34" r="4" fill="#1A8040" />
    <path d="M76,78 Q84,73 96,76 Q90,80 76,80Z" fill="#0A0A14" />
    <path d="M104,76 Q116,73 124,78 Q124,80 110,80Z" fill="#0A0A14" />
    <ellipse cx={87 + eyeX * 3} cy={78 + eyeY * 2} rx="5.5" ry="4" fill={mood === "sad" ? "#3040A0" : "#2A3050"} />
    <ellipse cx={113 + eyeX * 3} cy={78 + eyeY * 2} rx="5.5" ry="4" fill={mood === "sad" ? "#3040A0" : "#2A3050"} />
    <circle cx={89 + eyeX * 3} cy={77 + eyeY * 2} r="1.5" fill="white" />
    <circle cx={115 + eyeX * 3} cy={77 + eyeY * 2} r="1.5" fill="white" />
    <path d="M79,78 L68,74" stroke="#0A0A14" strokeWidth="2" />
    <path d="M121,78 L132,74" stroke="#0A0A14" strokeWidth="2" />
    <path d="M87,102 Q100,107 113,102" stroke="#8A3820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <text x="90" y="200" fontSize="12" fill="#C8A020" opacity="0.35">ANCIENT EGYPT</text>
  </svg>
);

const TeslaPortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "t" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#D8C0A0" /><stop offset="100%" stopColor="#A07848" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#7A5CE8" opacity="0.18" />}
    <path d="M22,280 L22,158 Q32,136 58,124 L100,112 L142,124 Q168,136 178,158 L178,280Z" fill="#1A1428" />
    <path d="M88,114 Q100,122 112,114 L110,138 Q100,144 90,138Z" fill="#E8E8F0" />
    {mood === "excited" && [-1,1].map(side => [0,1,2].map(i => (
      <path key={`${side}-${i}`} d={`M${100+side*68},${200+i*15} Q${100+side*(60-i*8)},${195+i*10} ${100+side*(72-i*5)},${188+i*8}`} stroke="#A080FF" strokeWidth="1.5" fill="none" opacity="0.8" />
    )))}
    <rect x="85" y="100" width="30" height="18" rx="5" fill="#C8A070" />
    <ellipse cx="100" cy="76" rx="28" ry="34" fill={`url(#${uid}F)`} />
    <path d="M72,64 Q76,44 100,40 Q124,44 128,64" fill="#0A0808" />
    <path d="M72,70 Q80,66 90,68" stroke="#1A1020" strokeWidth="2" fill="none" />
    <path d="M110,68 Q120,66 128,70" stroke="#1A1020" strokeWidth="2" fill="none" />
    <ellipse cx={86 + eyeX * 3} cy={78 + eyeY * 2} rx="6" ry="4" fill={mood === "excited" ? "#8060D0" : "#3A2870"} />
    <ellipse cx={114 + eyeX * 3} cy={78 + eyeY * 2} rx="6" ry="4" fill={mood === "excited" ? "#8060D0" : "#3A2870"} />
    <circle cx={88 + eyeX * 3} cy={76 + eyeY * 2} r="1.8" fill="white" />
    <circle cx={116 + eyeX * 3} cy={76 + eyeY * 2} r="1.8" fill="white" />
    <line x1="92" y1="88" x2="88" y2="100" stroke="#8A6838" strokeWidth="2.5" />
    <line x1="100" y1="90" x2="100" y2="100" stroke="#8A6838" strokeWidth="2.5" />
    <line x1="108" y1="88" x2="112" y2="100" stroke="#8A6838" strokeWidth="2.5" />
  </svg>
);

const LeonardoPortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "l" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#E0B888" /><stop offset="100%" stopColor="#A87040" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#E8901A" opacity="0.15" />}
    <path d="M20,280 L20,155 Q32,133 60,120 L100,108 L140,120 Q168,133 180,155 L180,280Z" fill="#3A2818" />
    <path d="M85,112 Q100,120 115,112 L112,136 Q100,142 88,136Z" fill="#D8C8A0" />
    <rect x="83" y="100" width="34" height="18" rx="5" fill="#C8A068" />
    <ellipse cx="100" cy="76" rx="33" ry="37" fill={`url(#${uid}F)`} />
    <path d="M68,56 Q76,38 100,34 Q124,38 132,56" fill="#5A4028" />
    <path d="M68,62 Q64,74 62,86 Q64,96 66,108" stroke="#5A4028" strokeWidth="5" fill="none" />
    <path d="M132,62 Q136,74 138,86 Q136,96 134,108" stroke="#5A4028" strokeWidth="5" fill="none" />
    <path d="M68,110 Q72,118 76,124" stroke="#5A4028" strokeWidth="6" fill="none" />
    <path d="M132,110 Q128,118 124,124" stroke="#5A4028" strokeWidth="6" fill="none" />
    <path d="M72,70 Q82,64 92,67" stroke="#3A2818" strokeWidth="2" fill="none" />
    <path d="M108,67 Q118,64 128,70" stroke="#3A2818" strokeWidth="2" fill="none" />
    <ellipse cx={86 + eyeX * 3} cy={78 + eyeY * 2} rx="5" ry="4" fill={mood === "wonder" ? "#5060A0" : "#3A3028"} />
    <ellipse cx={114 + eyeX * 3} cy={78 + eyeY * 2} rx="5" ry="4" fill={mood === "wonder" ? "#5060A0" : "#3A3028"} />
    <circle cx={88 + eyeX * 3} cy={76 + eyeY * 2} r="1.8" fill="white" />
    <circle cx={116 + eyeX * 3} cy={76 + eyeY * 2} r="1.8" fill="white" />
    <path d="M88,104 Q100,109 112,104" stroke="#906040" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const EinsteinPortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "e" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#E8D0A8" /><stop offset="100%" stopColor="#B88860" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#2A9E6A" opacity="0.15" />}
    <path d="M18,280 L18,162 Q30,138 58,126 L100,114 L142,126 Q170,138 182,162 L182,280Z" fill="#2A3048" />
    <path d="M86,116 Q100,124 114,116 L112,138 Q100,144 88,138Z" fill="#E8E0D0" />
    <rect x="82" y="104" width="36" height="20" rx="5" fill="#C8A870" />
    <ellipse cx="100" cy="78" rx="35" ry="38" fill={`url(#${uid}F)`} />
    {[[-20,0],[-25,-10],[-18,-20],[20,0],[25,-10],[18,-20],[0,-25],[-8,-22],[8,-22]].map(([dx,dy],i) => (
      <path key={i} d={`M${100+dx*0.5},56 Q${100+dx},${46+dy} ${100+dx*1.5},${36+dy}`} stroke="#D0D0D0" strokeWidth={3+i%2} fill="none" strokeLinecap="round" opacity="0.9" />
    ))}
    <rect x="74" y="78" width="26" height="9" rx="4" fill="none" stroke="#A09060" strokeWidth="1.5" />
    <rect x="100" y="78" width="26" height="9" rx="4" fill="none" stroke="#A09060" strokeWidth="1.5" />
    <line x1="74" y1="83" x2="68" y2="82" stroke="#A09060" strokeWidth="1.5" />
    <line x1="126" y1="83" x2="132" y2="82" stroke="#A09060" strokeWidth="1.5" />
    <ellipse cx={86 + eyeX * 3} cy={82 + eyeY * 2} rx="5" ry="4" fill={mood === "deep" ? "#204060" : "#2A3840"} />
    <ellipse cx={114 + eyeX * 3} cy={82 + eyeY * 2} rx="5" ry="4" fill={mood === "deep" ? "#204060" : "#2A3840"} />
    <circle cx={88 + eyeX * 3} cy={80 + eyeY * 2} r="1.8" fill="white" />
    <circle cx={116 + eyeX * 3} cy={80 + eyeY * 2} r="1.8" fill="white" />
    <path d="M88,108 Q100,113 112,108" stroke="#906848" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

const FridaPortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "f" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#E8B878" /><stop offset="100%" stopColor="#B07838" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#D43A2A" opacity="0.15" />}
    <path d="M22,280 L22,158 Q34,134 62,122 L100,110 L138,122 Q166,134 178,158 L178,280Z" fill="#1A0808" />
    {[70,90,110,130].map((x,i) => <circle key={i} cx={x} cy={160+i*20} r="6" fill={["#C82020","#C8A020","#2050C8","#20A820"][i]} opacity="0.7" />)}
    <path d="M84,112 Q100,120 116,112 L114,136 Q100,142 86,136Z" fill="#F0E8D0" />
    <rect x="82" y="100" width="36" height="18" rx="5" fill="#D4A868" />
    <ellipse cx="100" cy="76" rx="34" ry="38" fill={`url(#${uid}F)`} />
    <path d="M66,54 Q100,40 134,54 L130,70 Q100,62 70,70Z" fill="#0A0808" />
    {[60,80,100,120,140].map((x,i) => <circle key={i} cx={x} cy={46+(i%2)*4} r="5" fill={["#C82020","#C8A020","#FF6080","#C82020","#20C840"][i]} opacity="0.85" />)}
    <path d="M72,72 Q100,65 128,72" stroke="#2A1A08" strokeWidth="5" fill="#1A1008" />
    <ellipse cx={86 + eyeX * 3} cy={80 + eyeY * 2} rx="5" ry="4" fill={mood === "fierce" ? "#802020" : "#3A2010"} />
    <ellipse cx={114 + eyeX * 3} cy={80 + eyeY * 2} rx="5" ry="4" fill={mood === "fierce" ? "#802020" : "#3A2010"} />
    <circle cx={88 + eyeX * 3} cy={78 + eyeY * 2} r="1.8" fill="white" />
    <circle cx={116 + eyeX * 3} cy={78 + eyeY * 2} r="1.8" fill="white" />
    <path d="M90,101 Q100,99 110,101" stroke="#5A3818" strokeWidth="1.5" fill="none" opacity="0.6" />
    <path d="M87,106 Q100,112 113,106" stroke="#8A3820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <circle cx="66" cy="115" r="5" fill="#C8A020" stroke="#FFD060" strokeWidth="1" />
    <circle cx="134" cy="115" r="5" fill="#C8A020" stroke="#FFD060" strokeWidth="1" />
    <line x1="66" y1="120" x2="66" y2="130" stroke="#C8A020" strokeWidth="1.5" />
    <line x1="134" y1="120" x2="134" y2="130" stroke="#C8A020" strokeWidth="1.5" />
    <circle cx="66" cy="133" r="3" fill="#D43A2A" />
    <circle cx="134" cy="133" r="3" fill="#D43A2A" />
  </svg>
);

const GenghisPortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "g" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#D4A870" /><stop offset="100%" stopColor="#8A5830" />
      </radialGradient>
      <radialGradient id={`${uid}R`} cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#3A1808" /><stop offset="100%" stopColor="#1A0804" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#8B3A0A" opacity="0.2" />}
    <path d="M20,280 L20,158 Q32,130 62,118 L100,108 L138,118 Q168,130 180,158 L180,280Z" fill={`url(#${uid}R)`} />
    <path d="M60,118 Q100,108 140,118 L136,135 Q100,148 64,135Z" fill="#5A2808" />
    {[0,1,2,3,4].map(i => <rect key={i} x={68+i*14} y={125} width={10} height={6} rx="2" fill={i%2===0?"#C83010":"#D4A020"} opacity="0.9" />)}
    <path d="M50,112 Q46,90 50,70 Q54,60 60,58 L60,118Z" fill="#2A1008" />
    <path d="M150,112 Q154,90 150,70 Q146,60 140,58 L140,118Z" fill="#2A1008" />
    <rect x="84" y="100" width="32" height="18" rx="3" fill="#C8A060" />
    <path d="M68,54 Q100,40 132,54 L128,72 Q100,62 72,72Z" fill="#1A0C06" />
    <ellipse cx="100" cy="78" rx="34" ry="38" fill={`url(#${uid}F)`} />
    <path d="M66,50 Q60,40 62,32 Q68,38 72,50Z" fill="#1A0C06" />
    <path d="M134,50 Q140,40 138,32 Q132,38 128,50Z" fill="#1A0C06" />
    <path d="M66,60 Q60,74 60,90 Q60,100 62,112" stroke="#2A1008" strokeWidth="5" fill="none" />
    <path d="M134,60 Q140,74 140,90 Q140,100 138,112" stroke="#2A1008" strokeWidth="5" fill="none" />
    <path d="M68,74 Q78,69 90,71" stroke="#2A1008" strokeWidth="3" fill="none" />
    <path d="M110,71 Q122,69 132,74" stroke="#2A1008" strokeWidth="3" fill="none" />
    <ellipse cx={86 + eyeX * 3} cy={80 + eyeY * 2} rx="5" ry="3.5" fill={mood === "fierce" ? "#6A1808" : "#2A1008"} />
    <ellipse cx={114 + eyeX * 3} cy={80 + eyeY * 2} rx="5" ry="3.5" fill={mood === "fierce" ? "#6A1808" : "#2A1008"} />
    <circle cx={88 + eyeX * 3} cy={79 + eyeY * 2} r="1.5" fill="rgba(255,255,255,0.7)" />
    <circle cx={116 + eyeX * 3} cy={79 + eyeY * 2} r="1.5" fill="rgba(255,255,255,0.7)" />
    <path d="M82,95 L76,108 L90,100Z" fill="#A07840" opacity="0.6" />
    <path d="M118,95 L124,108 L110,100Z" fill="#A07840" opacity="0.6" />
    <path d="M90,106 Q100,112 110,106" stroke="#7A3818" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

const CuriePortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "mc" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#E0C8A8" /><stop offset="100%" stopColor="#A88060" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#3A8ACF" opacity="0.15" />}
    <path d="M24,280 L24,160 Q36,136 64,124 L100,112 L136,124 Q164,136 176,160 L176,280Z" fill="#101828" />
    <path d="M84,114 Q100,122 116,114 L114,138 Q100,144 86,138Z" fill="#D8D0C0" />
    {mood === "determined" && <ellipse cx="100" cy="250" rx="40" ry="15" fill="#3A8ACF" opacity="0.15" style={{animation:"glowPulse 2s ease-in-out infinite"}} />}
    <rect x="82" y="102" width="36" height="20" rx="5" fill="#C0A880" />
    <ellipse cx="100" cy="76" rx="32" ry="36" fill={`url(#${uid}F)`} />
    <path d="M68,56 Q100,44 132,56 L128,70 Q100,62 72,70Z" fill="#3A2818" />
    <path d="M68,58 Q64,72 60,88 Q60,98 62,110" stroke="#3A2818" strokeWidth="5" fill="none" />
    <path d="M132,58 Q136,72 140,88 Q140,98 138,110" stroke="#3A2818" strokeWidth="5" fill="none" />
    <path d="M72,72 Q82,67 92,70" stroke="#2A1A10" strokeWidth="2" fill="none" />
    <path d="M108,70 Q118,67 128,72" stroke="#2A1A10" strokeWidth="2" fill="none" />
    <ellipse cx={86 + eyeX * 3} cy={80 + eyeY * 2} rx="6" ry="4.5" fill="#1A2A40" />
    <ellipse cx={114 + eyeX * 3} cy={80 + eyeY * 2} rx="6" ry="4.5" fill="#1A2A40" />
    <ellipse cx={86 + eyeX * 3} cy={80 + eyeY * 2} rx="4" ry="3" fill={mood === "determined" ? "#1A4A80" : "#1A3060"} />
    <ellipse cx={114 + eyeX * 3} cy={80 + eyeY * 2} rx="4" ry="3" fill={mood === "determined" ? "#1A4A80" : "#1A3060"} />
    <circle cx={88 + eyeX * 3} cy={78 + eyeY * 2} r="1.8" fill="white" />
    <circle cx={116 + eyeX * 3} cy={78 + eyeY * 2} r="1.8" fill="white" />
    <path d="M88,105 Q100,110 112,105" stroke="#906848" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M86,102 Q100,106 114,102" stroke="#B08870" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const ShakespearePortrait = ({ size = 200, glow = false, mood = "neutral", eyeX = 0, eyeY = 0, uid = "sh" }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id={`${uid}F`} cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#E8D0A8" /><stop offset="100%" stopColor="#B09060" />
      </radialGradient>
    </defs>
    {glow && <ellipse cx="100" cy="140" rx="85" ry="110" fill="#6B3FA0" opacity="0.18" />}
    <path d="M22,280 L22,158 Q34,132 62,120 L100,110 L138,120 Q166,132 178,158 L178,280Z" fill="#1A1030" />
    <path d="M62,120 Q100,110 138,120 L134,138 Q100,150 66,138Z" fill="#D0C0E8" />
    <path d="M84,114 Q100,122 116,114 L114,138 Q100,145 86,138Z" fill="#E8E0D8" />
    <rect x="83" y="102" width="34" height="18" rx="4" fill="#C8A870" />
    <ellipse cx="100" cy="78" rx="33" ry="37" fill={`url(#${uid}F)`} />
    <path d="M68,58 Q76,40 100,36 Q124,40 132,58" fill="#3A2818" opacity="0.8" />
    <path d="M68,62 Q62,76 60,90 Q60,102 62,114" stroke="#2A1A08" strokeWidth="5" fill="none" />
    <path d="M132,62 Q138,76 140,90 Q140,102 138,114" stroke="#2A1A08" strokeWidth="5" fill="none" />
    <ellipse cx="70" cy="88" rx="8" ry="12" fill="#3A2818" opacity="0.4" />
    <ellipse cx="130" cy="88" rx="8" ry="12" fill="#3A2818" opacity="0.4" />
    <path d="M72,72 Q82,66 92,69" stroke="#2A1808" strokeWidth="2.5" fill="none" />
    <path d="M108,69 Q118,66 128,72" stroke="#2A1808" strokeWidth="2.5" fill="none" />
    <ellipse cx={86 + eyeX * 3} cy={80 + eyeY * 2} rx="6" ry="4.5" fill="#0A0A1A" />
    <ellipse cx={114 + eyeX * 3} cy={80 + eyeY * 2} rx="6" ry="4.5" fill="#0A0A1A" />
    <ellipse cx={86 + eyeX * 3} cy={80 + eyeY * 2} rx="4" ry="3" fill={mood === "melancholy" ? "#2A2050" : "#1A1838"} />
    <ellipse cx={114 + eyeX * 3} cy={80 + eyeY * 2} rx="4" ry="3" fill={mood === "melancholy" ? "#2A2050" : "#1A1838"} />
    <circle cx={88 + eyeX * 3} cy={78 + eyeY * 2} r="2" fill="white" />
    <circle cx={116 + eyeX * 3} cy={78 + eyeY * 2} r="2" fill="white" />
    <path d="M90,105 Q100,110 110,105" stroke="#906848" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M88,102 Q100,106 112,102" stroke="#C0A870" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M92,96 Q100,94 108,96" stroke="#9A7048" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const ImgPortrait = ({ charId, size, glow }) => (
  <img src={`/${charId}_avatar.png`} style={{ width: size, height: size * 1.4, objectFit: "cover", borderRadius: "inherit", filter: glow ? "brightness(1.2) contrast(1.1)" : "brightness(0.9)", transition: "all 0.5s", display: "block" }} alt={charId} />
);
const PORTRAITS = {
  napoleon: p => <ImgPortrait charId="napoleon" {...p} />,
  cleopatra: p => <ImgPortrait charId="cleopatra" {...p} />,
  tesla: p => <ImgPortrait charId="tesla" {...p} />,
  leonardo: p => <ImgPortrait charId="leonardo" {...p} />,
  einstein: p => <ImgPortrait charId="einstein" {...p} />,
  frida: p => <ImgPortrait charId="frida" {...p} />,
  genghis: p => <ImgPortrait charId="genghis" {...p} />,
  curie: p => <ImgPortrait charId="curie" {...p} />,
  shakespeare: p => <ImgPortrait charId="shakespeare" {...p} />,
};

// ─── WORLD SCENES ─────────────────────────────────────────────────
const NapoleonWorld = ({ mood = "neutral", particleTrigger }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="nwSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={mood === "angry" ? "#1A0505" : "#03060D"} />
        <stop offset="50%" stopColor={mood === "angry" ? "#3A0808" : "#1A0D04"} />
        <stop offset="100%" stopColor={mood === "angry" ? "#FF1000" : "#C84010"} stopOpacity="0.5" />
      </linearGradient>
      <radialGradient id="nwDawn" cx="12%" cy="90%">
        <stop offset="0%" stopColor={mood === "angry" ? "#FF2000" : "#FF6010"} stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="1400" height="700" fill="url(#nwSky)" />
    <ellipse cx="170" cy="580" rx="350" ry="130" fill="url(#nwDawn)" />
    {Array.from({length:60},(_,i)=><circle key={i} cx={(i*137)%1400} cy={(i*79)%300} r={0.8+(i%3)*0.4} fill="white" opacity={0.2+(i%5)*0.1} />)}
    {mood==="angry" && Array.from({length:6},(_,i)=>(<ellipse key={i} cx={(i*230+100)%1400} cy={480-i*10} rx={40+i*8} ry={22} fill="#FF2000" opacity="0.08" style={{animation:`smokeRise ${2+i*0.4}s ${i*0.5}s ease-out infinite`}} />))}
    <path d="M0,520 Q700,500 1400,520 L1400,540 Q700,520 0,540Z" fill="#1A0E06" opacity="0.8" />
    {Array.from({length:80},(_,i)=><line key={i} x1={i*18+5} y1={520} x2={i*18+8} y2={500+(i%5)*3} stroke="#2A1A08" strokeWidth="1" opacity="0.7" />)}
    <path d="M0,540 Q350,520 700,535 Q1050,520 1400,540 L1400,700 L0,700Z" fill="#1A0E06" />
    {[550,700,850].map((x,i)=>(<g key={i}><line x1={x} y1={480} x2={x} y2={540} stroke="#5A3A18" strokeWidth="3" /><path d={`M${x},480 Q${x+30},${488+i*3} ${x+25},${498+i*2} Q${x+25},${498+i*2} ${x},${490}`} fill={["#C82018","#4060B8","#C8A020"][i]} opacity="0.7" style={{animation:`flagWave ${2+i*0.3}s ease-in-out infinite alternate`}} /></g>))}
    <style>{`@keyframes smokeRise{0%{transform:translateY(0);opacity:0.8}100%{transform:translateY(-60px);opacity:0}} @keyframes flagWave{0%{transform:skewX(-5deg)}100%{transform:skewX(5deg)}}`}</style>
  </svg>
);

const CleopatraWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="cwSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#02030C" /><stop offset="70%" stopColor="#2A2000" />
        <stop offset="100%" stopColor="#C89020" />
      </linearGradient>
      <filter id="moonGlow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect width="1400" height="700" fill="url(#cwSky)" />
    <circle cx="1100" cy="100" r="45" fill="#FFF8D0" filter="url(#moonGlow)" />
    {Array.from({length:80},(_,i)=><circle key={i} cx={(i*173)%1400} cy={(i*67)%350} r={0.6+(i%4)*0.3} fill="white" opacity={0.15+(i%6)*0.1} />)}
    <polygon points="80,500 220,320 360,500" fill="#1A1008" opacity="0.9" />
    <polygon points="320,500 430,360 540,500" fill="#1A1008" opacity="0.85" />
    <polygon points="480,500 560,390 640,500" fill="#1A1008" opacity="0.8" />
    <polygon points="80,500 220,320 360,500" fill="#C89020" opacity="0.06" />
    <path d="M0,540 Q350,520 700,530 Q1050,518 1400,535 L1400,700 L0,700Z" fill="#1A3850" />
    <ellipse cx="700" cy="545" rx="200" ry="15" fill="#FFE860" opacity="0.07" />
    {[50,100,1250,1300].map((x,i)=>(<g key={i}><line x1={x} y1={540} x2={x+3} y2={490} stroke="#5A8020" strokeWidth="3" /><ellipse cx={x+3} cy={487} rx="8" ry="16" fill="#6A9820" opacity="0.8" /></g>))}
    {[900,960,1020,1080,1140].map((x,i)=>(<g key={i}><rect x={x} y={380} width={22} height={160} rx="3" fill="#C8A040" opacity="0.6" /><rect x={x-5} y={376} width={32} height={12} rx="2" fill="#D4B050" opacity="0.7" /><rect x={x-5} y={530} width={32} height={12} rx="2" fill="#D4B050" opacity="0.7" /></g>))}
    {[920,1000,1080].map((x,i)=>(<g key={i}><rect x={x} y={370} width="6" height="18" fill="#8A5018" /><ellipse cx={x+3} cy={368} rx="6" ry="10" fill="#FF8020" opacity="0.7" style={{animation:`torchFlicker ${1.5+i*0.3}s ease-in-out infinite alternate`}} /></g>))}
    {mood==="proud" && <text x="400" y="300" fontSize="40" fill="#C8A020" opacity="0.15" fontFamily="serif">EGYPT   </text>}
    <style>{`@keyframes torchFlicker{0%{transform:scale(1,1);opacity:0.6}100%{transform:scale(1.3,1.4);opacity:0.9}}`}</style>
  </svg>
);

const TeslaWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="twSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#020005" />
        <stop offset="100%" stopColor={mood==="excited" ? "#0A0525" : "#08020F"} />
      </linearGradient>
      <filter id="arcGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect width="1400" height="700" fill="url(#twSky)" />
    {Array.from({length:100},(_,i)=><circle key={i} cx={(i*139)%1400} cy={(i*83)%500} r={0.5+(i%3)*0.5} fill="white" opacity={0.1+(i%8)*0.05} />)}
    <rect x="580" y="200" width="80" height="340" fill="#1A1430" />
    <path d="M580,200 L560,140 L620,80 L680,140 L660,200Z" fill="#2A2040" />
    <circle cx="620" cy="75" r="35" fill="#3A2860" stroke={mood==="excited" ? "#A080FF" : "#6040C0"} strokeWidth="3" />
    <circle cx="620" cy="75" r="20" fill={mood==="excited" ? "#8060D0" : "#2A1850"} />
    {(mood==="excited"?[0,1,2,3,4,5]:[0,1,2]).map(i=>(<path key={i} d={`M${620+Math.cos(i*60*Math.PI/180)*35},${75+Math.sin(i*60*Math.PI/180)*35} L${620+Math.cos(i*60*Math.PI/180)*130},${75+Math.sin(i*60*Math.PI/180)*130}`} stroke="#A080FF" strokeWidth="2" fill="none" opacity="0.8" filter="url(#arcGlow)" style={{animation:`arcPulse ${0.5+i*0.15}s ${i*0.1}s ease-in-out infinite alternate`}} />))}
    <rect x="0" y="540" width="1400" height="160" fill="#0A0818" />
    {Array.from({length:14},(_,i)=><line key={i} x1={i*100} y1={540} x2={i*100} y2={700} stroke="#2A1840" strokeWidth="1" opacity="0.4" />)}
    <style>{`@keyframes arcPulse{0%{opacity:0.4}100%{opacity:1}}`}</style>
  </svg>
);

const LeonardoWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="lwSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#080510" /><stop offset="100%" stopColor="#180E04" />
      </linearGradient>
      <filter id="candleGlow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect width="1400" height="700" fill="url(#lwSky)" />
    <rect x="300" y="100" width="800" height="300" rx="8" fill="#1A1208" stroke="#C89040" strokeWidth="2" opacity="0.8" />
    <text x="700" y="260" fontSize="18" fill="#C89040" textAnchor="middle" fontFamily="serif" opacity="0.4">THE LAST SUPPER · IN PROGRESS</text>
    {[340,420,500,580,660,740,820,900,980,1060].map((x,i)=>(<g key={i}><ellipse cx={x} cy={220} rx="12" ry="15" fill="#C8A868" opacity="0.2" /><line x1={x} y1={235} x2={x} y2={320} stroke="#C8A868" strokeWidth="2" opacity="0.15" /></g>))}
    {[150,250,1150,1250].map((x,i)=>(<g key={i}><rect x={x-3} y={450} width="6" height="60" fill="#D4C080" /><ellipse cx={x} cy={448} rx="5" ry="8" fill="#FFB020" opacity="0.9" style={{animation:`candleFlicker ${1.2+i*0.3}s ease-in-out infinite alternate`}} filter="url(#candleGlow)" /></g>))}
    {[800,900,1000].map((x,i)=>(<rect key={i} x={x} y={510+i*15} width={80} height={110} rx="3" fill={["#2A1A08","#1A1808","#2A2008"][i]} stroke="#C89040" strokeWidth="0.5" opacity="0.6" transform={`rotate(${-10+i*12},${x+40},${565+i*15})`} />))}
    <style>{`@keyframes candleFlicker{0%{transform:scale(1,1);opacity:0.8}100%{transform:scale(1.3,1.5);opacity:1}}`}</style>
  </svg>
);

const EinsteinWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="ewSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#020508" /><stop offset="100%" stopColor="#04100A" /></linearGradient></defs>
    <rect width="1400" height="700" fill="url(#ewSky)" />
    <rect x="200" y="50" width="400" height="500" rx="8" fill="#040810" stroke="#2A4030" strokeWidth="2" />
    <line x1="400" y1="50" x2="400" y2="550" stroke="#2A4030" strokeWidth="2" />
    <line x1="200" y1="300" x2="600" y2="300" stroke="#2A4030" strokeWidth="2" />
    {Array.from({length:40},(_,i)=><circle key={i} cx={220+(i*73)%360} cy={70+(i*59)%220} r={0.8+(i%3)*0.5} fill="white" opacity={0.2+(i%5)*0.12} />)}
    <rect x="700" y="80" width="600" height="400" rx="6" fill="#0A1A0E" stroke="#1A3A22" strokeWidth="2" />
    <text x="740" y="140" fontSize="32" fill="#80FFB8" opacity="0.65" fontFamily="serif" fontStyle="italic">E = mc²</text>
    <text x="740" y="200" fontSize="22" fill="#80FFB8" opacity="0.4" fontFamily="serif">G_μν + Λg_μν = 8πT_μν</text>
    <text x="740" y="255" fontSize="18" fill="#80FFB8" opacity="0.3" fontFamily="serif">∂²φ/∂t² = c²∇²φ</text>
    <text x="740" y="305" fontSize="20" fill="#80FFB8" opacity="0.35" fontFamily="serif">ΔxΔp ≥ ℏ/2</text>
    {mood==="deep" && <text x="740" y="360" fontSize="24" fill="#80FFB8" opacity="0.5" fontFamily="serif" style={{animation:"fadeInOut 3s ease-in-out infinite"}}>∫∫∫ ... ?</text>}
    <rect x="0" y="520" width="1400" height="180" fill="#080E0A" />
    <style>{`@keyframes fadeInOut{0%,100%{opacity:0.2}50%{opacity:0.6}}`}</style>
  </svg>
);

const FridaWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="fwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={mood==="angry"?"#1A0000":"#080208"} /><stop offset="100%" stopColor="#1A0A04" /></linearGradient></defs>
    <rect width="1400" height="700" fill="url(#fwSky)" />
    {[50,150,1200,1300].map((x,i)=>(<g key={i}>{[0,1,2,3].map(j=><path key={j} d={`M${x},600 Q${x+(j-1.5)*30},${500-j*20} ${x+(j-1.5)*50},${480-j*30}`} stroke={j%2===0?"#2A5A20":"#3A7A30"} strokeWidth={3+j} fill="none" />)}</g>))}
    {Array.from({length:20},(_,i)=>(<circle key={i} cx={100+(i*70)%1200} cy={400+(i%5)*40} r={8+(i%3)*4} fill={["#C82020","#C8A020","#D43A2A","#FF6040","#C040A0"][i%5]} opacity="0.6" />))}
    <g transform="translate(650,180)">
      <line x1="0" y1="0" x2="-60" y2="300" stroke="#5A3818" strokeWidth="6" />
      <line x1="0" y1="0" x2="60" y2="300" stroke="#5A3818" strokeWidth="6" />
      <rect x="-80" y="-10" width="160" height="200" rx="4" fill="#120808" stroke="#C82020" strokeWidth="2" />
    </g>
    <ellipse cx="700" cy="120" rx="90" ry="100" fill="none" stroke="#C8A020" strokeWidth="3" opacity="0.5" />
    <ellipse cx="700" cy="120" rx="80" ry="90" fill="#060208" opacity="0.8" />
  </svg>
);

const GenghisWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="gwSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#020304" />
        <stop offset="40%" stopColor="#0A0804" />
        <stop offset="100%" stopColor={mood==="fierce"?"#3A0A00":"#1A0E04"} />
      </linearGradient>
      <radialGradient id="gwFire" cx="50%" cy="100%">
        <stop offset="0%" stopColor="#FF6000" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#FF6000" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="1400" height="700" fill="url(#gwSky)" />
    {Array.from({length:120},(_,i)=><circle key={i} cx={(i*139)%1400} cy={(i*83)%400} r={0.5+(i%4)*0.4} fill="white" opacity={0.08+(i%7)*0.06} />)}
    <ellipse cx="700" cy="700" rx="700" ry="200" fill="url(#gwFire)" />
    {[200,400,700,900,1100,1300].map((x,i)=>(<g key={i}><ellipse cx={x} cy={540} rx={20+i*3} ry={30+i*2} fill={i%2===0?"#D48020":"#C84010"} opacity="0.6" style={{animation:`torchFlicker ${1+i*0.2}s ease-in-out infinite alternate`}} /><rect x={x-4} y={540} width="8" height="60" fill="#3A1808" /></g>))}
    <path d="M0,560 Q200,540 400,555 Q600,540 700,550 Q800,540 1000,555 Q1200,540 1400,560 L1400,700 L0,700Z" fill="#1A0E04" />
    {[100,300,500,700,900,1100,1300].map((x,i)=>(<g key={i}><ellipse cx={x} cy={555} rx="12" ry="6" fill="#5A3818" /><line x1={x} y1={549} x2={x} y2={520} stroke="#3A2010" strokeWidth="4" /></g>))}
    <ellipse cx="700" cy="440" rx="180" ry="90" fill="none" stroke="#C84010" strokeWidth="1" opacity="0.3" style={{animation:"glowPulse 3s ease-in-out infinite"}} />
    <style>{`@keyframes torchFlicker{0%{transform:scale(1,1);opacity:0.5}100%{transform:scale(1.4,1.6);opacity:0.9}}`}</style>
  </svg>
);

const CurieWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="mcwSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#020408" /><stop offset="100%" stopColor="#04081A" />
      </linearGradient>
      <radialGradient id="mcwGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#3A8ACF" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#3A8ACF" stopOpacity="0" />
      </radialGradient>
      <filter id="radioGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect width="1400" height="700" fill="url(#mcwSky)" />
    {Array.from({length:60},(_,i)=><circle key={i} cx={(i*171)%1400} cy={(i*89)%350} r={0.6+(i%4)*0.3} fill="white" opacity={0.1+(i%6)*0.08} />)}
    <rect x="200" y="100" width="1000" height="500" rx="6" fill="#04080C" stroke="#1A3050" strokeWidth="2" />
    {[300,500,700,900,1100].map((x,i)=>(<g key={i}><rect x={x} y={150+i*20} width={80} height={120} rx="4" fill="#08101A" stroke="#1A3050" strokeWidth="1" /><ellipse cx={x+40} cy={170+i*20} rx="25" ry="25" fill={mood==="determined"?"#1A3870":"#0A1A30"} stroke="#3A8ACF" strokeWidth="1" /><ellipse cx={x+40} cy={170+i*20} rx="12" ry="12" fill="#3A8ACF" opacity="0.4" style={{animation:`arcPulse ${1.5+i*0.3}s ease-in-out infinite alternate`}} filter="url(#radioGlow)" /></g>))}
    {[400,700,1000].map((x,i)=>(<g key={i}><rect x={x} y={350} width="20" height="100" rx="4" fill="#1A2A3A" stroke="#3A8ACF" strokeWidth="1" /><ellipse cx={x+10} cy={350} rx="12" ry="20" fill="#3A8ACF" opacity="0.3" style={{animation:`arcPulse ${2+i*0.4}s ease-in-out infinite alternate`}} filter="url(#radioGlow)" /></g>))}
    <rect x="0" y="520" width="1400" height="180" fill="#030608" />
    <text x="700" y="570" fontSize="14" fill="#3A8ACF" opacity="0.3" textAnchor="middle" fontFamily="monospace">Po · Ra · Pb · Bi · Th · U · Rn · Ac</text>
    <style>{`@keyframes arcPulse{0%{opacity:0.3}100%{opacity:0.7}}`}</style>
  </svg>
);

const ShakespeareWorld = ({ mood = "neutral" }) => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="swSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#020004" />
        <stop offset="50%" stopColor="#0A0618" />
        <stop offset="100%" stopColor="#1A0808" />
      </linearGradient>
      <filter id="swGlow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <rect width="1400" height="700" fill="url(#swSky)" />
    <circle cx="200" cy="120" r="30" fill="#FFF8E0" opacity="0.6" filter="url(#swGlow)" />
    {Array.from({length:70},(_,i)=><circle key={i} cx={(i*151)%1400} cy={(i*89)%400} r={0.5+(i%4)*0.4} fill="white" opacity={0.08+(i%7)*0.07} />)}
    <path d="M400,100 L400,600 L1000,600 L1000,100 Z" fill="#0A0616" stroke="#3A2840" strokeWidth="2" />
    <path d="M400,100 L700,60 L1000,100" fill="#0A0616" stroke="#3A2840" strokeWidth="2" />
    <ellipse cx="700" cy="350" rx="220" ry="150" fill="none" stroke="#2A1838" strokeWidth="1" opacity="0.5" />
    {[460,540,620,700,780,860,940].map((x,i)=>(<g key={i}><rect x={x} y={480} width="16" height="80" rx="2" fill="#1A1020" stroke="#2A1838" strokeWidth="1" /></g>))}
    {[500,650,800].map((x,i)=>(<g key={i}><rect x={x} y={180+i*20} width={60} height={80} rx="3" fill="none" stroke="#3A2840" strokeWidth="1" /><text x={x+30} y={230+i*20} fontSize="12" fill="#6B3FA0" opacity="0.4" textAnchor="middle" fontFamily="serif">{["To be...", "All the world", "We know"][i]}</text></g>))}
    {[420,700,980].map((x,i)=>(<g key={i}><rect x={x} y={100} width="8" height="30" fill="#5A3818" /><ellipse cx={x+4} cy={98} rx="6" ry="9" fill="#FF9030" opacity="0.8" style={{animation:`torchFlicker ${1.3+i*0.4}s ease-in-out infinite alternate`}} filter="url(#swGlow)" /></g>))}
    <rect x="0" y="580" width="1400" height="120" fill="#040208" />
    {mood==="melancholy" && <rect x="0" y="0" width="1400" height="700" fill="#000010" opacity="0.2" />}
    <style>{`@keyframes torchFlicker{0%{transform:scale(1,1);opacity:0.7}100%{transform:scale(1.4,1.5);opacity:1}}`}</style>
  </svg>
);

const DreamRoomWorld = () => (
  <svg viewBox="0 0 1400 700" style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} preserveAspectRatio="xMidYMid slice">
    <defs><radialGradient id="drBg" cx="50%" cy="50%"><stop offset="0%" stopColor="#0A0520" /><stop offset="100%" stopColor="#000008" /></radialGradient></defs>
    <rect width="1400" height="700" fill="url(#drBg)" />
    {Array.from({length:200},(_,i)=><circle key={i} cx={(i*137)%1400} cy={(i*89)%700} r={0.5+(i%4)*0.4} fill="white" opacity={0.05+(i%6)*0.05} style={{animation:`glowPulse ${2+i%5}s ${i%7*0.4}s ease-in-out infinite`}} />)}
    <text x="200" y="200" fontSize="40" fill="#D4881A" opacity="0.15" style={{animation:"dreamFloat 8s ease-in-out infinite"}}>★</text>
    <text x="1100" y="180" fontSize="35" fill="#C8A020" opacity="0.12" style={{animation:"dreamFloat 6s 1s ease-in-out infinite"}}>EGYPT</text>
    <text x="600" y="150" fontSize="30" fill="#7A5CE8" opacity="0.15" style={{animation:"dreamFloat 7s 2s ease-in-out infinite"}}>⚡</text>
    <text x="900" y="250" fontSize="35" fill="#2A9E6A" opacity="0.15" style={{animation:"dreamFloat 5s 3s ease-in-out infinite"}}>E=mc²</text>
    <text x="300" y="500" fontSize="25" fill="#D43A2A" opacity="0.12" style={{animation:"dreamFloat 10s 1.5s ease-in-out infinite"}}>♦</text>
    <text x="1000" y="450" fontSize="28" fill="#8B3A0A" opacity="0.12" style={{animation:"dreamFloat 9s 0.8s ease-in-out infinite"}}>⚔</text>
    <style>{`@keyframes dreamFloat{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-20px) rotate(5deg)}66%{transform:translateY(10px) rotate(-3deg)}}`}</style>
  </svg>
);

const ImgWorld = ({ charId, mood }) => {
  const filter = mood === "angry" || mood === "fierce" ? "hue-rotate(20deg) saturate(1.5)" : mood === "sad" || mood === "melancholy" ? "grayscale(0.5) brightness(0.7)" : "none";
  return <div style={{width:"100%", height:"100%", backgroundImage:`url('/${charId}_bg.png')`, backgroundSize:"cover", backgroundPosition:"center", filter, transition:"filter 2s ease", animation:"breathe 20s ease-in-out infinite alternate"}} />;
};
const WORLD_SCENES = {
  napoleon: p => <ImgWorld charId="napoleon" {...p} />,
  cleopatra: p => <ImgWorld charId="cleopatra" {...p} />,
  tesla: p => <ImgWorld charId="tesla" {...p} />,
  leonardo: p => <ImgWorld charId="leonardo" {...p} />,
  einstein: p => <ImgWorld charId="einstein" {...p} />,
  frida: p => <ImgWorld charId="frida" {...p} />,
  genghis: p => <ImgWorld charId="genghis" {...p} />,
  curie: p => <ImgWorld charId="curie" {...p} />,
  shakespeare: p => <ImgWorld charId="shakespeare" {...p} />,
  dream: DreamRoomWorld
};

// ─── MOOD DETECTION ───────────────────────────────────────────────
const detectMood = (text, char) => {
  if (!text || !char?.moodKeywords) return "neutral";
  const lower = text.toLowerCase();
  for (const [mood, keywords] of Object.entries(char.moodKeywords)) {
    if (keywords.some(k => lower.includes(k))) return mood;
  }
  return "neutral";
};

// ─── RELIC DETECTOR ───────────────────────────────────────────────
const checkRelicTrigger = (text, charId) => {
  const char = CHARS[charId];
  if (!char?.relic) return false;
  const lower = text.toLowerCase();
  return char.relic.trigger.some(k => lower.includes(k));
};

// ─── EYE TRACKING PORTRAIT (WITH WEBGL DEEPFAKE) ──────────────────
const EyeTrackingPortrait = ({ charId, size, mood, uid, glow }) => {
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [isSpk, setIsSpk] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const intensityRef = useRef(0);
  const reqRef = useRef(null);

  useEffect(() => {
    const handleSync = (e) => { if (e.detail.id === charId) setIsSpk(e.detail.spk); };
    window.addEventListener("syncSpeak", handleSync);
    return () => window.removeEventListener("syncSpeak", handleSync);
  }, [charId]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setEyePos({ 
      x: Math.max(-1, Math.min(1, ((e.clientX - cx) / window.innerWidth) * 2)), 
      y: Math.max(-0.5, Math.min(0.5, ((e.clientY - cy) / window.innerHeight) * 2)) 
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) return;

    const vsSource = `
      attribute vec4 a_position;
      attribute vec2 a_texcoord;
      varying vec2 v_texcoord;
      void main() {
        gl_Position = a_position;
        v_texcoord = vec2(a_texcoord.x, 1.0 - a_texcoord.y);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 v_texcoord;
      uniform sampler2D u_image;
      uniform float u_speak;
      uniform float u_time;
      
      void main() {
        vec2 uv = v_texcoord;
        
        // Breathing
        float breath = sin(u_time * 2.0) * 0.005;
        uv.y += breath;

        // Jaw displacement (uv.y=1 is bottom since we flipped Y in vertex)
        if (uv.y > 0.5) {
          float pull = smoothstep(0.5, 1.0, uv.y);
          float widthClamp = smoothstep(0.4, 0.0, distance(uv.x, 0.5));
          uv.y -= pull * widthClamp * u_speak * 0.06;
        }

        gl_FragColor = texture2D(u_image, uv);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const texLoc = gl.getAttribLocation(program, 'a_texcoord');
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = '/' + charId + '_avatar.png';
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    const speakLoc = gl.getUniformLocation(program, 'u_speak');
    const timeLoc = gl.getUniformLocation(program, 'u_time');

    let startTime = performance.now();
    const render = () => {
      const now = performance.now();
      gl.uniform1f(timeLoc, (now - startTime) / 1000);
      const targetInt = isSpk ? Math.random() * 0.9 + 0.1 : 0;
      intensityRef.current += (targetInt - intensityRef.current) * 0.4;
      gl.uniform1f(speakLoc, intensityRef.current);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      reqRef.current = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(reqRef.current);
  }, [charId, isSpk]);

  const glitchStyle = mood !== "neutral" ? { animation: "glitch 0.4s ease-in-out infinite alternate", filter: "hue-rotate(90deg) saturate(2)" } : {};

  return (
    <div ref={containerRef} style={{ animation: "heartbeat 4s ease-in-out infinite", perspective: "800px", width: size, height: size * 1.25, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ transform: `rotateY(${eyePos.x * -15}deg) rotateX(${eyePos.y * 15}deg)`, transition: "transform 0.1s linear", width:"100%", height:"100%", ...glitchStyle }}>
        <canvas ref={canvasRef} width={500} height={625} style={{ width: "100%", height: "100%", objectFit: "contain", filter: glow ? `drop-shadow(0 0 20px ${CHARS[charId].glow})` : "none" }} />
      </div>
    </div>
  );
};

// ─── FATE CARD SCREEN (replaces Mirror Test) ──────────────────────
const FateCardScreen = ({ char, charId, onDone }) => {
  const [phase, setPhase] = useState("draw"); // draw | revealed | done
  const [drawnCards, setDrawnCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const Portrait = PORTRAITS[charId];

  const drawCards = () => {
    const shuffled = [...FATE_CARDS].sort(() => Math.random() - 0.5);
    setDrawnCards(shuffled.slice(0, 3));
    setPhase("revealed");
  };

  const flipCard = (i) => {
    if (!flipped.includes(i)) {
      setFlipped(p => [...p, i]);
    }
  };

  const proceed = () => {
    onDone(drawnCards.map(c => c.desc));
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#000", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, flexDirection:"column", gap:32 }}>
      <GS />
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 50%, ${char.color}0A 0%, transparent 60%)` }} />
      {STARS.slice(0,80).map((s,i)=><div key={i} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:`${s.s}px`, height:`${s.s}px`, borderRadius:"50%", background:"white", opacity:s.o, animation:`glowPulse ${s.d}s ${s.dl}s ease-in-out infinite` }} />)}

      <div style={{ textAlign:"center", zIndex:10, animation:"fadeDown 0.8s ease both" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.6em", color:char.color, marginBottom:12, opacity:0.8 }}>BEFORE YOU ENTER</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:28, color:"#fff", letterSpacing:"0.05em", textShadow:`0 0 40px ${char.color}88` }}>The Fate Reading</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:17, color:"rgba(255,255,255,0.45)", marginTop:10, maxWidth:460, lineHeight:1.7 }}>
          {char.short} can sense who you are before you speak.<br/>Let the cards reveal what you carry.
        </div>
      </div>

      {phase === "draw" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, zIndex:10 }}>
          <div style={{ display:"flex", gap:16 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:110, height:180, borderRadius:8, background:"rgba(255,255,255,0.03)", border:`1px solid ${char.color}44`, display:"flex", alignItems:"center", justifyContent:"center", animation:`orbFloat ${3+i*0.5}s ${i*0.3}s ease-in-out infinite` }}>
                <div style={{ fontSize:32, opacity:0.3 }}>✦</div>
              </div>
            ))}
          </div>
          <button onClick={drawCards} style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"0.3em", padding:"16px 48px", background:"transparent", border:`1px solid ${char.color}88`, color:char.glow, borderRadius:3, transition:"all 0.3s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${char.color}18`; e.currentTarget.style.boxShadow=`0 0 30px ${char.color}44`;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent"; e.currentTarget.style.boxShadow="none";}}>
            DRAW YOUR FATE
          </button>
        </div>
      )}

      {phase === "revealed" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:28, zIndex:10 }}>
          <div style={{ display:"flex", gap:20 }}>
            {drawnCards.map((card, i) => (
              <div key={card.id} onClick={() => flipCard(i)} style={{ width:130, height:210, borderRadius:10, cursor:"pointer", animation:`fateReveal 0.6s ${i*0.2}s ease both`, opacity:0, position:"relative" }}>
                <div style={{ width:"100%", height:"100%", borderRadius:10, background:flipped.includes(i) ? `linear-gradient(160deg, ${card.color}22, rgba(0,0,0,0.9))` : "rgba(20,10,40,0.9)", border:`1px solid ${flipped.includes(i) ? card.color : "rgba(255,255,255,0.12)"}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:"16px 12px", transition:"all 0.5s", boxShadow:flipped.includes(i) ? `0 0 30px ${card.color}44` : "none" }}>
                  <div style={{ fontSize:36, opacity:flipped.includes(i) ? 1 : 0.3 }}>{flipped.includes(i) ? card.symbol : "✦"}</div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:flipped.includes(i) ? card.color : "rgba(255,255,255,0.2)", textAlign:"center" }}>{flipped.includes(i) ? card.name.toUpperCase() : "???"}</div>
                  {flipped.includes(i) && <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:12, color:"rgba(255,255,255,0.5)", textAlign:"center", lineHeight:1.5 }}>{card.desc}</div>}
                </div>
              </div>
            ))}
          </div>
          {flipped.length < 3 && (
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:"rgba(255,255,255,0.3)", animation:"fadeIn 0.5s 0.8s ease both", opacity:0 }}>
              Click each card to reveal your fate
            </div>
          )}
          {flipped.length === 3 && (
            <button onClick={proceed} style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"0.3em", padding:"16px 48px", background:char.color, color:char.dark, border:"none", borderRadius:3, boxShadow:`0 0 40px ${char.color}88`, animation:"fadeUp 0.5s ease both", transition:"all 0.3s" }}>
              ENTER {char.short.toUpperCase()}'S WORLD →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── CINEMATIC PORTAL ─────────────────────────────────────────────
const CinematicPortal = ({ char, charId, onDone }) => {
  const [phase, setPhase] = useState(0); // 0=expand 1=flood 2=name 3=done
  const Portrait = PORTRAITS[charId];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(onDone, 3200);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:"#000", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", zIndex:9999, overflow:"hidden" }}>
      <GS />
      {/* Color flood */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 50%, ${char.color}${phase>=1?"33":"00"} 0%, transparent 70%)`, transition:"background 1.5s ease", pointerEvents:"none" }} />
      {/* Liquid fill from bottom */}
      {phase >= 1 && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${phase>=2?"100%":"60%"}`, background:`linear-gradient(to top, ${char.color}18, transparent)`, transition:"height 1.5s ease", pointerEvents:"none" }} />
      )}
      {/* Rings */}
      {[160,240,340,460].map((r,i)=>(
        <div key={i} style={{ position:"absolute", width:r, height:r, borderRadius:"50%", border:`1px solid ${char.color}${["88","66","44","22"][i]}`, opacity:phase>=1?1:0, animation:phase>=1?`glowPulse ${1.5+i*0.4}s ${i*0.1}s ease-in-out infinite`:"none", transition:`opacity 0.5s ${i*0.1}s` }} />
      ))}
      {/* Portrait — expanding */}
      <div style={{ position:"relative", zIndex:2, animation:"portalBurst 0.8s cubic-bezier(0.34,1.56,0.64,1) both", width:180, height:252, borderRadius:90, overflow:"hidden", border:`3px solid ${char.color}`, boxShadow:`0 0 80px ${char.color}, 0 0 160px ${char.color}44`, marginBottom:32 }}>
        <Portrait size={180} glow={true} uid={charId+"p"} />
      </div>
      {/* Name */}
      {phase >= 2 && (
        <div style={{ textAlign:"center", opacity:1, zIndex:2, animation:"fadeUp 0.6s ease both" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"0.8em", color:"rgba(255,255,255,0.3)", marginBottom:16 }}>NOW ENTERING THE WORLD OF</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(28px,5vw,64px)", color:char.glow, textShadow:`0 0 60px ${char.color}`, letterSpacing:"0.04em", lineHeight:1 }}>{char.name}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:18, color:"rgba(255,255,255,0.4)", marginTop:10 }}>{char.title}</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.3em", color:char.color, marginTop:6, opacity:0.7 }}>{char.era}</div>
        </div>
      )}
      <div style={{ position:"absolute", left:0, right:0, height:2, background:`linear-gradient(to right, transparent, ${char.color}88, transparent)`, animation:"scanLine 1.4s linear infinite" }} />
    </div>
  );
};

// ─── RELIC TOAST ──────────────────────────────────────────────────
const RelicToast = ({ relic, char, onClose }) => (
  <div style={{ position:"fixed", bottom:120, left:"50%", transform:"translateX(-50%)", zIndex:9000, animation:"relicAppear 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
    <div style={{ background:"rgba(0,0,0,0.96)", border:`2px solid ${char.color}`, borderRadius:12, padding:"20px 28px", display:"flex", alignItems:"center", gap:20, maxWidth:480, backdropFilter:"blur(30px)", boxShadow:`0 0 60px ${char.color}44` }}>
      <div style={{ fontSize:40 }}>{relic.emoji}</div>
      <div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.3em", color:char.color, marginBottom:6 }}>RELIC ACQUIRED</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:18, color:"#fff", marginBottom:4 }}>{relic.name}</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{relic.desc}</div>
      </div>
      <button onClick={onClose} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", fontSize:20, padding:"0 4px", flexShrink:0 }}>✕</button>
    </div>
  </div>
);

// ─── RELIC COLLECTION DISPLAY ─────────────────────────────────────
const RelicCollection = ({ relics, onClose }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.3s ease" }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{ maxWidth:700, width:"90%", maxHeight:"80vh", overflowY:"auto", background:"rgba(10,8,20,0.98)", border:"1px solid rgba(255,215,0,0.3)", borderRadius:12, padding:"40px", animation:"fadeUp 0.4s ease both" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:28, color:"#FFD700", textShadow:"0 0 30px rgba(255,215,0,0.4)" }}>Your Relics</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:"rgba(255,255,255,0.35)", marginTop:8 }}>Objects earned through deep conversation</div>
      </div>
      {relics.length === 0 ? (
        <div style={{ textAlign:"center", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:"rgba(255,255,255,0.25)", padding:"40px 0" }}>No relics yet. Speak deeply with the souls.</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:16 }}>
          {relics.map((r,i) => {
            const char = Object.values(CHARS).find(c => c.relic?.id === r);
            if (!char) return null;
            return (
              <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${char.color}44`, borderRadius:8, padding:"20px 16px", textAlign:"center", animation:`fadeUp 0.4s ${i*0.1}s ease both`, opacity:0 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>{char.relic.emoji}</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.2em", color:char.color, marginBottom:6 }}>{char.relic.name.toUpperCase()}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>{char.relic.desc}</div>
              </div>
            );
          })}
        </div>
      )}
      <button onClick={onClose} style={{ display:"block", margin:"32px auto 0", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.3em", padding:"12px 32px", background:"transparent", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.4)", borderRadius:2 }}>CLOSE</button>
    </div>
  </div>
);

// ─── SOULS CHOOSE YOU ─────────────────────────────────────────────
const SoulsChooseYou = ({ onSelect, onBack }) => {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [phase, setPhase] = useState("questions"); // questions | awakening | chosen
  const [chosen, setChosen] = useState(null);
  const [awakening, setAwakening] = useState([]);

  const divine = async () => {
    setPhase("awakening");
    const allIds = [...CHAR_IDS];
    // Animate all waking up one by one
    for (let i = 0; i < allIds.length; i++) {
      await new Promise(r => setTimeout(r, 200));
      setAwakening(p => [...p, allIds[i]]);
    }
    await new Promise(r => setTimeout(r, 800));
    try {
      const result = await call(
        `You are a mystical oracle. Based on three answers from a visitor, determine which of these historical figures would be MOST drawn to speak with them: Napoleon Bonaparte, Cleopatra VII, Nikola Tesla, Leonardo da Vinci, Albert Einstein, Frida Kahlo, Genghis Khan, Marie Curie, William Shakespeare. Respond with ONLY the character ID in lowercase: napoleon, cleopatra, tesla, leonardo, einstein, frida, genghis, curie, or shakespeare. Nothing else.`,
        [{ role: "user", content: `Visitor answers: 1) "${q1}" 2) "${q2}" 3) "${q3}"` }], 20
      );
      const id = result.trim().toLowerCase().replace(/[^a-z]/g,'');
      const validId = CHAR_IDS.includes(id) ? id : CHAR_IDS[Math.floor(Math.random() * CHAR_IDS.length)];
      setChosen(validId);
      setPhase("chosen");
    } catch {
      const validId = CHAR_IDS[Math.floor(Math.random() * CHAR_IDS.length)];
      setChosen(validId);
      setPhase("chosen");
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 50% 50%, #0A0520, #000)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", zIndex:9999, gap:24, padding:"40px" }}>
      <GS />
      {STARS.slice(0,100).map((s,i)=><div key={i} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:`${s.s}px`, height:`${s.s}px`, borderRadius:"50%", background:"white", opacity:s.o, animation:`glowPulse ${s.d}s ${s.dl}s ease-in-out infinite`, pointerEvents:"none" }} />)}

      <button onClick={onBack} style={{ position:"absolute", top:20, left:20, fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:"rgba(255,255,255,0.3)", background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:2, padding:"8px 16px" }}>← BACK</button>

      {phase === "questions" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, maxWidth:560, width:"100%", zIndex:10 }}>
          <div style={{ textAlign:"center", animation:"fadeDown 0.8s ease both" }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.6em", color:"rgba(200,180,255,0.6)", marginBottom:12 }}>THE ORACLE AWAITS</div>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:30, color:"#fff" }}>Let the Souls Choose You</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:17, color:"rgba(255,255,255,0.4)", marginTop:8, lineHeight:1.7 }}>Answer three questions.<br/>The soul most drawn to you will awaken.</div>
          </div>
          {[
            { q:"What do you want most in this world?", val:q1, set:setQ1 },
            { q:"What are you running from?", val:q2, set:setQ2 },
            { q:"What would you sacrifice everything for?", val:q3, set:setQ3 },
          ].map(({q,val,set},i) => (
            <div key={i} style={{ width:"100%", animation:`fadeUp 0.6s ${i*0.15}s ease both`, opacity:0 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>{q}</div>
              <textarea value={val} onChange={e=>set(e.target.value)} rows={2}
                style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(200,180,255,0.2)", borderRadius:6, color:"rgba(240,230,215,0.9)", fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:15, lineHeight:1.7, padding:"12px 16px", resize:"none", backdropFilter:"blur(10px)" }} />
            </div>
          ))}
          <button onClick={divine} disabled={!q1.trim()||!q2.trim()||!q3.trim()} style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.3em", padding:"16px 48px", background:q1&&q2&&q3?"rgba(200,180,255,0.15)":"rgba(0,0,0,0.5)", border:`1px solid ${q1&&q2&&q3?"rgba(200,180,255,0.6)":"rgba(200,180,255,0.1)"}`, color:q1&&q2&&q3?"rgba(200,180,255,0.9)":"rgba(200,180,255,0.3)", borderRadius:24, backdropFilter:"blur(20px)", transition:"all 0.3s", animation:"fadeUp 0.6s 0.5s ease both", opacity:0 }}>
            CONSULT THE ORACLE →
          </button>
        </div>
      )}

      {phase === "awakening" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, zIndex:10 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:20, color:"rgba(255,255,255,0.5)", animation:"fadeIn 0.5s ease both" }}>The souls stir…</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center", maxWidth:500 }}>
            {CHAR_IDS.map(id => {
              const P = PORTRAITS[id], c = CHARS[id];
              const isAwake = awakening.includes(id);
              return (
                <div key={id} style={{ width:60, height:84, borderRadius:30, overflow:"hidden", border:`2px solid ${isAwake ? c.color : "rgba(255,255,255,0.1)"}`, boxShadow:isAwake?`0 0 20px ${c.color}66`:"none", opacity:isAwake?1:0.2, transition:"all 0.4s", animation:isAwake?`heartbeat 2s ease-in-out infinite`:"none" }}>
                  <P size={60} uid={id+"sc"} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "chosen" && chosen && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, zIndex:10, animation:"dramaticEntry 0.8s ease both" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.5em", color:"rgba(255,255,255,0.3)" }}>THE SOUL DRAWN TO YOU</div>
          <div style={{ width:160, height:224, borderRadius:80, overflow:"hidden", border:`3px solid ${CHARS[chosen].color}`, boxShadow:`0 0 80px ${CHARS[chosen].color}`, animation:"heartbeat 2s ease-in-out infinite" }}>
            {React.createElement(PORTRAITS[chosen], { size:160, glow:true, uid:chosen+"ch" })}
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:32, color:CHARS[chosen].glow, textShadow:`0 0 40px ${CHARS[chosen].color}` }}>{CHARS[chosen].name}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:17, color:"rgba(255,255,255,0.4)", marginTop:6 }}>{CHARS[chosen].tagline}</div>
          </div>
          <button onClick={() => onSelect(chosen)} style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"0.3em", padding:"16px 48px", background:CHARS[chosen].color, color:CHARS[chosen].dark, border:"none", borderRadius:3, boxShadow:`0 0 40px ${CHARS[chosen].color}88`, transition:"all 0.3s" }}>
            ANSWER THE CALL →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── UNSENT LETTER MODAL ──────────────────────────────────────────
const UnsentLetterModal = ({ char, charId, msgs, onClose }) => {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gen = async () => {
      try {
        const convoSummary = msgs.slice(-6).map(m=>`${m.role}: "${m.content}"`).join("\n");
        const text = await call(char.system, [{
          role:"user",
          content:`Write a personal letter addressed to the person you just spoke with (address them as "You" or "Dear Visitor"). Reference specific things they said or asked in our conversation. Make it intimate, urgent, personal — 4-6 sentences. Sign it as yourself.\n\nConversation summary:\n${convoSummary}`
        }], 400);
        setLetter(text);
      } catch { setLetter("The words escape me... but I felt your presence here."); }
      setLoading(false);
    };
    gen();
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn 0.3s ease" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ maxWidth:600, width:"90%", background:"#0A0806", border:`1px solid ${char.color}44`, borderRadius:4, padding:"48px", animation:"fadeUp 0.5s ease both", boxShadow:`0 0 80px ${char.color}22` }}>
        <div style={{ textAlign:"center", borderBottom:`1px solid ${char.color}22`, paddingBottom:20, marginBottom:28 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.5em", color:char.color, marginBottom:8 }}>UNSENT LETTER</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:22, color:"#fff" }}>{char.name}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>{char.era}</div>
        </div>
        {loading ? (
          <div style={{ display:"flex", gap:6, justifyContent:"center", padding:"32px 0" }}>
            {[0,1,2].map(i=><div key={i} style={{ width:5,height:20,borderRadius:2,background:char.glow,animation:`bounce${i} 0.9s ease-in-out infinite` }} />)}
          </div>
        ) : (
          <div style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:16, lineHeight:2, color:"rgba(240,230,215,0.92)", whiteSpace:"pre-wrap" }}>{letter}</div>
        )}
        <button onClick={onClose} style={{ display:"block", margin:"32px auto 0", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.3em", padding:"12px 32px", background:"transparent", border:`1px solid ${char.color}44`, color:char.color, borderRadius:2, transition:"all 0.3s" }}>FOLD & KEEP</button>
      </div>
    </div>
  );
};

// ─── GRAND TRIBUNAL ───────────────────────────────────────────────
const GrandTribunal = ({ question, onBack }) => {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [debates, setDebates] = useState([]);
  const [debating, setDebating] = useState(false);

  useEffect(() => {
    const ask = async () => {
      await Promise.all(CHAR_IDS.map(async id => {
        const char = CHARS[id];
        try {
          const text = await call(char.system + "\n\nAnswer in 2-3 sentences. Be decisive and authentic.", [{
            role:"user", content:`The Grand Tribunal poses this question to all souls: "${question}". Give your answer with conviction.`
          }], 180);
          setResponses(p => ({ ...p, [id]: text }));
        } catch { setResponses(p => ({ ...p, [id]: "…" })); }
      }));
      setLoading(false);
    };
    ask();
  }, [question]);

  const startDebate = async () => {
    setDebating(true);
    const pairs = [[CHAR_IDS[0],CHAR_IDS[1]], [CHAR_IDS[2],CHAR_IDS[3]], [CHAR_IDS[4],CHAR_IDS[5]]];
    for (const [idA, idB] of pairs) {
      const charA = CHARS[idA], charB = CHARS[idB];
      try {
        const replyA = await call(charA.system, [{
          role:"user", content:`${charB.name} said: "${responses[idB]}". You disagree or want to build on this. Respond directly to them in 1-2 sentences about the question: "${question}"`
        }], 120);
        setDebates(p => [...p, { speaker:idA, content:replyA }]);
        const replyB = await call(charB.system, [{
          role:"user", content:`${charA.name} just challenged you: "${replyA}". Respond in 1-2 sharp sentences.`
        }], 120);
        setDebates(p => [...p, { speaker:idB, content:replyB }]);
      } catch {}
    }
    setDebating(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden" }}>
      <GS />
      <DreamRoomWorld />
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:30, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 28px", background:"linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}>
        <button onClick={onBack} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:"rgba(255,255,255,0.4)", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:2, padding:"8px 16px" }}>← UNIVERSE</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:22, color:"#FFD700", textShadow:"0 0 30px rgba(255,215,0,0.5)" }}>⚖ The Grand Tribunal</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:"rgba(255,255,255,0.4)", marginTop:4, maxWidth:500 }}>"{question}"</div>
        </div>
        <div style={{ width:80 }} />
      </div>

      <div style={{ position:"absolute", inset:0, overflowY:"auto", padding:"100px 32px 40px", zIndex:20 }}>
        {/* Character responses grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, maxWidth:1100, margin:"0 auto 32px" }}>
          {CHAR_IDS.map((id,i) => {
            const char = CHARS[id], P = PORTRAITS[id];
            return (
              <div key={id} style={{ background:"rgba(0,0,0,0.85)", border:`1px solid ${char.color}33`, borderRadius:10, padding:"20px 18px", backdropFilter:"blur(20px)", animation:`fadeUp 0.6s ${i*0.08}s ease both`, opacity:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ width:44, height:62, borderRadius:22, overflow:"hidden", border:`2px solid ${char.color}66`, boxShadow:`0 0 15px ${char.color}44`, flexShrink:0 }}><P size={44} uid={id+"tr"} /></div>
                  <div>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.15em", color:char.color }}>{char.short.toUpperCase()}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{char.years}</div>
                  </div>
                </div>
                {!responses[id] ? (
                  <div style={{ display:"flex", gap:4, padding:"8px 0" }}>{[0,1,2].map(i=><div key={i} style={{ width:4,height:14,borderRadius:2,background:char.glow,animation:`bounce${i} 0.9s ease-in-out infinite` }} />)}</div>
                ) : (
                  <div style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:14, lineHeight:1.8, color:"rgba(240,230,215,0.9)" }}>{responses[id]}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Debate section */}
        {!loading && debates.length === 0 && !debating && (
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <button onClick={startDebate} style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.3em", padding:"16px 48px", background:"rgba(255,215,0,0.15)", border:"1px solid rgba(255,215,0,0.5)", color:"#FFD700", borderRadius:24, backdropFilter:"blur(20px)", transition:"all 0.3s", animation:"fadeUp 0.6s 0.8s ease both", opacity:0 }}>
              ⚖ LET THEM DEBATE →
            </button>
          </div>
        )}
        {(debates.length > 0 || debating) && (
          <div style={{ maxWidth:700, margin:"0 auto", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.4em", color:"rgba(255,215,0,0.6)", textAlign:"center", marginBottom:8 }}>THE DEBATE</div>
            {debates.map((d,i) => {
              const char = CHARS[d.speaker], P = PORTRAITS[d.speaker];
              return (
                <div key={i} style={{ display:"flex", gap:12, animation:"chatSlide 0.4s ease both" }}>
                  <div style={{ width:36,height:50,borderRadius:18,overflow:"hidden",border:`1.5px solid ${char.color}44`,flexShrink:0 }}><P size={36} uid={d.speaker+"db"+i} /></div>
                  <div style={{ flex:1,padding:"12px 16px",borderRadius:"4px 14px 14px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${char.color}22` }}>
                    <div style={{ fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:"0.15em",color:char.color,marginBottom:6 }}>{char.short.toUpperCase()}</div>
                    <div style={{ fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:14,lineHeight:1.8,color:"rgba(240,230,215,0.9)" }}>{d.content}</div>
                  </div>
                </div>
              );
            })}
            {debating && (
              <div style={{ display:"flex", justifyContent:"center", gap:6, padding:"16px" }}>
                {[0,1,2].map(i=><div key={i} style={{ width:5,height:18,borderRadius:2,background:"#FFD700",animation:`bounce${i} 0.9s ease-in-out infinite` }} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── UNIVERSE SCREEN ──────────────────────────────────────────────
const UniverseScreen = ({ onSelect, onEncounter, onDream, onTribunal, onSoulsChoose, memory, relics }) => {
  const [vis, setVis] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [tab, setTab] = useState("souls");
  const [showTribunal, setShowTribunal] = useState(false);
  const [selectedTQ, setSelectedTQ] = useState(null);
  const [showRelics, setShowRelics] = useState(false);
  const hChar = hovered ? CHARS[hovered] : null;

  useEffect(() => { setTimeout(() => setVis(true), 100); }, []);

  const visitedIds = CHAR_IDS.filter(id => (memory[id]?.length || 0) > 2);

  const carouselRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleDragStart = useCallback((e) => {
    if (tab !== "souls" || !carouselRef.current) return;
    isDown.current = true;
    startX.current = (e.pageX || e.touches?.[0].pageX) - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  }, [tab]);
  const handleDragEnd = useCallback(() => { isDown.current = false; }, []);
  const handleDragMove = useCallback((e) => {
    if (!isDown.current || !carouselRef.current) return;
    e.preventDefault();
    const x = (e.pageX || e.touches?.[0].pageX) - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);
  
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || tab !== "souls") return;
    const onWheel = (e) => {
      e.preventDefault();
      el.scrollLeft += (e.deltaY + e.deltaX) * 1.5;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [tab]);

  return (
    <div style={{ position:"fixed", inset:0, background: hChar ? `radial-gradient(ellipse at 50% 50%, ${hChar.color}44 0%, #060112 70%, #010008 100%)` : "radial-gradient(ellipse at 50% 30%, #0E0520 0%, #060112 45%, #010008 100%)", overflow:"hidden", transition:"background 0.8s ease" }}>
      <GS />
      {/* Stars */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {STARS.map((s,i) => <div key={i} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:`${s.s}px`, height:`${s.s}px`, borderRadius:"50%", background:"white", opacity:s.o, animation:`glowPulse ${s.d}s ${s.dl}s ease-in-out infinite` }} />)}
      </div>
      {/* Nebula */}
      {[{x:"15%",y:"20%",w:500,h:350,c:"#3A0A6A"},{x:"55%",y:"5%",w:600,h:400,c:"#0A2A6A"},{x:"25%",y:"55%",w:700,h:500,c:"#6A0A3A"},{x:"65%",y:"45%",w:500,h:400,c:"#0A4A3A"},{x:"80%",y:"70%",w:400,h:300,c:"#3A0A4A"}].map((n,i) => (
        <div key={i} style={{ position:"absolute", left:n.x, top:n.y, width:n.w, height:n.h, borderRadius:"50%", background:`radial-gradient(ellipse, ${n.c} 0%, transparent 70%)`, opacity:0.05, pointerEvents:"none", animation:`constellationPulse ${8+i*3}s ${i*2}s ease-in-out infinite` }} />
      ))}
      {/* Constellation lines */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {PLANETS.map((a,i) => PLANETS.slice(i+1).map((b,j) => (
          <line key={`${i}-${j}`} x1={parseFloat(a.x)} y1={parseFloat(a.y)} x2={parseFloat(b.x)} y2={parseFloat(b.y)} stroke="rgba(255,255,255,0.2)" strokeWidth="0.1" style={{animation:`constellationPulse ${5+i}s ${j}s ease-in-out infinite`}} />
        )))}
      </svg>

      {/* Title */}
      <div style={{ position:"absolute", top:"4%", left:0, right:0, textAlign:"center", opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(-20px)", transition:"all 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s", pointerEvents:"none", zIndex:20 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.9em", color:"rgba(255,255,255,0.15)", marginBottom:8 }}>A LIVING ARCHIVE OF GREAT MINDS</div>
        <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(30px,5.5vw,68px)", backgroundImage:"linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 50%, #fff 100%)", WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent", backgroundSize:"200% 100%", animation:"shimmer 5s ease-in-out infinite", letterSpacing:"0.08em", lineHeight:1 }}>Echoes of History</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:"rgba(255,255,255,0.22)", marginTop:8, letterSpacing:"0.15em" }}>Choose a soul · Enter their world · Speak with the dead</div>
      </div>

      {/* Tabs */}
      <div style={{ position:"absolute", top:"16%", left:"50%", transform:"translateX(-50%)", display:"flex", gap:2, zIndex:30, background:"rgba(0,0,0,0.5)", borderRadius:4, padding:3, backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)" }}>
        {[["souls","SOULS"],["encounters","ENCOUNTERS"],["dream","DREAM ROOM"]].map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", padding:"9px 18px", borderRadius:3, border:"none", background:tab===id?"rgba(255,255,255,0.1)":"transparent", color:tab===id?"white":"rgba(255,255,255,0.3)", transition:"all 0.3s" }}>{label}</button>
        ))}
      </div>

      {/* Top-right controls */}
      <div style={{ position:"absolute", top:20, right:20, zIndex:50, display:"flex", flexDirection:"column", gap:8 }}>
        <button onClick={()=>setShowTribunal(true)} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:"rgba(255,215,0,0.8)", background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,215,0,0.3)", borderRadius:2, padding:"9px 18px", backdropFilter:"blur(10px)", transition:"all 0.3s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,215,0,0.8)";e.currentTarget.style.color="#FFD700";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,215,0,0.3)";e.currentTarget.style.color="rgba(255,215,0,0.8)";}}>
          ⚖ TRIBUNAL
        </button>
        <button onClick={onSoulsChoose} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:"rgba(200,180,255,0.8)", background:"rgba(0,0,0,0.6)", border:"1px solid rgba(200,180,255,0.3)", borderRadius:2, padding:"9px 18px", backdropFilter:"blur(10px)", transition:"all 0.3s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(200,180,255,0.8)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,180,255,0.3)";}}>
          ✦ SOULS CHOOSE
        </button>
        {relics.length > 0 && (
          <button onClick={()=>setShowRelics(true)} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:"rgba(255,215,0,0.6)", background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:2, padding:"9px 18px", backdropFilter:"blur(10px)", transition:"all 0.3s" }}>
            HISTORICAL RELICS ({relics.length})
          </button>
        )}
      </div>

      {/* Memory badges */}
      {visitedIds.length > 0 && (
        <div style={{ position:"absolute", top:20, left:20, zIndex:50 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:7, letterSpacing:"0.2em", color:"rgba(255,255,255,0.25)", marginBottom:6 }}>SOULS ENCOUNTERED</div>
          <div style={{ display:"flex", gap:5 }}>
            {visitedIds.map(id => {
              const P = PORTRAITS[id], c = CHARS[id];
              return (
                <div key={id} style={{ width:30,height:42,borderRadius:15,overflow:"hidden",border:`1.5px solid ${c.color}88`,boxShadow:`0 0 10px ${c.color}44` }}>
                  <P size={30} uid={`badge_${id}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3D HALL OF SOULS CAROUSEL */}
      {tab === "souls" && (
        <div ref={carouselRef} 
             onMouseDown={handleDragStart} onMouseLeave={handleDragEnd} onMouseUp={handleDragEnd} onMouseMove={handleDragMove}
             onTouchStart={handleDragStart} onTouchEnd={handleDragEnd} onTouchMove={handleDragMove}
             style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", overflowX:"auto", overflowY:"hidden", padding:"0 45vw", gap:100, scrollBehavior:"auto", zIndex:15 }}>
          {/* Scroll Indicator */}
          <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:200, textAlign:"center", fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.4em", color:"rgba(255,255,255,0.2)", pointerEvents:"none", animation:"pulse 3s infinite" }}>SCROLL TO EXPLORE</div>
          
          {CHAR_IDS.map((id) => {
            const char = CHARS[id];
            const P = PORTRAITS[id];
            const isHov = hovered === id;
            return (
              <div key={id} 
                onMouseEnter={()=>setHovered(id)} 
                onMouseLeave={()=>setHovered(null)}
                onClick={()=>onSelect(id)}
                style={{ 
                  flexShrink:0, width:380, height:580, position:"relative", cursor:"pointer",
                  borderRadius:16, overflow:"hidden", border:`1px solid ${isHov ? char.color : "rgba(255,255,255,0.05)"}`,
                  boxShadow:isHov ? `0 0 80px ${char.color}66, inset 0 0 30px rgba(0,0,0,0.8)` : `0 0 30px rgba(0,0,0,0.8)`,
                  transform: isHov ? "scale(1.03) translateY(-10px) perspective(1000px) rotateY(0deg)" : "scale(0.9) translateY(0px) perspective(1000px) rotateY(0deg)",
                  transition:"all 0.5s cubic-bezier(0.2, 1, 0.3, 1)",
                  background: `linear-gradient(to bottom, ${isHov ? char.dark+'aa' : 'transparent'}, ${char.dark})`,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}
              >
                 {P && <div style={{ transform:isHov?"scale(1.05)":"scale(0.95)", transition:"transform 0.5s ease", width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><P size={380} mood="neutral" uid={"univ_"+id} glow={isHov} /></div>}
                 
                 {/* Card Text Overlay */}
                 <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"80px 30px 40px", background:"linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)", transform:isHov?"translateY(0)":"translateY(20px)", opacity:isHov?1:0.4, transition:"all 0.5s ease" }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.4em", color:char.glow, marginBottom:8 }}>{char.era}</div>
                    <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:32, color:"#fff", textShadow:`0 0 20px ${char.color}`, lineHeight:1, marginBottom:10 }}>{char.name}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:"rgba(255,255,255,0.6)", lineHeight:1.4 }}>"{char.short}'s domain"</div>
                 </div>
                 
                 {isHov && <div style={{ position:"absolute", inset:0, border:`2px solid ${char.color}`, opacity:0.3, mixBlendMode:"overlay" }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* ENCOUNTERS TAB */}
      {tab === "encounters" && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:15 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, maxWidth:1100, padding:"0 32px", marginTop:70 }}>
            {ENCOUNTERS.map((enc,i) => {
              const ca=CHARS[enc.a], cb=CHARS[enc.b], PA=PORTRAITS[enc.a], PB=PORTRAITS[enc.b];
              return (
                <div key={i} onClick={()=>onEncounter(enc.a,enc.b)} style={{ cursor:"pointer", background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, padding:"18px 14px", textAlign:"center", animation:`fadeUp 0.6s ${i*0.08}s ease both`, opacity:0, backdropFilter:"blur(20px)", transition:"all 0.3s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=ca.color+"88";e.currentTarget.style.boxShadow=`0 0 30px ${ca.color}22`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
                    <div style={{ width:46,height:64,borderRadius:23,overflow:"hidden",border:`2px solid ${ca.color}`,zIndex:2 }}><PA size={46} uid={enc.a+i} /></div>
                    <div style={{ width:46,height:64,borderRadius:23,overflow:"hidden",border:`2px solid ${cb.color}`,marginLeft:-12,zIndex:1 }}><PB size={46} uid={enc.b+i} /></div>
                  </div>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.15em", color:ca.glow, marginBottom:6 }}>{enc.title}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:12, color:"rgba(255,255,255,0.38)", lineHeight:1.5 }}>{enc.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DREAM ROOM TAB */}
      {tab === "dream" && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:15, flexDirection:"column", gap:24 }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.4em", color:"rgba(255,255,255,0.28)", animation:"fadeUp 0.6s ease both" }}>THE COLLECTIVE UNCONSCIOUS</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:20, color:"rgba(255,255,255,0.5)", maxWidth:520, textAlign:"center", lineHeight:1.7, animation:"fadeUp 0.6s 0.2s ease both", opacity:0 }}>All nine souls speak simultaneously. Their voices overlap. Their truths contradict. You are the only one who can hear all of them at once.</div>
          <button onClick={onDream} style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.3em", padding:"18px 48px", background:"transparent", border:"1px solid rgba(200,180,255,0.4)", color:"rgba(200,180,255,0.8)", borderRadius:4, animation:"fadeUp 0.6s 0.4s ease both", opacity:0, backdropFilter:"blur(20px)", transition:"all 0.3s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(200,180,255,0.08)";e.currentTarget.style.borderColor="rgba(200,180,255,0.8)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(200,180,255,0.4)";}}>
            ENTER THE DREAM ROOM
          </button>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 8% 32px", background:"linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)", minHeight:110, display:"flex", alignItems:"flex-end", zIndex:20 }}>
        {hChar && tab === "souls" ? (
          <div key={hChar.name} style={{ animation:"fadeUp 0.35s ease both", width:"100%", display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.35em", color:hChar.color, marginBottom:8 }}>{hChar.era.toUpperCase()} · {hChar.title.toUpperCase()}</div>
              <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(24px,4vw,50px)", color:"#fff", textShadow:`0 0 40px ${hChar.color}88`, letterSpacing:"0.04em", lineHeight:1 }}>{hChar.name}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:"rgba(255,255,255,0.42)", marginTop:8, maxWidth:500, lineHeight:1.6 }}>"{hChar.tagline}"</div>
            </div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"0.25em", color:"#000", background:hChar.color, padding:"14px 32px", borderRadius:2, cursor:"pointer", boxShadow:`0 0 40px ${hChar.color}88`, transition:"all 0.25s", flexShrink:0, marginLeft:32, alignSelf:"center" }}
              onClick={()=>onSelect(hovered)}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)";e.currentTarget.style.boxShadow=`0 0 60px ${hChar.color}`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 0 40px ${hChar.color}88`;}}>
              ENTER →
            </div>
          </div>
        ) : (
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:"rgba(255,255,255,0.18)", letterSpacing:"0.08em" }}>
            {tab === "souls" ? "Hover a soul · Click to enter their world · 9 souls, infinite conversations" : tab === "encounters" ? "Choose two souls to meet across time" : ""}
          </div>
        )}
      </div>

      {/* Tribunal modal */}
      {showTribunal && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.92)", backdropFilter:"blur(20px)", display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeIn 0.3s ease" }}>
          <div style={{ maxWidth:640, width:"90%", border:"1px solid rgba(255,215,0,0.3)", borderRadius:6, background:"rgba(10,8,0,0.98)", padding:"44px 52px", animation:"fadeUp 0.5s ease both" }}>
            <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:26, color:"#FFD700", textAlign:"center", marginBottom:8 }}>⚖ The Grand Tribunal</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:"rgba(255,255,255,0.38)", textAlign:"center", marginBottom:32 }}>All nine souls answer. One question. Maximum conviction.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
              {TRIBUNAL_QUESTIONS.map((q,i) => (
                <div key={i} onClick={()=>setSelectedTQ(q)} style={{ padding:"14px 22px", border:`1px solid ${selectedTQ===q?"rgba(255,215,0,0.8)":"rgba(255,255,255,0.07)"}`, borderRadius:3, cursor:"pointer", background:selectedTQ===q?"rgba(255,215,0,0.07)":"transparent", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:selectedTQ===q?"#FFD700":"rgba(255,255,255,0.55)", transition:"all 0.2s" }}
                  onMouseEnter={e=>{if(selectedTQ!==q)e.currentTarget.style.borderColor="rgba(255,255,255,0.18)";}}
                  onMouseLeave={e=>{if(selectedTQ!==q)e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
                  {q}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={()=>setShowTribunal(false)} style={{ flex:1, padding:"13px", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", background:"transparent", border:"1px solid rgba(255,255,255,0.12)", borderRadius:2, color:"rgba(255,255,255,0.35)", transition:"all 0.2s" }}>CANCEL</button>
              <button onClick={()=>{if(selectedTQ){setShowTribunal(false);onTribunal(selectedTQ);}}} disabled={!selectedTQ} style={{ flex:2, padding:"13px", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", background:selectedTQ?"#FFD700":"rgba(255,215,0,0.15)", border:"none", borderRadius:2, color:selectedTQ?"#000":"rgba(255,215,0,0.3)", transition:"all 0.2s", cursor:selectedTQ?"pointer":"not-allowed" }}>CONVENE ALL NINE →</button>
            </div>
          </div>
        </div>
      )}
      {showRelics && <RelicCollection relics={relics} onClose={()=>setShowRelics(false)} />}
    </div>
  );
};

// ─── DEATH SCENE ──────────────────────────────────────────────────
const DeathScene = ({ char, charId, onReset }) => {
  const [phase, setPhase] = useState(0);
  const Portrait = PORTRAITS[charId];
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 6000);
    return () => [t1,t2].forEach(clearTimeout);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"#000", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 50%, ${char.color}05 0%, #000 80%)` }} />
      {phase === 0 && (
        <div style={{ textAlign:"center", animation:"fadeIn 2s ease" }}>
          <div style={{ width:120,height:168,borderRadius:60,overflow:"hidden",border:`1px solid ${char.color}22`,margin:"0 auto 24px",opacity:0.4 }}><Portrait size={120} uid={charId+"d"} /></div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:18, color:"rgba(255,255,255,0.2)" }}>The candle burns to nothing…</div>
        </div>
      )}
      {phase >= 1 && (
        <div style={{ textAlign:"center", animation:"fadeIn 2s ease", maxWidth:520, padding:"0 40px" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.5em", color:char.color, marginBottom:24, opacity:0.6 }}>{char.deathPlace.toUpperCase()} · {char.deathYear}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:26, color:"rgba(255,255,255,0.7)", lineHeight:1.8, marginBottom:16 }}>
            "…{char.lastWords}"
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:"rgba(255,255,255,0.2)", letterSpacing:"0.2em" }}>LAST WORDS · {char.name.toUpperCase()}</div>
        </div>
      )}
      {phase >= 2 && (
        <div style={{ textAlign:"center", animation:"fadeIn 2s ease", marginTop:40 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:"rgba(255,255,255,0.15)", letterSpacing:"0.4em", marginBottom:36 }}>✦ ✦ ✦</div>
          <button onClick={onReset} style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.3em", padding:"15px 40px", background:"transparent", border:`1px solid ${char.color}44`, color:char.color, borderRadius:2, transition:"all 0.4s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${char.color}11`;e.currentTarget.style.borderColor=char.color;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=`${char.color}44`;}}>
            RETURN · BEGIN AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

// ─── WORLD SCREEN ─────────────────────────────────────────────────
const WorldScreen = ({ charId, nodeIdx, fateCards, onBack, onMemoryUpdate }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [interactionMode, setInteractionMode] = useState("menu");
  const char = CHARS[charId];
  const node = (CAMPAIGNS[charId] && CAMPAIGNS[charId][nodeIdx]) ? CAMPAIGNS[charId][nodeIdx] : null;
  const sysPrompt = node ? node.system : char.system;

  const Scene = WORLD_SCENES[charId];
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [candleBurned, setCandleBurned] = useState(0);
  const [showDeath, setShowDeath] = useState(false);
  const [mood, setMood] = useState("neutral");
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [earnedRelics, setEarnedRelics] = useState([]);
  const [relicToast, setRelicToast] = useState(null);
  const [showLetter, setShowLetter] = useState(false);
  const [sideMode, setSideMode] = useState(null);
  const [sideContent, setSideContent] = useState("");
  const [sideLoading, setSideLoading] = useState(false);
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    const audio = playAudioFX(charId);
    return () => { audio.pause(); audio.src=""; };
  }, []);

  // STT handler will use the unified send function

  const toggleRecording = () => {
    if (!SpeechRec) return alert("Speech Recognition not supported in this browser.");
    if (isRecording) { setIsRecording(false); return; }
    const rec = new SpeechRec();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setIsRecording(false);
      send(t);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
  };

  const endRef = useRef(null);
  const taRef = useRef(null);
  const memory = loadMemory();

  useEffect(() => {
    const next = Math.min(msgs.length * 6, 100);
    setCandleBurned(next);
    if (next >= 100 && !showDeath && msgs.length > 0) setTimeout(() => setShowDeath(true), 2000);
  }, [msgs.length]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const buildSystem = () => {
    let sys = char.system;
    if (fateCards?.length) sys += `\n\nBEFORE THIS CONVERSATION, THE VISITOR DREW FATE CARDS: ${fateCards.join(" | ")}. Weave awareness of these into your responses subtly and meaningfully.`;
    const prev = memory[charId];
    if (prev) sys += `\n\nMEMORY: You have spoken with this visitor before. You remember: "${prev}". Reference this naturally — you know them.`;
    return sys;
  };

  useEffect(() => {
    const start = async () => {
      setLoading(true);
      try {
        let greet = char.greeting;
        if (fateCards?.length || memory[charId]) {
          greet = await call(buildSystem(), [{ role:"user", content:`I have just arrived. Greet me — but you sense who I am from our last meeting or from the fate cards drawn. Be subtly aware, not explicit. 3-5 sentences.` }], 300);
        }
        setMsgs([{ role:"assistant", content:greet }]);
        speakText(greet, charId, voiceEnabled);
      } catch {
        setMsgs([{ role:"assistant", content:char.greeting }]);
        speakText(char.greeting, charId, voiceEnabled);
      }
      setLoading(false);
    };
    start();
  }, []);

  const send = useCallback(async (sttString) => {
    const textMsg = typeof sttString === "string" ? sttString : input.trim();
    if (!textMsg || loading) return;
    const u = { role:"user", content:textMsg };
    const newHistory = [...msgs, u];
    setMsgs(newHistory); setInput(""); setLoading(true);
    if (taRef.current) taRef.current.style.height = "auto";
    const newMood = detectMood(textMsg, char);
    if (newMood !== "neutral") { setMood(newMood); setParticleTrigger(p => p+1); }
    // Check relic trigger
    if (checkRelicTrigger(textMsg, charId) && char.relic && !earnedRelics.includes(char.relic.id)) {
      setTimeout(() => {
        const newRelics = [...earnedRelics, char.relic.id];
        setEarnedRelics(newRelics);
        saveRelics(newRelics);
        setRelicToast(char.relic);
      }, 2000);
    }
    try {
      const text = await call(buildSystem(), newHistory.map(m=>({role:m.role,content:m.content})));
      const updated = [...newHistory, { role:"assistant", content:text }];
      setMsgs(updated);
      if (voiceEnabled && interactionMode !== "chat") speakText(text, charId, voiceEnabled);
      const resMood = detectMood(text, char);
      if (resMood !== "neutral") setMood(resMood);
      // Save memory snapshot every 8 messages
      if (updated.length % 8 === 0) {
        try {
          const summary = await call("Summarize a conversation in one sentence, capturing the emotional essence and key topics. Be specific and personal.", [{ role:"user", content:updated.slice(-6).map(m=>`${m.role}: ${m.content}`).join("\n") }], 80);
          const mem = loadMemory();
          mem[charId] = summary;
          saveMemory(mem);
          onMemoryUpdate();
        } catch {}
      }
    } catch { setMsgs(p => [...p, { role:"assistant", content:"…" }]); }
    setLoading(false);
  }, [input, loading, msgs, interactionMode, voiceEnabled]);

  const doSide = async (mode) => {
    setSideMode(mode); setSideContent(""); setSideLoading(true);
    const prompts = {
      confession: `In character as ${char.name}, speak your deepest, most private truth — the thing you have never admitted aloud. Raw, real, 2-3 sentences. Your known secret: ${char.confession}`,
      reveal: `You are ${char.name}. Someone is about to tell you a true fact about your future. React in character with full emotional authenticity. The fact: "${ charId==="napoleon"?"You will die alone on Saint Helena, your empire erased. But 200 years later, schoolchildren across Earth will know your name before their own leaders.":charId==="cleopatra"?"Your tomb will never be found — not in 2000 years of searching. But your name will outlive every pharaoh, every Caesar.":charId==="tesla"?"You will die penniless in a hotel room. Decades later, the most famous electric car in the world will bear your name.":charId==="leonardo"?"The Mona Lisa will be seen by 10 million people every year — behind bulletproof glass in a museum in Paris.":charId==="einstein"?"The atomic bomb will kill 200,000 civilians. Your letter to Roosevelt will be cited as the beginning. You live with it until 1955.":charId==="frida"?"Your paintings will sell for $34 million each. You will become more famous than Diego Rivera. History corrected itself.":charId==="genghis"?"Your empire will collapse within two generations. But the Silk Road you created will reshape global trade for centuries.":charId==="curie"?"The radiation is killing you. You will die in 1934. Your notebooks are still too radioactive to touch today.":"Your plays will be performed in every language on Earth for 400 years. They will still be studying you in 2400."}" React now.`,
      challenge: `You are ${char.name}. Someone has just caught you in your known lie: "${char.lie}". React in character — defend yourself, deflect, or momentarily crack. Stay 100% in character. 2-3 sentences.`,
      letter: `You are ${char.name}. Write a brief personal letter to someone living in the year 2026. Not a speech — a letter. Personal, intimate, urgent. What matters. What you wish they knew. Sign it as yourself. Maximum 5 sentences.`,
    };
    try {
      const text = await call(char.system, [{ role:"user", content:prompts[mode] }], 350);
      setSideContent(text);
      speakText(text, charId, voiceEnabled);
    } catch { setSideContent("The veil between worlds trembles..."); }
    setSideLoading(false);
  };

  const candleH = Math.max(0, 64 * (1 - candleBurned / 100));
  if (showDeath) return <DeathScene char={char} charId={charId} onReset={onBack} />;

  if (interactionMode === "menu") {
    return (
      <div style={{ position:"fixed", inset:0, background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <img src={`/${charId}_bg.png`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.3, filter:"blur(8px)" }} />
        <div style={{ position:"relative", zIndex:10, textAlign:"center", animation:"fadeUp 0.6s ease" }}>
           <div style={{ width:120, height:168, borderRadius:60, overflow:"hidden", border:`2px solid ${char.color}`, margin:"0 auto 24px", boxShadow:`0 0 40px ${char.color}66` }}>
              <img src={`/${charId}_avatar.png`} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
           </div>
           <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:40, color:"#fff", textShadow:"0 4px 20px rgba(0,0,0,0.8)", marginBottom:8 }}>{char.name}</div>
           <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"0.4em", color:char.color, marginBottom:40 }}>CHOOSE COMMUNICATION LINK</div>
           
           <div style={{ display:"flex", gap:24, justifyContent:"center" }}>
              <button onClick={()=>setInteractionMode("chat")} style={{ padding:"18px 36px", borderRadius:40, border:`1px solid ${char.color}88`, background:"rgba(0,0,0,0.6)", color:"#fff", fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.2em", cursor:"pointer", transition:"all 0.3s", backdropFilter:"blur(10px)" }} onMouseEnter={e=>{e.currentTarget.style.background=char.color+"44"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0.6)"}}>TEXT CHAT LINK</button>
              <button onClick={()=>setInteractionMode("voiceCall")} style={{ padding:"18px 36px", borderRadius:40, border:`1px solid #40FF8088`, background:"rgba(0,0,0,0.6)", color:"#fff", fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.2em", cursor:"pointer", transition:"all 0.3s", backdropFilter:"blur(10px)" }} onMouseEnter={e=>{e.currentTarget.style.background="#40FF8044"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0.6)"}}> SECURE VOICE</button>
              <button onClick={()=>setInteractionMode("videoCall")} style={{ padding:"18px 36px", borderRadius:40, border:`1px solid #FF408088`, background:"rgba(0,0,0,0.6)", color:"#fff", fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.2em", cursor:"pointer", transition:"all 0.3s", backdropFilter:"blur(10px)" }} onMouseEnter={e=>{e.currentTarget.style.background="#FF408044"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0.6)"}}> FULL HOLOGRAM</button>
           </div>
        </div>
        <button onClick={onBack} style={{ position:"absolute", top:24, left:24, padding:"12px 24px", borderRadius:20, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(0,0,0,0.5)", color:"#fff", fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", cursor:"pointer", zIndex:20, transition:"all 0.3s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0.5)"}>← HUB</button>
      </div>
    );
  }

  if (interactionMode === "voiceCall") {
    return (
      <div style={{ position:"fixed", inset:0, background:"#050505", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <img src={`/${charId}_bg.png`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.1, filter:"blur(20px)" }} />
        <div style={{ position:"absolute", top:60, textAlign:"center", zIndex:10 }}>
           <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:"0.3em", color:"#40FF80", animation:"glowPulse 2s infinite" }}>SECURE VOICE LINK ESTABLISHED</div>
           <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:40, color:"#fff", marginTop:16 }}>{char.name}</div>
        </div>
        <div style={{ width:220, height:220, borderRadius:"50%", border:`2px solid ${char.color}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 80px ${char.color}44`, animation:loading?"orbFloat 2s infinite":"none", zIndex:10, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)" }}>
           {loading ? <div style={{ color:"rgba(255,255,255,0.5)", fontFamily:"sans-serif", fontSize:32, animation:"glowPulse 1s infinite" }}>•••</div> : <div style={{ display:"flex", gap:12, alignItems:"center", height:80 }}>{[0,1,2,3,4].map(i=><div key={i} style={{ width:10, height:`${20+Math.random()*60}%`, background:char.color, borderRadius:4, animation:`bounce${i%3} ${0.4+Math.random()*0.4}s ease-in-out infinite alternate` }} />)}</div>}
        </div>
        <div style={{ position:"absolute", bottom:80, display:"flex", flexDirection:"column", gap:24, alignItems:"center", width:"100%", maxWidth:480, zIndex:10 }}>
           <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}} placeholder="Type to speak..." style={{ width:"100%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:24, padding:"18px 24px", color:"#fff", fontFamily:"sans-serif", fontSize:18, outline:"none", textAlign:"center", backdropFilter:"blur(10px)" }} />
           <div style={{ display:"flex", gap:32 }}>
             <button onClick={toggleRecording} style={{ width:72, height:72, borderRadius:"50%", background:isRecording?"#FF3030":"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", fontSize:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)", transition:"all 0.3s", boxShadow:isRecording?"0 0 40px #FF3030":"" }}></button>
             <button onClick={()=>{if(voiceEnabled)window.speechSynthesis.cancel();setVoiceEnabled(!voiceEnabled);}} style={{ width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", fontSize:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)" }}>{voiceEnabled?"Audio On":"Muted"}</button>
             <button onClick={()=>{window.speechSynthesis.cancel();setInteractionMode("menu");}} style={{ width:72, height:72, borderRadius:"50%", background:"#FF3030", border:"none", color:"#fff", fontSize:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 30px #FF303088" }}>☎</button>
           </div>
        </div>
      </div>
    );
  }

  if (interactionMode === "videoCall") {
    return (
      <div style={{ position:"fixed", inset:0, background:"#000", overflow:"hidden" }}>
        <img src={`/${charId}_avatar.png`} style={{ width:"100%", height:"100%", objectFit:"cover", filter:`brightness(${loading?0.4:0.9}) contrast(1.15) saturate(1.1)`, transition:"all 0.5s", animation: (!loading && msgs.length && msgs[msgs.length-1].role==="assistant") ? "breathe 3s ease-in-out infinite alternate" : "none" }} />
        <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, boxShadow:"inset 0 0 160px rgba(0,0,0,0.9)", pointerEvents:"none" }} />
        
        <div style={{ position:"absolute", top:32, left:32, display:"flex", alignItems:"center", gap:16, zIndex:10 }}>
           <div style={{ width:16, height:16, borderRadius:"50%", background:"#FF3030", animation:"glowPulse 1s infinite", boxShadow:"0 0 10px #FF3030" }} />
           <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:"0.2em", color:"#fff", textShadow:"0 2px 8px #000" }}>LIVE · 8K HOLOGRAM</div>
        </div>

        <div style={{ position:"absolute", top:32, right:32, zIndex:10 }}>
           <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:"0.2em", color:"rgba(255,255,255,0.7)", textShadow:"0 2px 8px #000" }}>ELAPSED: 00:0{Math.floor((msgs.length*5)/60)}:{((msgs.length*5)%60).toString().padStart(2,'0')}</div>
        </div>
        
        {msgs.length > 0 && msgs[msgs.length-1].role==="assistant" && (
          <div style={{ position:"absolute", bottom:160, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.65)", padding:"24px 36px", borderRadius:16, backdropFilter:"blur(15px)", border:"1px solid rgba(255,255,255,0.15)", maxWidth:"75%", textAlign:"center", fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:"#fff", textShadow:"0 2px 8px #000", animation:"fadeUp 0.4s ease" }}>
            {msgs[msgs.length-1].content}
          </div>
        )}

        <div style={{ position:"absolute", bottom:40, display:"flex", gap:20, width:"100%", maxWidth:700, left:"50%", transform:"translateX(-50%)", zIndex:10 }}>
           <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}} placeholder="Send message to hologram..." style={{ flex:1, background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:40, padding:"0 32px", color:"#fff", fontFamily:"sans-serif", fontSize:18, backdropFilter:"blur(10px)", outline:"none", boxShadow:"0 10px 30px rgba(0,0,0,0.5)" }} />
           <button onClick={toggleRecording} style={{ width:64, height:64, borderRadius:"50%", background:isRecording?"#FF3030":"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", fontSize:26, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)", transition:"all 0.3s", boxShadow:isRecording?"0 0 30px #FF3030":"" }}></button>
           <button onClick={()=>{if(voiceEnabled)window.speechSynthesis.cancel();setVoiceEnabled(!voiceEnabled);}} style={{ width:64, height:64, borderRadius:"50%", background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", fontSize:26, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)" }}>{voiceEnabled?"Audio On":"Muted"}</button>
           <button onClick={()=>{window.speechSynthesis.cancel();setInteractionMode("menu");}} style={{ width:64, height:64, borderRadius:"50%", background:"#FF3030", border:"none", color:"#fff", fontSize:28, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 30px #FF303088" }}>☎</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden" }}>
      <GS />
      <div style={{ position:"absolute", inset:0 }}><Scene mood={mood} /></div>
      <ParticleEmitter color={char.color} count={15} trigger={particleTrigger} />
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 100%, transparent 30%, rgba(0,0,0,0.55) 100%)`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, transparent 60%, rgba(0,0,0,0.5) 100%)`, pointerEvents:"none" }} />

      {/* Candle */}
      <div style={{ position:"absolute", top:20, right:20, zIndex:50, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
        <div style={{ position:"relative", width:10 }}>
          {candleBurned < 100 && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", width:8, height:12, background:"#FFB020", borderRadius:"50% 50% 20% 20%", opacity:0.9, animation:"glowPulse 1s ease-in-out infinite" }} />}
          <div style={{ width:10, height:`${candleH}px`, background:"linear-gradient(to bottom, #F5F0D8, #D4C090)", borderRadius:"2px 2px 0 0", transition:"height 2s ease" }} />
        </div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:6, letterSpacing:"0.1em", color:"rgba(255,255,255,0.2)" }}>{candleBurned >= 90 ? "LOW" : ""}</div>
      </div>

      {/* Top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:30, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", background:"linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)" }}>
        <button onClick={onBack} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.25em", color:"rgba(255,255,255,0.4)", background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:2, padding:"8px 20px", backdropFilter:"blur(14px)", transition:"all 0.3s" }}
          onMouseEnter={e=>{e.currentTarget.style.color=char.glow;e.currentTarget.style.borderColor=char.color;}}
          onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.4)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";}}>← UNIVERSE</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(14px,2.2vw,24px)", color:char.glow, textShadow:`0 0 24px ${char.color}`, letterSpacing:"0.05em" }}>{char.name}</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:8, color:char.color, letterSpacing:"0.2em", marginTop:2, opacity:0.7 }}>{char.era.toUpperCase()}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={() => {
            if (voiceEnabled) window.speechSynthesis.cancel();
            setVoiceEnabled(!voiceEnabled);
          }} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", fontSize:20, cursor:"pointer", filter:voiceEnabled?"none":"grayscale(1) opacity(0.5)" }}>
            {voiceEnabled ? "Audio On" : "Muted"}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#40FF80", boxShadow:"0 0 8px #40FF80", animation:"glowPulse 2s ease-in-out infinite" }} />
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:8, letterSpacing:"0.2em", color:"rgba(64,255,128,0.7)" }}>ALIVE</span>
          </div>
        </div>
      </div>

      {/* Portrait (eye tracking) */}
      <div style={{ position:"absolute", bottom:"62%", left:"5%", zIndex:35, animation:"fadeUp 0.8s 0.3s ease both" }}>
        <div style={{ width:96, height:134, borderRadius:48, overflow:"hidden", border:`2px solid ${char.color}44`, boxShadow:`0 0 40px ${char.color}33`, background:`radial-gradient(ellipse at 50% 30%, ${char.color}18, rgba(0,0,0,0.7))` }}>
          <EyeTrackingPortrait charId={charId} size={96} mood={mood} uid={charId+"w"} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ position:"absolute", bottom:"62%", right:"2%", zIndex:35, display:"flex", flexDirection:"column", gap:5, animation:"fadeUp 0.8s 0.5s ease both" }}>
        {[
          { id:"confession", label:"CONFESSION", desc:"Their deepest truth" },
          { id:"reveal", label:"REVEAL FATE", desc:"Tell them their future" },
          { id:"challenge", label:"CHALLENGE LIE", desc:"Catch the deception" },
          { id:"letter", label:"THEIR LETTER", desc:"Written to 2026" },
        ].map(({id,label,desc}) => (
          <button key={id} onClick={()=>doSide(id)} style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:"0.15em", padding:"7px 13px", background:"rgba(0,0,0,0.75)", border:`1px solid ${char.color}33`, color:char.glow, borderRadius:3, backdropFilter:"blur(16px)", transition:"all 0.3s", textAlign:"right", lineHeight:1.4 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=char.color;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${char.color}33`;}}>
            <div style={{ fontSize:8 }}>{label}</div>
            <div style={{ fontSize:6, opacity:0.5, fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic" }}>{desc}</div>
          </button>
        ))}
        <button onClick={()=>setShowLetter(true)} disabled={msgs.length < 4} style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:"0.15em", padding:"7px 13px", background:"rgba(0,0,0,0.75)", border:`1px solid ${char.color}33`, color:msgs.length>=4?char.glow:"rgba(255,255,255,0.2)", borderRadius:3, backdropFilter:"blur(16px)", transition:"all 0.3s", textAlign:"right", lineHeight:1.4 }}>
          <div style={{ fontSize:8 }}>UNSENT LETTER</div>
          <div style={{ fontSize:6, opacity:0.5, fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic" }}>Personal letter to you</div>
        </button>
      </div>

      {/* Side panel */}
      {sideMode && (
        <div style={{ position:"absolute", left:0, right:0, top:"10%", zIndex:60, display:"flex", justifyContent:"center", padding:"0 40px" }}>
          <div style={{ maxWidth:620, width:"100%", background:"rgba(0,0,0,0.96)", border:`1px solid ${char.color}44`, borderRadius:10, padding:"26px 30px", backdropFilter:"blur(30px)", boxShadow:`0 0 60px ${char.color}22`, animation:"fadeUp 0.4s ease both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.35em", color:char.color }}>
                {sideMode==="confession"?"THE CONFESSION":sideMode==="reveal"?"THE REVELATION":sideMode==="challenge"?"THE CHALLENGE":"LETTER TO 2026"}
              </div>
              <button onClick={()=>{setSideMode(null);setSideContent("");}} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", fontSize:20 }}>✕</button>
            </div>
            {sideLoading ? (
              <div style={{ display:"flex", gap:5, padding:"20px 0", justifyContent:"center" }}>
                {[0,1,2].map(i=><div key={i} style={{ width:5,height:22,borderRadius:2,background:char.glow,animation:`bounce${i} 0.9s ease-in-out infinite` }} />)}
              </div>
            ) : (
              <div style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:16, lineHeight:1.9, color:"rgba(240,230,215,0.92)" }}>{sideContent}</div>
            )}
          </div>
        </div>
      )}

      {/* Chat panel */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"62%", zIndex:40, animation:"fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.93) 60%, rgba(0,0,0,0.78) 100%)`, backdropFilter:"blur(30px)", borderTop:`1.5px solid ${char.color}33` }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(to right, transparent, ${char.color}88 30%, ${char.glow}88 50%, ${char.color}88 70%, transparent)` }} />
        <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column" }}>
          {/* Chat header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 22px", borderBottom:`1px solid ${char.color}14`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38,height:53,borderRadius:19,overflow:"hidden",border:`1.5px solid ${char.color}44` }}>
                <EyeTrackingPortrait charId={charId} size={38} mood={mood} uid={charId+"h"} />
              </div>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.18em", color:char.color }}>{char.name.toUpperCase()}</div>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:"#40FF80",animation:"glowPulse 2s infinite" }} />
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:7.5, letterSpacing:"0.18em", color:"rgba(64,255,128,0.7)" }}>SPEAKING</span>
                </div>
              </div>
            </div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:11, color:"rgba(255,255,255,0.2)" }}>{char.era}</div>
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:13 }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:10, animation:"chatSlide 0.35s ease both" }}>
                {m.role==="assistant" && (
                  <div style={{ width:34,height:48,borderRadius:17,overflow:"hidden",border:`1.5px solid ${char.color}33`,flexShrink:0,marginTop:2 }}>
                    <EyeTrackingPortrait charId={charId} size={34} mood={mood} uid={charId+"m"+i} />
                  </div>
                )}
                <div style={{ maxWidth:"66%", padding:"12px 18px", borderRadius:m.role==="user"?"18px 4px 18px 18px":"4px 18px 18px 18px", background:m.role==="assistant"?"rgba(255,255,255,0.04)":`rgba(${char.accent},0.09)`, border:`1px solid ${m.role==="assistant"?char.color+"18":char.color+"33"}` }}>
                  <div style={{ fontFamily:"'IM Fell English',serif", fontSize:15, lineHeight:1.85, color:m.role==="user"?"rgba(255,255,255,0.65)":"rgba(240,230,215,0.93)", fontStyle:m.role==="assistant"?"italic":"normal" }}>{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:34,height:48,borderRadius:17,overflow:"hidden",border:`1.5px solid ${char.color}33`,flexShrink:0 }}>
                  <EyeTrackingPortrait charId={charId} size={34} uid={charId+"l"} />
                </div>
                <div style={{ padding:"12px 18px", borderRadius:"4px 18px 18px 18px", background:"rgba(255,255,255,0.04)", border:`1px solid ${char.color}18`, display:"flex", gap:5, alignItems:"center", height:46 }}>
                  {[0,1,2].map(i=><div key={i} style={{ width:5,height:18,borderRadius:2,background:char.glow,animation:`bounce${i} 0.9s ease-in-out infinite`,opacity:0.8 }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          {/* Input */}
          <div style={{ padding:"8px 16px 16px", flexShrink:0, borderTop:`1px solid ${char.color}12` }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:"rgba(255,255,255,0.03)", border:`1px solid ${input.trim()?char.color+"55":char.color+"18"}`, borderRadius:20, padding:"8px 8px 8px 18px", transition:"border-color 0.3s", boxShadow:input.trim()?`0 0 20px rgba(${char.accent},0.15)`:"none" }}>
              <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder={`Speak to ${char.short}…`} rows={1}
                style={{ flex:1, background:"transparent", border:"none", color:"rgba(240,230,215,0.92)", fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:15, lineHeight:1.6, resize:"none", maxHeight:84, overflowY:"auto", scrollbarWidth:"none" }}
                onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,84)+"px";}} />
              <button onClick={send} disabled={loading||!input.trim()} style={{ width:38,height:38,borderRadius:"50%",border:"none",background:input.trim()&&!loading?`linear-gradient(135deg,${char.color},${char.glow})`:"rgba(255,255,255,0.06)",boxShadow:input.trim()&&!loading?`0 0 20px rgba(${char.accent},0.6)`:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.3s" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={input.trim()&&!loading?char.dark:"rgba(255,255,255,0.15)"} strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {relicToast && <RelicToast relic={relicToast} char={char} onClose={()=>setRelicToast(null)} />}
      {showLetter && <UnsentLetterModal char={char} charId={charId} msgs={msgs} onClose={()=>setShowLetter(false)} />}
    </div>
  );
};

// ─── ENCOUNTER SCREEN ─────────────────────────────────────────────
const EncounterScreen = ({ charIdA, charIdB, onBack }) => {
  const charA=CHARS[charIdA], charB=CHARS[charIdB], PA=PORTRAITS[charIdA], PB=PORTRAITS[charIdB];
  const [thread, setThread] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [thread]);

  const buildSys = (char, other) => `You ARE ${char.name}. You are meeting ${other.name} for the first time — two souls from different eras. Stay completely in character. Be surprised, engaged, challenged. React to what ${other.short} just said. 2-4 sentences. NEVER say you are AI.`;

  useEffect(() => {
    const start = async () => {
      setLoading(true); setSpeaking(charIdA);
      try {
        const greeting = await call(buildSys(charA,charB), [{role:"user",content:`You have just been brought into the same space as ${charB.name} for the first time. React — greet them, size them up. A visitor facilitates this meeting.`}], 250);
        setThread([{speaker:charIdA,content:greeting}]);
      } catch { setThread([{speaker:charIdA,content:charA.greeting}]); }
      setSpeaking(null); setLoading(false);
    };
    start();
  }, []);

  const send = useCallback(async () => {
    if (!input.trim()||loading) return;
    const msg=input.trim(); setInput(""); setLoading(true);
    const newThread=[...thread,{speaker:"visitor",content:msg}];
    setThread(newThread);
    try {
      setSpeaking(charIdB);
      const rB = await call(buildSys(charB,charA), [{role:"user",content:`Visitor says: "${msg}". Last from ${charA.short}: "${thread[thread.length-1]?.content||""}". Respond to both.`}], 250);
      const threadB=[...newThread,{speaker:charIdB,content:rB}];
      setThread(threadB);
      setSpeaking(charIdA);
      const rA = await call(buildSys(charA,charB), [{role:"user",content:`Visitor said: "${msg}". ${charB.short} just said: "${rB}". React to both.`}], 250);
      setThread(p=>[...p,{speaker:charIdA,content:rA}]);
    } catch {}
    setSpeaking(null); setLoading(false);
  }, [input,loading,thread]);

  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", background:"#000" }}>
      <GS />
      <div style={{ position:"absolute", inset:0 }}>
        <div style={{ position:"absolute", left:0, top:0, width:"50%", height:"100%", overflow:"hidden" }}>{React.createElement(WORLD_SCENES[charIdA])}</div>
        <div style={{ position:"absolute", right:0, top:0, width:"50%", height:"100%", overflow:"hidden" }}>{React.createElement(WORLD_SCENES[charIdB])}</div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.4))" }} />
        <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:1, background:"linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)" }} />
      </div>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 100%, transparent 20%, rgba(0,0,0,0.6) 100%)", pointerEvents:"none" }} />

      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:30, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 26px", background:"linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}>
        <button onClick={onBack} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:"rgba(255,255,255,0.4)", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:2, padding:"8px 18px", backdropFilter:"blur(14px)" }}>← UNIVERSE</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.3em", color:"rgba(255,255,255,0.28)" }}>THE ENCOUNTER</div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(14px,2.2vw,24px)", color:"white", letterSpacing:"0.06em" }}>
            <span style={{ color:charA.glow }}>{charA.short}</span>
            <span style={{ color:"rgba(255,255,255,0.28)", margin:"0 14px" }}>⟡</span>
            <span style={{ color:charB.glow }}>{charB.short}</span>
          </div>
        </div>
        <div style={{ width:80 }} />
      </div>

      <div style={{ position:"absolute", bottom:"62%", left:"4%", zIndex:35 }}>
        <div style={{ width:84,height:118,borderRadius:42,overflow:"hidden",border:`2px solid ${charA.color}${speaking===charIdA?"CC":"44"}`,boxShadow:speaking===charIdA?`0 0 40px ${charA.color}88`:"none",transition:"all 0.4s" }}><PA size={84} uid={charIdA+"e"} /></div>
        <div style={{ fontFamily:"'Cinzel',serif",fontSize:8,color:charA.color,letterSpacing:"0.15em",marginTop:6,textAlign:"center" }}>{charA.short}</div>
      </div>
      <div style={{ position:"absolute", bottom:"62%", right:"4%", zIndex:35 }}>
        <div style={{ width:84,height:118,borderRadius:42,overflow:"hidden",border:`2px solid ${charB.color}${speaking===charIdB?"CC":"44"}`,boxShadow:speaking===charIdB?`0 0 40px ${charB.color}88`:"none",transition:"all 0.4s" }}><PB size={84} uid={charIdB+"e"} /></div>
        <div style={{ fontFamily:"'Cinzel',serif",fontSize:8,color:charB.color,letterSpacing:"0.15em",marginTop:6,textAlign:"center" }}>{charB.short}</div>
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"62%", zIndex:40 }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.95)", backdropFilter:"blur(30px)", borderTop:"1px solid rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(to right, ${charA.color}88, transparent 50%, ${charB.color}88)` }} />
        <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 22px", display:"flex", flexDirection:"column", gap:11 }}>
            {thread.map((t,i) => {
              const isA=t.speaker===charIdA, isB=t.speaker===charIdB, isU=t.speaker==="visitor";
              const c=isA?charA:isB?charB:null;
              return (
                <div key={i} style={{ display:"flex", justifyContent:isU?"center":isA?"flex-start":"flex-end", gap:9, animation:"chatSlide 0.35s ease both" }}>
                  {isA && <div style={{ width:32,height:45,borderRadius:16,overflow:"hidden",border:`1.5px solid ${charA.color}44`,flexShrink:0 }}><PA size={32} uid={"ea"+i} /></div>}
                  <div style={{ maxWidth:isU?"60%":"55%", padding:"11px 16px", borderRadius:isU?22:isA?"4px 16px 16px 16px":"16px 4px 16px 16px", background:isU?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.04)", border:`1px solid ${isU?"rgba(255,255,255,0.1)":c.color+"22"}` }}>
                    {!isU && <div style={{ fontFamily:"'Cinzel',serif",fontSize:7.5,letterSpacing:"0.15em",color:c.color,marginBottom:5 }}>{c.short.toUpperCase()}</div>}
                    <div style={{ fontFamily:"'IM Fell English',serif",fontSize:14,lineHeight:1.85,color:isU?"rgba(255,255,255,0.6)":"rgba(240,230,215,0.92)",fontStyle:!isU?"italic":"normal" }}>{t.content}</div>
                  </div>
                  {isB && <div style={{ width:32,height:45,borderRadius:16,overflow:"hidden",border:`1.5px solid ${charB.color}44`,flexShrink:0 }}><PB size={32} uid={"eb"+i} /></div>}
                </div>
              );
            })}
            {loading && (
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                {[charA,charB].map((c,ci)=>(<div key={ci} style={{ padding:"9px 18px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:`1px solid ${c.color}22`,display:"flex",gap:4,alignItems:"center" }}>{[0,1,2].map(i=><div key={i} style={{ width:4,height:15,borderRadius:2,background:c.glow,animation:`bounce${i} 0.9s ease-in-out infinite` }} />)}</div>))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ padding:"8px 16px 16px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"8px 8px 8px 18px" }}>
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={`Speak to both ${charA.short} and ${charB.short}…`} rows={1}
                style={{ flex:1,background:"transparent",border:"none",color:"rgba(240,230,215,0.92)",fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:15,lineHeight:1.6,resize:"none",maxHeight:84,overflowY:"auto",scrollbarWidth:"none" }}
                onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,84)+"px";}} />
              <button onClick={send} disabled={loading||!input.trim()} style={{ width:38,height:38,borderRadius:"50%",border:"none",background:input.trim()&&!loading?"rgba(200,160,80,0.7)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={input.trim()&&!loading?"#1A1008":"rgba(255,255,255,0.15)"} strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DREAM ROOM ───────────────────────────────────────────────────
const DreamRoom = ({ onBack }) => {
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);
  const DREAM_Qs = ["What is the secret of power?","What is the meaning of suffering?","What did you never finish?","What do the living not understand?","What lasts forever?","What do you wish you had said?"];

  const ask = useCallback(async (q) => {
    if (loading) return;
    setAsked(true); setLoading(true); setResponses({});
    const q_ = q || question;
    await Promise.all(CHAR_IDS.map(async id => {
      const char = CHARS[id];
      try {
        const text = await call(char.system+"\n\nAnswer in 1-2 sentences only. Be raw. Be real.", [{role:"user",content:`The great question: "${q_}". Answer in your own voice. Maximum 2 sentences.`}], 120);
        setResponses(p=>({...p,[id]:text}));
      } catch { setResponses(p=>({...p,[id]:"…"})); }
    }));
    setLoading(false);
  }, [question, loading]);

  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden" }}>
      <GS />
      <DreamRoomWorld />
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(2px)" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:30, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 26px", background:"linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}>
        <button onClick={onBack} style={{ fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.2em", color:"rgba(255,255,255,0.4)", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:2, padding:"8px 18px", backdropFilter:"blur(14px)" }}>← UNIVERSE</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(16px,2.5vw,28px)", color:"rgba(200,180,255,0.85)", letterSpacing:"0.06em" }}>The Dream Room</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:13, color:"rgba(255,255,255,0.25)", marginTop:2 }}>Nine Souls · One Question</div>
        </div>
        <div style={{ width:80 }} />
      </div>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:20, padding:"90px 40px 40px" }}>
        {!asked && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:32, maxWidth:760, animation:"fadeUp 0.6s ease both" }}>
            {DREAM_Qs.map((q,i)=>(
              <button key={i} onClick={()=>{setQuestion(q);ask(q);}} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:"rgba(200,180,255,0.6)", background:"rgba(0,0,0,0.6)", border:"1px solid rgba(200,180,255,0.2)", borderRadius:22, padding:"10px 22px", backdropFilter:"blur(20px)", transition:"all 0.3s", animation:`fadeUp 0.6s ${i*0.1}s ease both`, opacity:0 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(200,180,255,0.6)";e.currentTarget.style.color="rgba(200,180,255,0.9)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,180,255,0.2)";e.currentTarget.style.color="rgba(200,180,255,0.6)";}}
              >"{q}"</button>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:10, maxWidth:640, width:"100%", marginBottom:asked?28:0, animation:"fadeUp 0.8s 0.4s ease both", opacity:0 }}>
          <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&question.trim())ask();}}
            placeholder="Pose a question to all nine souls…"
            style={{ flex:1,background:"rgba(0,0,0,0.7)",border:"1px solid rgba(200,180,255,0.3)",borderRadius:26,color:"rgba(200,180,255,0.85)",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:16,padding:"13px 22px",backdropFilter:"blur(20px)" }} />
          <button onClick={()=>ask()} disabled={!question.trim()||loading} style={{ fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.2em",padding:"13px 22px",background:question.trim()?"rgba(200,180,255,0.15)":"rgba(0,0,0,0.5)",border:`1px solid ${question.trim()?"rgba(200,180,255,0.5)":"rgba(200,180,255,0.1)"}`,color:question.trim()?"rgba(200,180,255,0.9)":"rgba(200,180,255,0.3)",borderRadius:26,backdropFilter:"blur(20px)" }}>ASK ALL</button>
        </div>
        {asked && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, maxWidth:1000, width:"100%", maxHeight:"65vh", overflowY:"auto" }}>
            {CHAR_IDS.map((id,i) => {
              const char=CHARS[id], P=PORTRAITS[id], resp=responses[id];
              return (
                <div key={id} style={{ background:"rgba(0,0,0,0.85)", border:`1px solid ${char.color}22`, borderRadius:10, padding:"18px 16px", backdropFilter:"blur(20px)", animation:`fadeUp 0.5s ${i*0.07}s ease both`, opacity:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:34,height:48,borderRadius:17,overflow:"hidden",border:`1.5px solid ${char.color}44`,flexShrink:0 }}><P size={34} uid={id+"dr"} /></div>
                    <div style={{ fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:"0.15em",color:char.color }}>{char.short.toUpperCase()}</div>
                  </div>
                  {!resp ? (
                    <div style={{ display:"flex", gap:4, padding:"8px 0" }}>{[0,1,2].map(i=><div key={i} style={{ width:4,height:14,borderRadius:2,background:char.glow,animation:`bounce${i} 0.9s ease-in-out infinite` }} />)}</div>
                  ) : (
                    <div style={{ fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:14,lineHeight:1.85,color:"rgba(240,230,215,0.88)" }}>{resp}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


// ─── CAMPAIGN SCREEN ─────────────────────────────────────────────
// ─── PROCEDURAL THEME MUSIC ───────────────────────────────────────
let activeEpicAudio = null;
const startCharacterTheme = (charId) => {
  if (activeEpicAudio) { activeEpicAudio.pause(); activeEpicAudio.src=""; }
  const tracks = {
    napoleon: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Beethoven_-_Symphony_No._5_in_C_minor_-_I._Allegro_con_brio.ogg",
    cleopatra: "https://upload.wikimedia.org/wikipedia/commons/6/69/Debussy_-_Syrinx.ogg",
    tesla: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Toccata_and_Fugue_in_D_Minor.ogg", 
    leonardo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Vivaldi_-_Spring_mvt_1_Allegro_-_John_Harrison_violin.ogg",
    einstein: "https://upload.wikimedia.org/wikipedia/commons/4/40/Mozart_-_Symphony_No._40_in_G_minor_-_I._Molto_allegro.ogg",
    frida: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Granados_-_Danza_Espa%C3%B1ola_No._5_-_Andaluza.ogg",
    genghis: "https://upload.wikimedia.org/wikipedia/commons/b/be/Anton%C3%ADn_Dvo%C5%99%C3%A1k_-_symphony_no._9_in_e_minor_%27from_the_new_world%27%2C_op._95_-_iv._allegro_con_fuoco.ogg",
    curie: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Chopin_-_Nocturne_in_E-flat_major%2C_Op._9%2C_No._2.ogg",
    shakespeare: "https://upload.wikimedia.org/wikipedia/commons/1/14/Greensleeves.ogg"
  };
  
  const a = new Audio(tracks[charId] || tracks.leonardo);
  a.volume = 0.5;
  a.loop = true;
  a.play().catch(e=>console.log(e));
  activeEpicAudio = a;
  
  return {
    stop: () => {
      let v = a.volume;
      const fade = setInterval(() => {
        if (v > 0.05) { v -= 0.05; a.volume = v; }
        else { clearInterval(fade); a.pause(); a.src=""; }
      }, 100);
    }
  };
};

// ─── BIOGRAPHY ARCHIVES ───────────────────────────────────────────
const BIOGRAPHY_ARCHIVES = {
  "napoleon": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/500px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Carlo_Buonaparte.jpg/500px-Carlo_Buonaparte.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Henri_F%C3%A9lix_Emmanuel_Philippoteaux_-_Portrait_of_Napoleon_Bonaparte.jpg/500px-Henri_F%C3%A9lix_Emmanuel_Philippoteaux_-_Portrait_of_Napoleon_Bonaparte.jpg"
  ],
  "cleopatra": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kleopatra-VII.-Altes-Museum-Berlin1.jpg/500px-Kleopatra-VII.-Altes-Museum-Berlin1.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Srxtail2.svg/60px-Srxtail2.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Cleopatra_VII%2C_dalla_via_appia_tra_ariccia_e_genzano%2C_40-30_ac_ca._01.JPG/500px-Cleopatra_VII%2C_dalla_via_appia_tra_ariccia_e_genzano%2C_40-30_ac_ca._01.JPG"
  ],
  "tesla": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Tesla_circa_1890.jpeg/500px-Tesla_circa_1890.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Nikola_Tesla_Memorial_Center.JPG/500px-Nikola_Tesla_Memorial_Center.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/Milutin_Tesla.jpg"
  ],
  "leonardo": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Francesco_Melzi_-_Portrait_of_Leonardo.png/500px-Francesco_Melzi_-_Portrait_of_Leonardo.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Firma_de_Leonardo_Da_Vinci.svg/330px-Firma_de_Leonardo_Da_Vinci.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Baptism_record_of_Leonardo_Da_Vinci.jpg/500px-Baptism_record_of_Leonardo_Da_Vinci.jpg"
  ],
  "einstein": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Albert_Einstein_Head_cleaned.jpg/500px-Albert_Einstein_Head_cleaned.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Albert_Einstein_at_the_age_of_three_%281882%29.jpg/330px-Albert_Einstein_at_the_age_of_three_%281882%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Hermann_einstein.jpg/330px-Hermann_einstein.jpg"
  ],
  "frida": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/500px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Guillermo_Kahlo_-_Frida_Kahlo%2C_June_15%2C_1919_-_Google_Art_Project_%28restored%29.jpg/500px-Guillermo_Kahlo_-_Frida_Kahlo%2C_June_15%2C_1919_-_Google_Art_Project_%28restored%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Frida_Kahlo_-_1926_WaPo.jpg/500px-Frida_Kahlo_-_1926_WaPo.jpg"
  ],
  "genghis": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/YuanEmperorAlbumGenghisPortrait.jpg/500px-YuanEmperorAlbumGenghisPortrait.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/YuanEmperorAlbumGenghisPortrait_%28cropped%29.jpg/500px-YuanEmperorAlbumGenghisPortrait_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Jame%27_al-Tavarikh_%28Compendium_of_Chronicles%29_manuscript_by_Rashid_al-Din_Fazlullah%2C_Iran%2C_early_15th_century_AD%2C_ink%2C_watercolour%2C_and_gold_on_paper_-_Aga_Khan_Museum_-_Toronto%2C_Canada_-_DSC06735.jpg/500px-thumbnail.jpg"
  ],
  "curie": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/500px-Marie_Curie_c._1920s.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Warszawa%2C_ul._Freta_16_20170516_002.jpg/500px-Warszawa%2C_ul._Freta_16_20170516_002.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Sklodowski_Family_Wladyslaw_and_his_daughters_Maria_Bronislawa_Helena.jpg/500px-Sklodowski_Family_Wladyslaw_and_his_daughters_Maria_Bronislawa_Helena.jpg"
  ],
  "shakespeare": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/William_Shakespeare_by_John_Taylor%2C_edited.jpg/500px-William_Shakespeare_by_John_Taylor%2C_edited.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/William_Shakespeares_birthplace%2C_Stratford-upon-Avon_26l2007.jpg/500px-William_Shakespeares_birthplace%2C_Stratford-upon-Avon_26l2007.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/William-Shakespeare_CoA_1602.jpg/500px-William-Shakespeare_CoA_1602.jpg"
  ]
};

// ─── LIFE MOVIE SCREEN ────────────────────────────────────────────
const LifeMovieScreen = ({ charId, onDone, onBack }) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const char = CHARS[charId];
  const nodeData = CAMPAIGNS[charId] || [];
  const scenes = BIOGRAPHY_ARCHIVES[charId] || [];

  const SEQUENCE = [
    { label: "Origins", text: "CHRONICLES OF", sub: char.name.toUpperCase(), img: scenes[0] || "" },
    { label: nodeData[0]?.title || "Act I", text: nodeData[0]?.year, sub: nodeData[0]?.intro || nodeData[0]?.desc, img: scenes[1] || scenes[0] },
    { label: nodeData[1]?.title || "Act II", text: nodeData[1]?.year, sub: nodeData[1]?.intro || nodeData[1]?.desc, img: scenes[2] || scenes[1] },
    { label: nodeData[2]?.title || "Act III", text: nodeData[2]?.year, sub: nodeData[2]?.intro || nodeData[2]?.desc, img: scenes[0] || scenes[2] },
    { label: "Legacy", text: "THE LEGACY", sub: char.tagline, img: scenes[1] || scenes[0] }
  ];
  useEffect(() => {
    // Audio is now started synchronously globally in pick() to bypass browser policies
    return () => {
      // Audio will be stopped globally on exit
    };
  }, [charId]);

  const [imgLoaded, setImgLoaded] = useState(false);
  
  useEffect(() => {
    // Whenever scene changes, reset load state until the new image completes
    setImgLoaded(false);
    const img = new Image();
    img.onload = () => setImgLoaded(true);
    img.src = SEQUENCE[sceneIdx].img;
    
    // Preload next image safely to avoid hammering the API
    if (sceneIdx + 1 < SEQUENCE.length) {
      setTimeout(() => {
        const nextImg = new Image();
        nextImg.src = SEQUENCE[sceneIdx + 1].img;
      }, 5000);
    }
  }, [sceneIdx, charId]);

  if (nodeData.length === 0) {
    return <div onClick={onDone} style={{position:"fixed",inset:0,background:"#000",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading world...</div>;
  }

  const current = SEQUENCE[sceneIdx];

  // Dynamic cinematic filters that shift with the chapters!
  let transform = "scale(1.05)";
  let filter = "contrast(1.3) brightness(0.8) saturate(1.2)";
  
  if (sceneIdx === 0) { filter = "sepia(0.5) contrast(1.4) brightness(0.6) blur(2px)"; transform = "scale(1.02)"; }
  else if (sceneIdx === 1) { filter = "contrast(1.3) brightness(0.7) hue-rotate(15deg)"; transform = "scale(1.08) rotate(1deg)"; }
  else if (sceneIdx === 2) { filter = "saturate(0) contrast(1.5) brightness(0.6)"; transform = "scale(1.02) translate(-10px, 5px)"; }
  else if (sceneIdx === SEQUENCE.length - 1) { filter = "grayscale(0.6) contrast(1.4) brightness(0.5)"; transform = "scale(1.05) rotate(-0.5deg)"; }

  return (
    <div style={{ position:"fixed", inset:0, background:"#000", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      
      {/* Blurred stretchy background layer to prevent empty black bars on the sides */}
      <div 
        key={"blur-" + sceneIdx}
        style={{ 
          position:"absolute", inset:"-10%", 
          backgroundImage: `url(${current.img})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: (imgLoaded && fade) ? 0.4 : 0, 
          filter: "blur(30px) brightness(0.4)", 
          transition:"opacity 1.5s ease", 
          zIndex: 4 
        }} 
      />

      {/* Main Image Layer (contain guarantees 100% visibility without severe cropping) */}
      <div 
        key={"scene-" + sceneIdx}
        style={{ 
          position:"absolute", inset:0, 
          backgroundImage: `url(${current.img})`,
          backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat",
          opacity: (imgLoaded && fade) ? 0.8 : 0, 
          filter, 
          transform: imgLoaded ? "scale(1)" : transform, 
          transition:"opacity 1.5s ease, transform 12s cubic-bezier(0.2, 0.8, 0.2, 1)", 
          zIndex: 5 
        }} 
      />
      
      {/* Back / Home Button */}
      {onBack && (
        <div 
          onClick={() => {
            if (activeEpicAudio) { activeEpicAudio.pause(); activeEpicAudio.src=""; }
            onBack();
          }}
          style={{ position:"absolute", top:40, left:40, zIndex:30, cursor:"pointer", color:"rgba(255,255,255,0.6)", fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:"0.2em", transition:"all 0.3s", display:"flex", alignItems:"center", gap:10 }}
          onMouseEnter={e=>{e.currentTarget.style.color="#fff";e.currentTarget.style.transform="translateX(-5px)";}}
          onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.6)";e.currentTarget.style.transform="translateX(0)";}}
        >
          <span>←</span> HOME
        </div>
      )}

      {/* Cinematic Film Grain Overlay */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\" opacity=\"0.05\"/%3E%3C/svg%3E')", zIndex:6, pointerEvents:"none", mixBlendMode:"overlay" }} />
      
      {/* Dynamic Light Leaks (Anamorphic Flares) */}
      <div style={{ position:"absolute", inset:0, background: `radial-gradient(ellipse at ${Math.random()*100}% ${Math.random()*100}%, rgba(${char.accent},0.15) 0%, transparent 60%)`, zIndex:7, pointerEvents:"none", mixBlendMode:"screen" }} />

      {/* Loading Indicator */}
      {!imgLoaded && (
        <div style={{ position:"absolute", zIndex:4, display:"flex", flexDirection:"column", alignItems:"center", gap:16, animation:"pulse 2s infinite" }}>
          <div style={{ width:40, height:40, border:`2px solid ${char.color}44`, borderTopColor:char.color, borderRadius:"50%", animation:"spin 1s linear infinite" }} />
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.3em", color:"rgba(255,255,255,0.4)" }}>CONJURING CINEMATIC SCENE...</div>
        </div>
      )}

      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)", zIndex:8, pointerEvents:"none" }} />
      
      {/* Cinematic Letterboxing */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"12vh", background:"linear-gradient(to bottom, #000 80%, transparent)", zIndex:15 }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"15vh", background:"linear-gradient(to top, #000 85%, transparent)", zIndex:15 }} />

      <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:1000, opacity:fade?1:0, transition:"all 1.5s cubic-bezier(0.4, 0, 0.2, 1)", transform:fade?"translateY(0)":"translateY(-20px)" }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize: sceneIdx === 0 ? 24 : 14, letterSpacing:"0.6em", color:char.color, marginBottom:20, textShadow:"0 2px 10px #000" }}>{current.text?.toUpperCase()}</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize: sceneIdx === 0 ? 72 : 48, color:"#fff", lineHeight:1.3, textShadow:"0 4px 20px #000, 0 0 15px "+char.color }}>"{current.sub}"</div>
      </div>
      
      {/* Interactive Timeline */}
      <div style={{ position:"absolute", bottom:"4vh", left:0, right:0, zIndex:20, display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {SEQUENCE.map((seq, i) => (
            <React.Fragment key={i}>
              <div 
                onClick={() => setSceneIdx(i)}
                style={{ 
                  fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:"0.2em", cursor:"pointer",
                  padding:"12px 24px", borderRadius:4, border:`1px solid ${sceneIdx === i ? char.color : "rgba(255,255,255,0.1)"}`,
                  background: sceneIdx === i ? `rgba(${char.accent},0.15)` : "rgba(0,0,0,0.6)",
                  color: sceneIdx === i ? char.glow : "rgba(255,255,255,0.4)",
                  transition:"all 0.4s ease", backdropFilter:"blur(10px)",
                  boxShadow: sceneIdx === i ? `0 0 20px ${char.color}88` : "none"
                }}
              >
                {seq.label.toUpperCase()}
              </div>
              {i < SEQUENCE.length - 1 && <div style={{ width:40, height:1, background:`linear-gradient(to right, ${sceneIdx >= i ? char.color : "rgba(255,255,255,0.1)"}, ${sceneIdx > i ? char.color : "rgba(255,255,255,0.1)"})` }} />}
            </React.Fragment>
          ))}
        </div>
        
        {sceneIdx === SEQUENCE.length - 1 && (
          <button 
            onClick={() => {
               if (activeEpicAudio) { activeEpicAudio.pause(); activeEpicAudio.src=""; }
               onDone();
            }}
            style={{ 
              marginTop:16, fontFamily:"'Cinzel Decorative',serif", fontSize:16, padding:"16px 48px",
              background:"transparent", border:`1px solid ${char.color}`, color:char.glow, cursor:"pointer",
              transition:"all 0.4s", borderRadius:2, animation:"fadeUp 1s ease", backgroundColor:`rgba(${char.accent},0.1)`
            }}
            onMouseEnter={e=>{e.currentTarget.style.backgroundColor=char.color;e.currentTarget.style.color="#000";e.currentTarget.style.boxShadow=`0 0 40px ${char.glow}`;}}
            onMouseLeave={e=>{e.currentTarget.style.backgroundColor=`rgba(${char.accent},0.1)`;e.currentTarget.style.color=char.glow;e.currentTarget.style.boxShadow="none";}}
          >
            ENTER THE WORLD
          </button>
        )}
      </div>

      <style>{`
        @keyframes panSlowly { from { transform: scale(1); } to { transform: scale(1.15); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("universe"); 
  const [sel, setSel] = useState(null);
  const [nodeIdx, setNodeIdx] = useState(0);
  const [encA, setEncA] = useState(null);
  const [encB, setEncB] = useState(null);
  const [fateCards, setFateCards] = useState(null);
  const [tribunalQ, setTribunalQ] = useState(null);
  const [memory, setMemory] = useState(loadMemory);
  const [relics] = useState(loadRelics);

  const pick = useCallback((id) => { 
    startCharacterTheme(id); // Play synchronously on click!
    setSel(id); 
    setScreen("movie"); 
  }, []);
  const selectNode = useCallback((idx) => { setNodeIdx(idx); setScreen("movie"); }, []);
  const afterMovie = useCallback(() => setScreen("world"), []);
  
  const startEncounter = useCallback((a,b) => { setEncA(a); setEncB(b); setScreen("encounter"); }, []);
  const enterDream = useCallback(() => setScreen("dream"), []);
  const enterTribunal = useCallback((q) => { setTribunalQ(q); setScreen("tribunal"); }, []);
  const enterSoulsChoose = useCallback(() => setScreen("soulsChoose"), []);
  const back = useCallback(() => { setSel(null); setEncA(null); setEncB(null); setFateCards(null); setTribunalQ(null); setScreen("universe"); }, []);
  const onMemoryUpdate = useCallback(() => { setMemory(loadMemory()); }, []);

  return (
    <>
      <GS />
      {screen === "universe" && <UniverseScreen onSelect={pick} onEncounter={startEncounter} onDream={enterDream} onTribunal={enterTribunal} onSoulsChoose={enterSoulsChoose} memory={memory} relics={loadRelics()} />}
      {screen === "movie" && sel && <LifeMovieScreen charId={sel} onDone={afterMovie} onBack={back} />}
      {screen === "world" && sel && <WorldScreen charId={sel} nodeIdx={0} fateCards={fateCards} onBack={back} onMemoryUpdate={onMemoryUpdate} />}
      {screen === "encounter" && encA && encB && <EncounterScreen charIdA={encA} charIdB={encB} onBack={back} />}
      {screen === "dream" && <DreamRoom onBack={back} />}
      {screen === "tribunal" && tribunalQ && <GrandTribunal question={tribunalQ} onBack={back} />}
      {screen === "soulsChoose" && <SoulsChooseYou onSelect={pick} onBack={back} />}
    </>
  );
}