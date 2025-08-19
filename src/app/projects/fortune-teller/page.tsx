"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

// Типы данных для приложения гаданий
interface TarotCard {
  id: string;
  name: string;
  nameRu: string;
  suit: 'major' | 'cups' | 'wands' | 'swords' | 'pentacles';
  number?: number;
  keywords: string[];
  meaning: {
    upright: string;
    reversed: string;
  };
  image: string;
  element?: string;
  planet?: string;
}

interface TarotReading {
  id: string;
  type: 'single' | 'three-card' | 'celtic-cross';
  question: string;
  cards: {
    card: TarotCard;
    position: string;
    reversed: boolean;
  }[];
  interpretation: string;
  date: Date;
  mood: 'positive' | 'neutral' | 'challenging';
}

interface ZodiacSign {
  id: string;
  name: string;
  nameRu: string;
  dates: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
  planet: string;
  symbol: string;
  traits: string[];
  compatibility: string[];
}

interface Horoscope {
  sign: string;
  period: 'daily' | 'weekly' | 'monthly';
  prediction: string;
  luckNumber: number;
  luckColor: string;
  advice: string;
  mood: 'excellent' | 'good' | 'neutral' | 'challenging';
  date: Date;
}

interface RuneStone {
  id: string;
  name: string;
  nameRu: string;
  symbol: string;
  meaning: string;
  keywords: string[];
  element?: string;
  description: string;
}

interface Fortune {
  id: string;
  type: 'crystal-ball' | 'rune' | 'fortune-cookie';
  question?: string;
  result: string;
  advice: string;
  date: Date;
}

interface UserProfile {
  birthDate?: Date;
  zodiacSign?: string;
  favoriteCards: string[];
  readingsCount: number;
  fortunesCount: number;
  level: number;
  experience: number;
  achievements: string[];
}

// Данные карт Таро (упрощенная версия)
const tarotCards: TarotCard[] = [
  {
    id: "fool",
    name: "The Fool",
    nameRu: "Дурак",
    suit: "major",
    number: 0,
    keywords: ["новые начинания", "спонтанность", "вера"],
    meaning: {
      upright: "Новые начинания, спонтанность, вера в будущее. Время для смелых решений.",
      reversed: "Неосторожность, безрассудство, страх перед новым."
    },
    image: "🃏",
    element: "Воздух",
    planet: "Уран"
  },
  {
    id: "magician",
    name: "The Magician",
    nameRu: "Маг",
    suit: "major",
    number: 1,
    keywords: ["сила воли", "мастерство", "концентрация"],
    meaning: {
      upright: "У вас есть все инструменты для достижения цели. Время действовать.",
      reversed: "Недостаток уверенности, неиспользованный потенциал."
    },
    image: "🎩",
    element: "Воздух",
    planet: "Меркурий"
  },
  {
    id: "high-priestess",
    name: "The High Priestess",
    nameRu: "Верховная Жрица",
    suit: "major",
    number: 2,
    keywords: ["интуиция", "тайны", "подсознание"],
    meaning: {
      upright: "Доверьтесь интуиции. Тайные знания откроются вам.",
      reversed: "Игнорирование внутреннего голоса, поверхностность."
    },
    image: "🌙",
    element: "Вода",
    planet: "Луна"
  },
  {
    id: "empress",
    name: "The Empress",
    nameRu: "Императрица",
    suit: "major",
    number: 3,
    keywords: ["материнство", "плодородие", "природа"],
    meaning: {
      upright: "Время творчества и роста. Изобилие во всех сферах жизни.",
      reversed: "Блокировка творческой энергии, зависимость от других."
    },
    image: "👑",
    element: "Земля",
    planet: "Венера"
  },
  {
    id: "emperor",
    name: "The Emperor",
    nameRu: "Император",
    suit: "major",
    number: 4,
    keywords: ["власть", "стабильность", "порядок"],
    meaning: {
      upright: "Лидерство и контроль ситуации. Структура и дисциплина важны.",
      reversed: "Авторитарность, потеря контроля, хаос."
    },
    image: "👤",
    element: "Огонь",
    planet: "Марс"
  },
  {
    id: "lovers",
    name: "The Lovers",
    nameRu: "Влюбленные",
    suit: "major",
    number: 6,
    keywords: ["любовь", "выбор", "гармония"],
    meaning: {
      upright: "Важный выбор в отношениях. Гармония и взаимопонимание.",
      reversed: "Разлад в отношениях, неправильный выбор."
    },
    image: "💕",
    element: "Воздух",
    planet: "Близнецы"
  },
  {
    id: "death",
    name: "Death",
    nameRu: "Смерть",
    suit: "major",
    number: 13,
    keywords: ["трансформация", "конец", "новое начало"],
    meaning: {
      upright: "Окончание одного этапа и начало нового. Трансформация неизбежна.",
      reversed: "Сопротивление переменам, застой."
    },
    image: "⚰️",
    element: "Вода",
    planet: "Скорпион"
  },
  {
    id: "sun",
    name: "The Sun",
    nameRu: "Солнце",
    suit: "major",
    number: 19,
    keywords: ["радость", "успех", "энергия"],
    meaning: {
      upright: "Успех, радость, позитивная энергия. Все идет отлично!",
      reversed: "Временные трудности, недостаток энергии."
    },
    image: "☀️",
    element: "Огонь",
    planet: "Солнце"
  }
];

// Знаки зодиака
const zodiacSigns: ZodiacSign[] = [
  {
    id: "aries",
    name: "Aries",
    nameRu: "Овен",
    dates: "21 мар - 19 апр",
    element: "fire",
    quality: "cardinal",
    planet: "Марс",
    symbol: "♈",
    traits: ["энергичный", "лидер", "импульсивный", "смелый"],
    compatibility: ["Лев", "Стрелец", "Близнецы"]
  },
  {
    id: "taurus",
    name: "Taurus",
    nameRu: "Телец",
    dates: "20 апр - 20 мая",
    element: "earth",
    quality: "fixed",
    planet: "Венера",
    symbol: "♉",
    traits: ["стабильный", "упорный", "практичный", "чувственный"],
    compatibility: ["Дева", "Козерог", "Рак"]
  },
  {
    id: "gemini",
    name: "Gemini",
    nameRu: "Близнецы",
    dates: "21 мая - 20 июн",
    element: "air",
    quality: "mutable",
    planet: "Меркурий",
    symbol: "♊",
    traits: ["общительный", "любознательный", "изменчивый", "умный"],
    compatibility: ["Весы", "Водолей", "Овен"]
  },
  {
    id: "cancer",
    name: "Cancer",
    nameRu: "Рак",
    dates: "21 июн - 22 июл",
    element: "water",
    quality: "cardinal",
    planet: "Луна",
    symbol: "♋",
    traits: ["эмоциональный", "заботливый", "интуитивный", "домашний"],
    compatibility: ["Скорпион", "Рыбы", "Телец"]
  },
  {
    id: "leo",
    name: "Leo",
    nameRu: "Лев",
    dates: "23 июл - 22 авг",
    element: "fire",
    quality: "fixed",
    planet: "Солнце",
    symbol: "♌",
    traits: ["гордый", "щедрый", "творческий", "лидер"],
    compatibility: ["Овен", "Стрелец", "Близнецы"]
  },
  {
    id: "virgo",
    name: "Virgo",
    nameRu: "Дева",
    dates: "23 авг - 22 сен",
    element: "earth",
    quality: "mutable",
    planet: "Меркурий",
    symbol: "♍",
    traits: ["аналитичный", "практичный", "перфекционист", "скромный"],
    compatibility: ["Телец", "Козерог", "Рак"]
  }
];

// Руны
const runeStones: RuneStone[] = [
  {
    id: "fehu",
    name: "Fehu",
    nameRu: "Феху",
    symbol: "ᚠ",
    meaning: "Богатство, деньги, успех в делах",
    keywords: ["богатство", "успех", "энергия", "новые возможности"],
    element: "Огонь",
    description: "Руна материального благополучия и новых начинаний."
  },
  {
    id: "uruz",
    name: "Uruz",
    nameRu: "Уруз",
    symbol: "ᚢ",
    meaning: "Сила, здоровье, жизненная энергия",
    keywords: ["сила", "здоровье", "дикая природа", "первобытная энергия"],
    element: "Земля",
    description: "Руна первобытной силы и жизненной энергии."
  },
  {
    id: "ansuz",
    name: "Ansuz",
    nameRu: "Ансуз",
    symbol: "ᚨ",
    meaning: "Знания, общение, божественная мудрость",
    keywords: ["мудрость", "общение", "вдохновение", "божественный дар"],
    element: "Воздух",
    description: "Руна божественной мудрости и вдохновения."
  },
  {
    id: "raidho",
    name: "Raidho",
    nameRu: "Райдо",
    symbol: "ᚱ",
    meaning: "Путешествие, движение, прогресс",
    keywords: ["путешествие", "движение", "ритм", "прогресс"],
    element: "Воздух",
    description: "Руна движения и духовного путешествия."
  },
  {
    id: "algiz",
    name: "Algiz",
    nameRu: "Альгиз",
    symbol: "ᛉ",
    meaning: "Защита, духовная связь, высшие силы",
    keywords: ["защита", "связь с богами", "интуиция", "духовность"],
    element: "Воздух",
    description: "Руна защиты и связи с высшими силами."
  }
];

// Готовые предсказания для разных ситуаций
const fortunePredictions = {
  love: [
    "💕 Скоро в вашей жизни появится особенный человек, который изменит ваш взгляд на любовь.",
    "❤️ Существующие отношения укрепятся благодаря вашей открытости и честности.",
    "💖 Время простить прошлые обиды и открыть сердце для новых чувств.",
    "💝 Любовь придет к вам неожиданно, будьте готовы к сюрпризам судьбы.",
    "💘 Ваша душевная теплота притянет к вам родственную душу."
  ],
  career: [
    "💼 Новые профессиональные возможности откроются благодаря вашим скрытым талантам.",
    "📈 Ваша настойчивость и трудолюбие вскоре принесут заслуженное признание.",
    "🎯 Сосредоточьтесь на главной цели - успех не заставит себя ждать.",
    "💡 Креативный подход к работе принесет неожиданные плоды.",
    "🌟 Лидерские качества проявятся в ближайшем проекте."
  ],
  health: [
    "🌱 Время заботы о себе - ваше здоровье требует внимания и любви.",
    "⚡ Энергетические практики помогут восстановить внутренний баланс.",
    "🏃‍♀️ Физическая активность принесет не только здоровье, но и ясность ума.",
    "🧘‍♀️ Медитация и релаксация станут ключом к внутренней гармонии.",
    "🌿 Природа подарит вам исцеление и новые силы."
  ],
  general: [
    "✨ Вселенная готовит для вас особенный сюрприз - будьте открыты к переменам.",
    "🌈 После периода трудностей наступает время радости и изобилия.",
    "🔮 Ваша интуиция сейчас особенно сильна - доверьтесь внутреннему голосу.",
    "🌟 Новые знакомства принесут в вашу жизнь свежие идеи и возможности.",
    "🎭 Время раскрыть свои творческие способности миру."
  ]
};

// Основной компонент Fortune Teller AI
export default function FortuneTellerAI() {
  const [currentView, setCurrentView] = useState<'home' | 'tarot' | 'astrology' | 'runes' | 'crystal-ball' | 'profile'>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    favoriteCards: [],
    readingsCount: 0,
    fortunesCount: 0,
    level: 1,
    experience: 0,
    achievements: []
  });
  const [readings, setReadings] = useState<TarotReading[]>([]);
  const [fortunes, setFortunes] = useState<Fortune[]>([]);
  const [horoscopes, setHoroscopes] = useState<Horoscope[]>([]);

  // Состояния для гаданий
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
  const [isReadingActive, setIsReadingActive] = useState(false);

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('fortune-teller-profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile({
        ...profile,
        birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined
      });
    }

    const savedReadings = localStorage.getItem('fortune-teller-readings');
    if (savedReadings) {
      setReadings(JSON.parse(savedReadings).map((r: any) => ({
        ...r,
        date: new Date(r.date)
      })));
    }

    const savedFortunes = localStorage.getItem('fortune-teller-fortunes');
    if (savedFortunes) {
      setFortunes(JSON.parse(savedFortunes).map((f: any) => ({
        ...f,
        date: new Date(f.date)
      })));
    }

    const savedHoroscopes = localStorage.getItem('fortune-teller-horoscopes');
    if (savedHoroscopes) {
      setHoroscopes(JSON.parse(savedHoroscopes).map((h: any) => ({
        ...h,
        date: new Date(h.date)
      })));
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem('fortune-teller-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('fortune-teller-readings', JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem('fortune-teller-fortunes', JSON.stringify(fortunes));
  }, [fortunes]);

  useEffect(() => {
    localStorage.setItem('fortune-teller-horoscopes', JSON.stringify(horoscopes));
  }, [horoscopes]);

  // Тасование карт
  const shuffleCards = useCallback(() => {
    return [...tarotCards].sort(() => Math.random() - 0.5);
  }, []);

  // Генерация предсказания на основе карт
  const generateTarotInterpretation = useCallback((cards: {card: TarotCard, position: string, reversed: boolean}[]): string => {
    const interpretations = cards.map(({ card, position, reversed }) => {
      const meaning = reversed ? card.meaning.reversed : card.meaning.upright;
      return `${position}: ${card.nameRu} ${reversed ? '(перевернутая)' : ''} - ${meaning}`;
    });

    const overallMood = cards.some(c => c.card.keywords.includes('смерть') || c.card.keywords.includes('конец')) 
      ? 'challenging' 
      : cards.some(c => c.card.keywords.includes('успех') || c.card.keywords.includes('радость'))
      ? 'positive'
      : 'neutral';

    let summary = "";
    if (overallMood === 'positive') {
      summary = "\n\nОбщий вывод: Звезды благоволят вам! Это благоприятное время для новых начинаний и важных решений.";
    } else if (overallMood === 'challenging') {
      summary = "\n\nОбщий вывод: Сейчас время для размышлений и внутренней работы. Препятствия временны и ведут к росту.";
    } else {
      summary = "\n\nОбщий вывод: Баланс света и тени. Доверьтесь своей интуиции и будьте открыты к переменам.";
    }

    return interpretations.join('\n\n') + summary;
  }, []);

  // Проведение гадания на картах Таро
  const performTarotReading = useCallback((type: TarotReading['type'], question: string) => {
    const shuffled = shuffleCards();
    let cardCount = 1;
    let positions = ['Ответ'];

    if (type === 'three-card') {
      cardCount = 3;
      positions = ['Прошлое', 'Настоящее', 'Будущее'];
    } else if (type === 'celtic-cross') {
      cardCount = 5; // Упрощенный кельтский крест
      positions = ['Суть вопроса', 'Препятствие', 'Прошлое', 'Будущее', 'Совет'];
    }

    const readingCards = shuffled.slice(0, cardCount).map((card, index) => ({
      card,
      position: positions[index],
      reversed: Math.random() < 0.3 // 30% шанс перевернутой карты
    }));

    const interpretation = generateTarotInterpretation(readingCards);
    const mood: TarotReading['mood'] = readingCards.some(c => 
      c.card.keywords.includes('радость') || c.card.keywords.includes('успех')
    ) ? 'positive' : readingCards.some(c => 
      c.card.keywords.includes('смерть') || c.reversed
    ) ? 'challenging' : 'neutral';

    const newReading: TarotReading = {
      id: `reading-${Date.now()}`,
      type,
      question,
      cards: readingCards,
      interpretation,
      date: new Date(),
      mood
    };

    setReadings(prev => [newReading, ...prev]);
    setCurrentReading(newReading);
    
    // Обновление профиля
    setUserProfile(prev => ({
      ...prev,
      readingsCount: prev.readingsCount + 1,
      experience: prev.experience + (type === 'single' ? 10 : type === 'three-card' ? 25 : 50)
    }));

    setIsReadingActive(false);
    return newReading;
  }, [shuffleCards, generateTarotInterpretation]);

  // Генерация гороскопа
  const generateHoroscope = useCallback((signId: string, period: Horoscope['period']) => {
    const sign = zodiacSigns.find(s => s.id === signId);
    if (!sign) return null;

    const predictions = [
      `Энергия ${sign.planet} усиливает ваши природные качества. ${sign.traits.join(', ')} проявятся особенно ярко.`,
      `Элемент ${sign.element === 'fire' ? 'огня' : sign.element === 'water' ? 'воды' : sign.element === 'air' ? 'воздуха' : 'земли'} дает вам силы для новых свершений.`,
      `Совместимость с знаками ${sign.compatibility.join(', ')} сейчас особенно высока.`,
      "Доверьтесь своей интуиции - она не подведет вас в важных решениях."
    ];

    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    const moods: Horoscope['mood'][] = ['excellent', 'good', 'neutral', 'challenging'];
    const colors = ['золотой', 'серебряный', 'изумрудный', 'рубиновый', 'сапфировый', 'аметистовый'];
    
    const newHoroscope: Horoscope = {
      sign: sign.nameRu,
      period,
      prediction: randomPrediction,
      luckNumber: Math.floor(Math.random() * 99) + 1,
      luckColor: colors[Math.floor(Math.random() * colors.length)],
      advice: "Будьте открыты к новым возможностям и доверяйте своему внутреннему голосу.",
      mood: moods[Math.floor(Math.random() * moods.length)],
      date: new Date()
    };

    setHoroscopes(prev => [newHoroscope, ...prev.filter(h => !(h.sign === sign.nameRu && h.period === period))]);
    return newHoroscope;
  }, []);

  // Гадание на рунах
  const performRuneReading = useCallback(() => {
    const randomRune = runeStones[Math.floor(Math.random() * runeStones.length)];
    const advice = [
      "Эта руна указывает путь к решению ваших вопросов.",
      "Примите энергию этой руны в свою жизнь.",
      "Руна советует обратить внимание на важные детали.",
      "Древняя мудрость поможет вам принять правильное решение."
    ];

    const newFortune: Fortune = {
      id: `fortune-${Date.now()}`,
      type: 'rune',
      result: `${randomRune.symbol} ${randomRune.nameRu}: ${randomRune.meaning}`,
      advice: advice[Math.floor(Math.random() * advice.length)],
      date: new Date()
    };

    setFortunes(prev => [newFortune, ...prev]);
    setUserProfile(prev => ({
      ...prev,
      fortunesCount: prev.fortunesCount + 1,
      experience: prev.experience + 15
    }));

    return newFortune;
  }, []);

  // Гадание на магическом шаре
  const performCrystalBallReading = useCallback((question: string, category: 'love' | 'career' | 'health' | 'general') => {
    const predictions = fortunePredictions[category];
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    
    const advice = [
      "Вселенная шепчет вам ответ - слушайте сердцем.",
      "Энергии вокруг вас выравниваются для положительных изменений.",
      "Ваши ангелы-хранители направляют вас к правильному пути.",
      "Магия момента откроет перед вами новые возможности."
    ];

    const newFortune: Fortune = {
      id: `fortune-${Date.now()}`,
      type: 'crystal-ball',
      question,
      result: randomPrediction,
      advice: advice[Math.floor(Math.random() * advice.length)],
      date: new Date()
    };

    setFortunes(prev => [newFortune, ...prev]);
    setUserProfile(prev => ({
      ...prev,
      fortunesCount: prev.fortunesCount + 1,
      experience: prev.experience + 20
    }));

    return newFortune;
  }, []);

  // Компонент главной страницы
  const HomePage = () => (
    <div className="space-y-8">
      {/* Приветствие */}
      <div className="text-center bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-8 text-white">
        <div className="text-6xl mb-4">🔮</div>
        <h2 className="text-3xl font-bold mb-4">Добро пожаловать в мир магии</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Откройте тайны судьбы с помощью древних искусств гадания. 
          Карты Таро, астрология, руны и магический шар раскроют вам секреты будущего.
        </p>
      </div>

      {/* Статистика пользователя */}
      {userProfile.readingsCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userProfile.readingsCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Гаданий</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{userProfile.fortunesCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Предсказаний</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-violet-600">{userProfile.level}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Уровень</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{userProfile.experience}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Опыт</div>
          </div>
        </div>
      )}

      {/* Способы гадания */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => setCurrentView('tarot')}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer group hover:scale-105"
        >
          <div className="text-center">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Карты Таро
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Древние карты раскроют тайны вашего прошлого, настоящего и будущего
            </p>
          </div>
        </div>

        <div
          onClick={() => setCurrentView('astrology')}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer group hover:scale-105"
        >
          <div className="text-center">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⭐</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Астрология
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Звезды и планеты расскажут о вашем характере и судьбе
            </p>
          </div>
        </div>

        <div
          onClick={() => setCurrentView('runes')}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer group hover:scale-105"
        >
          <div className="text-center">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">ᚱ</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Руны
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Древние скандинавские символы дадут мудрые советы
            </p>
          </div>
        </div>

        <div
          onClick={() => setCurrentView('crystal-ball')}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer group hover:scale-105"
        >
          <div className="text-center">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔮</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Магический шар
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Кристальный шар предскажет ваше будущее
            </p>
          </div>
        </div>
      </div>

      {/* Последние гадания */}
      {readings.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Последние гадания
          </h3>
          <div className="space-y-3">
            {readings.slice(0, 3).map(reading => (
              <div key={reading.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {reading.question}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {reading.date.toLocaleDateString()} • {reading.type === 'single' ? 'Одна карта' : reading.type === 'three-card' ? 'Три карты' : 'Кельтский крест'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  reading.mood === 'positive' ? 'bg-green-100 text-green-800' :
                  reading.mood === 'challenging' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {reading.mood === 'positive' ? '✨ Позитивно' :
                   reading.mood === 'challenging' ? '⚠️ Вызов' : '🌙 Нейтрально'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Компонент гадания на картах Таро
  const TarotPage = () => {
    const [readingType, setReadingType] = useState<TarotReading['type']>('single');
    const [question, setQuestion] = useState('');
    const [showResult, setShowResult] = useState(false);

    const handleStartReading = () => {
      if (!question.trim()) return;
      
      setIsReadingActive(true);
      setTimeout(() => {
        const reading = performTarotReading(readingType, question);
        setCurrentReading(reading);
        setShowResult(true);
        setQuestion('');
      }, 2000); // Имитация тасования карт
    };

    const resetReading = () => {
      setShowResult(false);
      setCurrentReading(null);
      setIsReadingActive(false);
    };

    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-purple-800 to-pink-800 rounded-lg p-6 text-white">
          <div className="text-5xl mb-3">🃏</div>
          <h2 className="text-2xl font-bold mb-2">Гадание на картах Таро</h2>
          <p className="opacity-90">Задайте вопрос картам и получите мудрый ответ</p>
        </div>

        {!showResult ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Тип расклада
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setReadingType('single')}
                    className={`p-4 border rounded-lg text-center ${
                      readingType === 'single'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">🃏</div>
                    <div className="font-medium">Одна карта</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Быстрый ответ</div>
                  </button>
                  <button
                    onClick={() => setReadingType('three-card')}
                    className={`p-4 border rounded-lg text-center ${
                      readingType === 'three-card'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">🃏🃏🃏</div>
                    <div className="font-medium">Три карты</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Прошлое-Настоящее-Будущее</div>
                  </button>
                  <button
                    onClick={() => setReadingType('celtic-cross')}
                    className={`p-4 border rounded-lg text-center ${
                      readingType === 'celtic-cross'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">✚</div>
                    <div className="font-medium">Кельтский крест</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Полный анализ</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ваш вопрос
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Сформулируйте ваш вопрос четко и ясно..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white resize-none"
                />
              </div>

              {isReadingActive ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4 animate-bounce">🔮</div>
                  <p className="text-lg text-slate-600 dark:text-slate-400">Карты перемешиваются...</p>
                  <p className="text-sm text-slate-500 mt-2">Сосредоточьтесь на своем вопросе</p>
                </div>
              ) : (
                <button
                  onClick={handleStartReading}
                  disabled={!question.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Начать гадание
                </button>
              )}
            </div>
          </div>
        ) : currentReading && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Результат гадания
              </h3>
              <div className="mb-4">
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  <strong>Вопрос:</strong> {currentReading.question}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Тип расклада:</strong> {
                    currentReading.type === 'single' ? 'Одна карта' :
                    currentReading.type === 'three-card' ? 'Три карты' :
                    'Кельтский крест'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {currentReading.cards.map((cardData, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-6xl mb-2 ${cardData.reversed ? 'transform rotate-180' : ''}`}>
                      {cardData.card.image}
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {cardData.card.nameRu}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {cardData.position}
                    </p>
                    {cardData.reversed && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                        Перевернутая
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Толкование:
                </h4>
                <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {currentReading.interpretation}
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={resetReading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Новое гадание
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  На главную
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Компонент астрологии
  const AstrologyPage = () => {
    const [selectedSign, setSelectedSign] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<Horoscope['period']>('daily');
    const [currentHoroscope, setCurrentHoroscope] = useState<Horoscope | null>(null);

    const handleGenerateHoroscope = () => {
      if (!selectedSign) return;
      const horoscope = generateHoroscope(selectedSign, selectedPeriod);
      setCurrentHoroscope(horoscope);
    };

    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg p-6 text-white">
          <div className="text-5xl mb-3">⭐</div>
          <h2 className="text-2xl font-bold mb-2">Астрология и гороскопы</h2>
          <p className="opacity-90">Узнайте, что говорят звезды о вашем будущем</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Выберите ваш знак зодиака
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {zodiacSigns.map(sign => (
                  <button
                    key={sign.id}
                    onClick={() => setSelectedSign(sign.id)}
                    className={`p-3 border rounded-lg text-center ${
                      selectedSign === sign.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{sign.symbol}</div>
                    <div className="font-medium text-sm">{sign.nameRu}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{sign.dates}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Период
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedPeriod('daily')}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPeriod === 'daily'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  На сегодня
                </button>
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPeriod === 'weekly'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  На неделю
                </button>
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg ${
                    selectedPeriod === 'monthly'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  На месяц
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateHoroscope}
              disabled={!selectedSign}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Получить гороскоп
            </button>
          </div>
        </div>

        {currentHoroscope && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Гороскоп для {currentHoroscope.sign}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Предсказание:
                </h4>
                <p className="text-slate-700 dark:text-slate-300">
                  {currentHoroscope.prediction}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-2xl mb-1">🍀</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Счастливое число</div>
                  <div className="font-bold text-amber-700 dark:text-amber-300">{currentHoroscope.luckNumber}</div>
                </div>
                <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="text-2xl mb-1">🎨</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Цвет удачи</div>
                  <div className="font-bold text-pink-700 dark:text-pink-300">{currentHoroscope.luckColor}</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl mb-1">
                    {currentHoroscope.mood === 'excellent' ? '🌟' : 
                     currentHoroscope.mood === 'good' ? '😊' : 
                     currentHoroscope.mood === 'neutral' ? '😐' : '⚠️'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Настроение</div>
                  <div className="font-bold text-blue-700 dark:text-blue-300">
                    {currentHoroscope.mood === 'excellent' ? 'Отлично' : 
                     currentHoroscope.mood === 'good' ? 'Хорошо' : 
                     currentHoroscope.mood === 'neutral' ? 'Нейтрально' : 'Осторожно'}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Совет дня:
                </h4>
                <p className="text-green-700 dark:text-green-300">
                  {currentHoroscope.advice}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Компонент гадания на рунах
  const RunesPage = () => {
    const [currentRune, setCurrentRune] = useState<Fortune | null>(null);
    const [isReading, setIsReading] = useState(false);

    const handleRuneReading = () => {
      setIsReading(true);
      setTimeout(() => {
        const fortune = performRuneReading();
        setCurrentRune(fortune);
        setIsReading(false);
      }, 1500);
    };

    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-slate-800 to-blue-800 rounded-lg p-6 text-white">
          <div className="text-5xl mb-3">ᚱ</div>
          <h2 className="text-2xl font-bold mb-2">Гадание на рунах</h2>
          <p className="opacity-90">Древняя мудрость викингов даст вам совет</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          {!currentRune && !isReading ? (
            <div className="text-center space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {runeStones.map(rune => (
                  <div key={rune.id} className="text-center p-3 border border-slate-300 dark:border-slate-600 rounded-lg">
                    <div className="text-3xl mb-2">{rune.symbol}</div>
                    <div className="text-sm font-medium">{rune.nameRu}</div>
                  </div>
                ))}
              </div>
              
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Сосредоточьтесь на своем вопросе и позвольте рунам выбрать вас
                </p>
                <button
                  onClick={handleRuneReading}
                  className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white py-3 px-8 rounded-lg font-medium"
                >
                  Вытянуть руну
                </button>
              </div>
            </div>
          ) : isReading ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 animate-pulse">ᚱ</div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Руны выбирают...</p>
            </div>
          ) : currentRune && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {runeStones.find(r => currentRune.result.includes(r.nameRu))?.symbol || 'ᚱ'}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Ваша руна
                </h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Значение:
                </h4>
                <p className="text-slate-700 dark:text-slate-300">
                  {currentRune.result}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Совет:
                </h4>
                <p className="text-blue-700 dark:text-blue-300">
                  {currentRune.advice}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setCurrentRune(null);
                    setIsReading(false);
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Новое гадание
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  На главную
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Компонент магического шара
  const CrystalBallPage = () => {
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState<'love' | 'career' | 'health' | 'general'>('general');
    const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
    const [isReading, setIsReading] = useState(false);

    const handleCrystalBallReading = () => {
      if (!question.trim()) return;
      
      setIsReading(true);
      setTimeout(() => {
        const fortune = performCrystalBallReading(question, category);
        setCurrentFortune(fortune);
        setIsReading(false);
        setQuestion('');
      }, 2500);
    };

    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-purple-800 to-pink-800 rounded-lg p-6 text-white">
          <div className="text-5xl mb-3">🔮</div>
          <h2 className="text-2xl font-bold mb-2">Магический шар</h2>
          <p className="opacity-90">Кристальный шар раскроет тайны вашего будущего</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          {!currentFortune && !isReading ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Категория вопроса
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setCategory('love')}
                    className={`p-3 border rounded-lg text-center ${
                      category === 'love'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">💕</div>
                    <div className="font-medium text-sm">Любовь</div>
                  </button>
                  <button
                    onClick={() => setCategory('career')}
                    className={`p-3 border rounded-lg text-center ${
                      category === 'career'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">💼</div>
                    <div className="font-medium text-sm">Карьера</div>
                  </button>
                  <button
                    onClick={() => setCategory('health')}
                    className={`p-3 border rounded-lg text-center ${
                      category === 'health'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌱</div>
                    <div className="font-medium text-sm">Здоровье</div>
                  </button>
                  <button
                    onClick={() => setCategory('general')}
                    className={`p-3 border rounded-lg text-center ${
                      category === 'general'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">✨</div>
                    <div className="font-medium text-sm">Общее</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ваш вопрос
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="О чем вы хотите узнать у магического шара?"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white resize-none"
                />
              </div>

              <button
                onClick={handleCrystalBallReading}
                disabled={!question.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Заглянуть в будущее
              </button>
            </div>
          ) : isReading ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-pulse">🔮</div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Шар туманится...</p>
              <p className="text-sm text-slate-500 mt-2">Образы становятся яснее...</p>
            </div>
          ) : currentFortune && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🔮</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Видение магического шара
                </h3>
                {currentFortune.question && (
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    <strong>Ваш вопрос:</strong> {currentFortune.question}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                  Предсказание:
                </h4>
                <p className="text-purple-700 dark:text-purple-300 text-lg">
                  {currentFortune.result}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Мудрый совет:
                </h4>
                <p className="text-blue-700 dark:text-blue-300">
                  {currentFortune.advice}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setCurrentFortune(null);
                    setIsReading(false);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Новое предсказание
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  На главную
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Компонент профиля
  const ProfilePage = () => {
    const [birthDate, setBirthDate] = useState(
      userProfile.birthDate ? userProfile.birthDate.toISOString().split('T')[0] : ''
    );

    const handleSaveBirthDate = () => {
      if (birthDate) {
        const date = new Date(birthDate);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        let zodiacSign = '';
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiacSign = 'aries';
        else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiacSign = 'taurus';
        else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiacSign = 'gemini';
        else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiacSign = 'cancer';
        else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacSign = 'leo';
        else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiacSign = 'virgo';
        
        setUserProfile(prev => ({
          ...prev,
          birthDate: date,
          zodiacSign
        }));
      }
    };

    const userLevel = Math.floor(userProfile.experience / 100) + 1;
    const experienceToNextLevel = (userLevel * 100) - userProfile.experience;

    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg p-6 text-white">
          <div className="text-5xl mb-3">👤</div>
          <h2 className="text-2xl font-bold mb-2">Мистический профиль</h2>
          <p className="opacity-90">Ваш путь в мире магии и предсказаний</p>
        </div>

        {/* Уровень и опыт */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Уровень мистика
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-purple-600">Уровень {userLevel}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {experienceToNextLevel} опыта до следующего уровня
              </div>
            </div>
            <div className="text-4xl">
              {userLevel >= 10 ? '🔮' : userLevel >= 5 ? '⭐' : '🌟'}
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(userProfile.experience % 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Статистика гаданий
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Гаданий Таро:</span>
                <span className="font-medium">{userProfile.readingsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Предсказаний:</span>
                <span className="font-medium">{userProfile.fortunesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Общий опыт:</span>
                <span className="font-medium">{userProfile.experience}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Астрологический профиль
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Дата рождения
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    onClick={handleSaveBirthDate}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    💾
                  </button>
                </div>
              </div>
              {userProfile.zodiacSign && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Знак зодиака:</span>
                  <span className="font-medium">
                    {zodiacSigns.find(s => s.id === userProfile.zodiacSign)?.nameRu}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* История гаданий */}
        {readings.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              История гаданий
            </h3>
            <div className="space-y-3">
              {readings.slice(0, 5).map(reading => (
                <div key={reading.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {reading.question}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {reading.date.toLocaleDateString()} • {reading.type === 'single' ? 'Одна карта' : reading.type === 'three-card' ? 'Три карты' : 'Кельтский крест'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    reading.mood === 'positive' ? 'bg-green-100 text-green-800' :
                    reading.mood === 'challenging' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {reading.mood === 'positive' ? '✨' :
                     reading.mood === 'challenging' ? '⚠️' : '🌙'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🔮 Fortune Teller AI
            </h1>
            <p className="text-lg text-purple-200">
              Путешествие в мир мистики и предсказаний
            </p>
          </div>
          
          <Link 
            href="/"
            className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
          >
            ← На главную
          </Link>
        </div>

        {/* Навигация */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-8 border border-white/20">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              🏠 Главная
            </button>
            <button
              onClick={() => setCurrentView('tarot')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'tarot'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              🃏 Таро
            </button>
            <button
              onClick={() => setCurrentView('astrology')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'astrology'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              ⭐ Астрология
            </button>
            <button
              onClick={() => setCurrentView('runes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'runes'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              ᚱ Руны
            </button>
            <button
              onClick={() => setCurrentView('crystal-ball')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'crystal-ball'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              🔮 Магический шар
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'profile'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              👤 Профиль
            </button>
          </div>
        </div>

        {/* Основной контент */}
        {currentView === 'home' && <HomePage />}
        {currentView === 'tarot' && <TarotPage />}
        {currentView === 'astrology' && <AstrologyPage />}
        {currentView === 'runes' && <RunesPage />}
        {currentView === 'crystal-ball' && <CrystalBallPage />}
        {currentView === 'profile' && <ProfilePage />}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-purple-300 text-sm">
            ✨ Для развлечения и вдохновения • Создано с мистической любовью ✨
          </p>
        </footer>
      </div>
    </div>
  );
}
