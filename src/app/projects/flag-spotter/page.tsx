"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

// Типы данных для FlagSpotter
interface Person {
  id: string;
  name: string;
  age: number;
  location: string;
  bio?: string;
  photos: string[];
  school?: string;
  occupation?: string;
  addedBy: string;
  addedAt: Date;
  verified: boolean;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    snapchat?: string;
  };
}

interface Flag {
  id: string;
  personId: string;
  type: 'red' | 'green';
  category: string;
  description: string;
  submittedBy: string;
  submittedAt: Date;
  votes: number;
  verified: boolean;
  tags: string[];
}

interface Comment {
  id: string;
  personId: string;
  content: string;
  rating: 1 | 2 | 3 | 4 | 5;
  category: 'dating' | 'friendship' | 'work' | 'general';
  submittedBy: string;
  submittedAt: Date;
  likes: number;
  anonymous: boolean;
  verified: boolean;
}

interface Vote {
  id: string;
  flagId: string;
  userId: string;
  type: 'upvote' | 'downvote';
  submittedAt: Date;
}

// Предопределенные категории флагов
const flagCategories = {
  red: [
    "Неуважение к границам",
    "Агрессивное поведение",
    "Ложь и обман",
    "Финансовые проблемы",
    "Зависимости",
    "Измены",
    "Контролирующее поведение",
    "Эмоциональное насилие",
    "Безответственность",
    "Эгоизм"
  ],
  green: [
    "Уважение к границам",
    "Доброта и эмпатия",
    "Честность",
    "Финансовая ответственность",
    "Здоровый образ жизни",
    "Верность",
    "Поддерживающий",
    "Эмоциональная зрелость",
    "Ответственность",
    "Щедрость"
  ]
};

// Данные для демонстрации
const samplePeople: Person[] = [
  {
    id: "person-1",
    name: "Алекс К.",
    age: 24,
    location: "Москва",
    bio: "Студент МГУ, увлекается фотографией",
    photos: ["📸"],
    school: "МГУ",
    occupation: "Студент",
    addedBy: "anonymous",
    addedAt: new Date('2024-01-10'),
    verified: false,
    socialMedia: {
      instagram: "@alex_k_photo"
    }
  },
  {
    id: "person-2",
    name: "Мария С.",
    age: 22,
    location: "СПб",
    bio: "Работаю в IT, люблю путешествия",
    photos: ["💻"],
    occupation: "Frontend разработчик",
    addedBy: "anonymous",
    addedAt: new Date('2024-01-08'),
    verified: true,
    socialMedia: {
      instagram: "@maria_travels",
      tiktok: "@maria_dev"
    }
  },
  {
    id: "person-3",
    name: "Дмитрий В.",
    age: 26,
    location: "Екатеринбург",
    bio: "Фитнес тренер, занимаюсь спортом",
    photos: ["💪"],
    occupation: "Фитнес тренер",
    addedBy: "anonymous",
    addedAt: new Date('2024-01-05'),
    verified: false
  }
];

const sampleFlags: Flag[] = [
  {
    id: "flag-1",
    personId: "person-1",
    type: "green",
    category: "Уважение к границам",
    description: "Всегда спрашивает согласие перед тем как что-то сделать",
    submittedBy: "anonymous-1",
    submittedAt: new Date('2024-01-12'),
    votes: 12,
    verified: true,
    tags: ["уважение", "согласие"]
  },
  {
    id: "flag-2",
    personId: "person-1",
    type: "red",
    category: "Безответственность",
    description: "Часто опаздывает на встречи и не предупреждает",
    submittedBy: "anonymous-2",
    submittedAt: new Date('2024-01-11'),
    votes: 8,
    verified: false,
    tags: ["опоздания", "безответственность"]
  },
  {
    id: "flag-3",
    personId: "person-2",
    type: "green",
    category: "Доброта и эмпатия",
    description: "Очень отзывчивая, всегда готова помочь",
    submittedBy: "anonymous-3",
    submittedAt: new Date('2024-01-09'),
    votes: 15,
    verified: true,
    tags: ["доброта", "помощь", "эмпатия"]
  },
  {
    id: "flag-4",
    personId: "person-3",
    type: "green",
    category: "Здоровый образ жизни",
    description: "Мотивирует заниматься спортом, сам хороший пример",
    submittedBy: "anonymous-4",
    submittedAt: new Date('2024-01-06'),
    votes: 7,
    verified: true,
    tags: ["спорт", "мотивация", "здоровье"]
  }
];

const sampleComments: Comment[] = [
  {
    id: "comment-1",
    personId: "person-1",
    content: "Общался несколько месяцев. В целом хороший человек, но иногда может быть невнимательным к деталям.",
    rating: 4,
    category: "dating",
    submittedBy: "anonymous-1",
    submittedAt: new Date('2024-01-12'),
    likes: 5,
    anonymous: true,
    verified: false
  },
  {
    id: "comment-2",
    personId: "person-2",
    content: "Работали вместе над проектом. Очень профессиональная и надежная. Рекомендую!",
    rating: 5,
    category: "work",
    submittedBy: "anonymous-3",
    submittedAt: new Date('2024-01-09'),
    likes: 12,
    anonymous: true,
    verified: true
  },
  {
    id: "comment-3",
    personId: "person-3",
    content: "Отличный тренер! Помог достичь своих целей в фитнесе. Терпеливый и мотивирующий.",
    rating: 5,
    category: "work",
    submittedBy: "anonymous-4",
    submittedAt: new Date('2024-01-07'),
    likes: 8,
    anonymous: true,
    verified: true
  }
];

// Основной компонент FlagSpotter
export default function FlagSpotter() {
  const [currentView, setCurrentView] = useState<'feed' | 'search' | 'add-person' | 'profile' | 'guidelines'>('feed');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [people, setPeople] = useState<Person[]>(samplePeople);
  const [flags, setFlags] = useState<Flag[]>(sampleFlags);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'most_flags' | 'verified'>('recent');

  // Состояние для модальных окон
  const [showAddFlag, setShowAddFlag] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [flagType, setFlagType] = useState<'red' | 'green'>('red');

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedPeople = localStorage.getItem('flagspotter-people');
    if (savedPeople) {
      setPeople(JSON.parse(savedPeople).map((p: any) => ({
        ...p,
        addedAt: new Date(p.addedAt)
      })));
    }

    const savedFlags = localStorage.getItem('flagspotter-flags');
    if (savedFlags) {
      setFlags(JSON.parse(savedFlags).map((f: any) => ({
        ...f,
        submittedAt: new Date(f.submittedAt)
      })));
    }

    const savedComments = localStorage.getItem('flagspotter-comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments).map((c: any) => ({
        ...c,
        submittedAt: new Date(c.submittedAt)
      })));
    }

    const savedVotes = localStorage.getItem('flagspotter-votes');
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes).map((v: any) => ({
        ...v,
        submittedAt: new Date(v.submittedAt)
      })));
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem('flagspotter-people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('flagspotter-flags', JSON.stringify(flags));
  }, [flags]);

  useEffect(() => {
    localStorage.setItem('flagspotter-comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('flagspotter-votes', JSON.stringify(votes));
  }, [votes]);

  // Фильтрация и сортировка людей
  const filteredPeople = useMemo(() => {
    let filtered = people.filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (person.bio && person.bio.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLocation = filterLocation === 'all' || person.location === filterLocation;
      
      const matchesAge = filterAge === 'all' || 
                        (filterAge === '18-22' && person.age >= 18 && person.age <= 22) ||
                        (filterAge === '23-27' && person.age >= 23 && person.age <= 27) ||
                        (filterAge === '28-35' && person.age >= 28 && person.age <= 35) ||
                        (filterAge === '35+' && person.age > 35);

      return matchesSearch && matchesLocation && matchesAge;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.addedAt.getTime() - a.addedAt.getTime();
        case 'most_flags':
          const aFlags = flags.filter(f => f.personId === a.id).length;
          const bFlags = flags.filter(f => f.personId === b.id).length;
          return bFlags - aFlags;
        case 'verified':
          if (a.verified && !b.verified) return -1;
          if (!a.verified && b.verified) return 1;
          return 0;
        default:
          return 0;
      }
    });
  }, [people, flags, searchQuery, filterLocation, filterAge, sortBy]);

  // Получение уникальных локаций
  const locations = useMemo(() => {
    const allLocations = people.map(p => p.location);
    return Array.from(new Set(allLocations));
  }, [people]);

  // Добавление нового человека
  const addPerson = useCallback((personData: Omit<Person, 'id' | 'addedBy' | 'addedAt' | 'verified'>) => {
    const newPerson: Person = {
      ...personData,
      id: `person-${Date.now()}`,
      addedBy: 'current-user',
      addedAt: new Date(),
      verified: false
    };

    setPeople(prev => [newPerson, ...prev]);
  }, []);

  // Добавление нового флага
  const addFlag = useCallback((personId: string, flagData: Omit<Flag, 'id' | 'personId' | 'submittedBy' | 'submittedAt' | 'votes' | 'verified'>) => {
    const newFlag: Flag = {
      ...flagData,
      id: `flag-${Date.now()}`,
      personId,
      submittedBy: 'current-user',
      submittedAt: new Date(),
      votes: 0,
      verified: false
    };

    setFlags(prev => [newFlag, ...prev]);
  }, []);

  // Добавление нового комментария
  const addComment = useCallback((personId: string, commentData: Omit<Comment, 'id' | 'personId' | 'submittedBy' | 'submittedAt' | 'likes' | 'verified'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      personId,
      submittedBy: 'current-user',
      submittedAt: new Date(),
      likes: 0,
      verified: false
    };

    setComments(prev => [newComment, ...prev]);
  }, []);

  // Голосование за флаг
  const voteOnFlag = useCallback((flagId: string, voteType: 'upvote' | 'downvote') => {
    const existingVote = votes.find(v => v.flagId === flagId && v.userId === 'current-user');
    
    if (existingVote) {
      // Удаляем существующий голос если он такой же, или меняем тип
      if (existingVote.type === voteType) {
        setVotes(prev => prev.filter(v => v.id !== existingVote.id));
        setFlags(prev => prev.map(f => 
          f.id === flagId 
            ? { ...f, votes: f.votes + (voteType === 'upvote' ? -1 : 1) }
            : f
        ));
      } else {
        setVotes(prev => prev.map(v => 
          v.id === existingVote.id ? { ...v, type: voteType } : v
        ));
        setFlags(prev => prev.map(f => 
          f.id === flagId 
            ? { ...f, votes: f.votes + (voteType === 'upvote' ? 2 : -2) }
            : f
        ));
      }
    } else {
      // Добавляем новый голос
      const newVote: Vote = {
        id: `vote-${Date.now()}`,
        flagId,
        userId: 'current-user',
        type: voteType,
        submittedAt: new Date()
      };

      setVotes(prev => [...prev, newVote]);
      setFlags(prev => prev.map(f => 
        f.id === flagId 
          ? { ...f, votes: f.votes + (voteType === 'upvote' ? 1 : -1) }
          : f
      ));
    }
  }, [votes]);

  // Получение флагов для конкретного человека
  const getPersonFlags = useCallback((personId: string) => {
    return flags.filter(f => f.personId === personId);
  }, [flags]);

  // Получение комментариев для конкретного человека
  const getPersonComments = useCallback((personId: string) => {
    return comments.filter(c => c.personId === personId);
  }, [comments]);

  // Компонент ленты (главная страница)
  const Feed = () => (
    <div className="space-y-6">
      {/* Поиск и фильтры */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Поиск по имени, городу, описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Все города</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="recent">Недавно добавленные</option>
            <option value="most_flags">Больше флагов</option>
            <option value="verified">Верифицированные</option>
          </select>
        </div>
      </div>

      {/* Список людей */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map(person => {
          const personFlags = getPersonFlags(person.id);
          const redFlags = personFlags.filter(f => f.type === 'red');
          const greenFlags = personFlags.filter(f => f.type === 'green');
          const personComments = getPersonComments(person.id);
          const avgRating = personComments.length > 0 
            ? personComments.reduce((sum, c) => sum + c.rating, 0) / personComments.length 
            : 0;

          return (
            <div
              key={person.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedPerson(person);
                setCurrentView('profile');
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{person.photos[0]}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {person.name}
                        </h3>
                        {person.verified && (
                          <span className="text-blue-500" title="Верифицированный профиль">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {person.age} лет • {person.location}
                      </p>
                    </div>
                  </div>
                  
                  {avgRating > 0 && (
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <span>⭐</span>
                        <span className="font-medium">{avgRating.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {personComments.length} отзыв{personComments.length === 1 ? '' : personComments.length < 5 ? 'а' : 'ов'}
                      </div>
                    </div>
                  )}
                </div>

                {person.bio && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {person.bio}
                  </p>
                )}

                {person.occupation && (
                  <p className="text-xs text-slate-500 mb-3">
                    💼 {person.occupation}
                  </p>
                )}

                {/* Флаги */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-600">🟢</span>
                      <span className="text-sm font-medium text-green-600">
                        {greenFlags.length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-red-600">🔴</span>
                      <span className="text-sm font-medium text-red-600">
                        {redFlags.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    Добавлен {person.addedAt.toLocaleDateString()}
                  </div>
                </div>

                {/* Последний флаг */}
                {personFlags.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={personFlags[0].type === 'red' ? 'text-red-600' : 'text-green-600'}>
                        {personFlags[0].type === 'red' ? '🔴' : '🟢'}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {personFlags[0].category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {personFlags[0].description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPeople.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Никого не найдено
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Попробуйте изменить параметры поиска или добавьте нового человека
          </p>
          <button
            onClick={() => setCurrentView('add-person')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Добавить человека
          </button>
        </div>
      )}
    </div>
  );

  // Компонент профиля человека
  const ProfileView = () => {
    if (!selectedPerson) return null;

    const personFlags = getPersonFlags(selectedPerson.id);
    const personComments = getPersonComments(selectedPerson.id);
    const redFlags = personFlags.filter(f => f.type === 'red');
    const greenFlags = personFlags.filter(f => f.type === 'green');
    
    const avgRating = personComments.length > 0 
      ? personComments.reduce((sum, c) => sum + c.rating, 0) / personComments.length 
      : 0;

    const [newFlag, setNewFlag] = useState({
      type: 'red' as 'red' | 'green',
      category: '',
      description: '',
      tags: [] as string[]
    });

    const [newComment, setNewComment] = useState({
      content: '',
      rating: 5 as 1 | 2 | 3 | 4 | 5,
      category: 'general' as 'dating' | 'friendship' | 'work' | 'general',
      anonymous: true
    });

    const handleAddFlag = (e: React.FormEvent) => {
      e.preventDefault();
      if (newFlag.category && newFlag.description) {
        addFlag(selectedPerson.id, newFlag);
        setNewFlag({
          type: 'red',
          category: '',
          description: '',
          tags: []
        });
        setShowAddFlag(false);
      }
    };

    const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.content) {
        addComment(selectedPerson.id, newComment);
        setNewComment({
          content: '',
          rating: 5,
          category: 'general',
          anonymous: true
        });
        setShowAddComment(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Кнопка назад */}
        <button
          onClick={() => setCurrentView('feed')}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <span>←</span>
          <span>Назад к ленте</span>
        </button>

        {/* Информация о человеке */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{selectedPerson.photos[0]}</div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedPerson.name}
                  </h1>
                  {selectedPerson.verified && (
                    <span className="text-blue-500 text-xl" title="Верифицированный профиль">✓</span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  {selectedPerson.age} лет • {selectedPerson.location}
                </p>
                {selectedPerson.occupation && (
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    💼 {selectedPerson.occupation}
                  </p>
                )}
                {selectedPerson.school && (
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    🎓 {selectedPerson.school}
                  </p>
                )}
                {avgRating > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <span>⭐</span>
                      <span className="font-medium">{avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      ({personComments.length} отзыв{personComments.length === 1 ? '' : personComments.length < 5 ? 'а' : 'ов'})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-4 mb-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{greenFlags.length}</div>
                  <div className="text-xs text-slate-500">🟢 Зеленые флаги</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{redFlags.length}</div>
                  <div className="text-xs text-slate-500">🔴 Красные флаги</div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Добавлен {selectedPerson.addedAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          {selectedPerson.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                О себе
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedPerson.bio}
              </p>
            </div>
          )}

          {selectedPerson.socialMedia && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Социальные сети
              </h3>
              <div className="flex space-x-4">
                {selectedPerson.socialMedia.instagram && (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    📷 {selectedPerson.socialMedia.instagram}
                  </span>
                )}
                {selectedPerson.socialMedia.tiktok && (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    🎵 {selectedPerson.socialMedia.tiktok}
                  </span>
                )}
                {selectedPerson.socialMedia.snapchat && (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    👻 {selectedPerson.socialMedia.snapchat}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddFlag(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              🏴 Добавить флаг
            </button>
            <button
              onClick={() => setShowAddComment(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              💬 Оставить отзыв
            </button>
          </div>
        </div>

        {/* Флаги */}
        {personFlags.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Флаги
            </h2>
            
            <div className="space-y-4">
              {personFlags.map(flag => (
                <div
                  key={flag.id}
                  className={`p-4 rounded-lg border ${
                    flag.type === 'red' 
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={flag.type === 'red' ? 'text-red-600' : 'text-green-600'}>
                        {flag.type === 'red' ? '🔴' : '🟢'}
                      </span>
                      <span className={`font-medium ${
                        flag.type === 'red' 
                          ? 'text-red-800 dark:text-red-200' 
                          : 'text-green-800 dark:text-green-200'
                      }`}>
                        {flag.category}
                      </span>
                      {flag.verified && (
                        <span className="text-blue-500" title="Верифицированный флаг">✓</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => voteOnFlag(flag.id, 'upvote')}
                        className="text-slate-500 hover:text-green-600"
                      >
                        👍
                      </button>
                      <span className="text-sm font-medium">{flag.votes}</span>
                      <button
                        onClick={() => voteOnFlag(flag.id, 'downvote')}
                        className="text-slate-500 hover:text-red-600"
                      >
                        👎
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    {flag.description}
                  </p>
                  
                  {flag.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {flag.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-slate-500">
                    {flag.submittedAt.toLocaleDateString()} • Анонимно
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Комментарии */}
        {personComments.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Отзывы
            </h2>
            
            <div className="space-y-4">
              {personComments.map(comment => (
                <div
                  key={comment.id}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < comment.rating ? 'text-yellow-400' : 'text-slate-300'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                        {comment.category}
                      </span>
                      {comment.verified && (
                        <span className="text-blue-500" title="Верифицированный отзыв">✓</span>
                      )}
                    </div>
                    
                    <button className="text-slate-500 hover:text-red-500">
                      ❤️ {comment.likes}
                    </button>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    {comment.content}
                  </p>
                  
                  <p className="text-xs text-slate-500">
                    {comment.submittedAt.toLocaleDateString()} • {comment.anonymous ? 'Анонимно' : 'Открыто'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Модальные окна для добавления флага */}
        {showAddFlag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Добавить флаг для {selectedPerson.name}
                </h3>
                
                <form onSubmit={handleAddFlag} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Тип флага
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="red"
                          checked={newFlag.type === 'red'}
                          onChange={(e) => setNewFlag({...newFlag, type: e.target.value as 'red' | 'green'})}
                          className="mr-2"
                        />
                        <span className="text-red-600">🔴 Красный флаг</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="green"
                          checked={newFlag.type === 'green'}
                          onChange={(e) => setNewFlag({...newFlag, type: e.target.value as 'red' | 'green'})}
                          className="mr-2"
                        />
                        <span className="text-green-600">🟢 Зеленый флаг</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Категория
                    </label>
                    <select
                      value={newFlag.category}
                      onChange={(e) => setNewFlag({...newFlag, category: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="">Выберите категорию</option>
                      {flagCategories[newFlag.type].map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={newFlag.description}
                      onChange={(e) => setNewFlag({...newFlag, description: e.target.value})}
                      required
                      rows={3}
                      placeholder="Опишите ситуацию подробнее..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Добавить флаг
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddFlag(false)}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно для добавления комментария */}
        {showAddComment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Оставить отзыв о {selectedPerson.name}
                </h3>
                
                <form onSubmit={handleAddComment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Оценка
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNewComment({...newComment, rating: rating as any})}
                          className={`text-2xl ${rating <= newComment.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Категория
                    </label>
                    <select
                      value={newComment.category}
                      onChange={(e) => setNewComment({...newComment, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="general">Общее</option>
                      <option value="dating">Отношения</option>
                      <option value="friendship">Дружба</option>
                      <option value="work">Работа</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Отзыв
                    </label>
                    <textarea
                      value={newComment.content}
                      onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                      required
                      rows={4}
                      placeholder="Поделитесь своим опытом общения..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newComment.anonymous}
                        onChange={(e) => setNewComment({...newComment, anonymous: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Анонимный отзыв
                      </span>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Опубликовать отзыв
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddComment(false)}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Компонент добавления нового человека
  const AddPersonView = () => {
    const [newPerson, setNewPerson] = useState({
      name: '',
      age: 18,
      location: '',
      bio: '',
      photos: ['👤'],
      school: '',
      occupation: '',
      socialMedia: {
        instagram: '',
        tiktok: '',
        snapchat: ''
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPerson.name && newPerson.location) {
        addPerson(newPerson);
        setNewPerson({
          name: '',
          age: 18,
          location: '',
          bio: '',
          photos: ['👤'],
          school: '',
          occupation: '',
          socialMedia: {
            instagram: '',
            tiktok: '',
            snapchat: ''
          }
        });
        setCurrentView('feed');
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Добавить человека
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Имя *
                </label>
                <input
                  type="text"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Возраст *
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={newPerson.age}
                  onChange={(e) => setNewPerson({...newPerson, age: parseInt(e.target.value) || 18})}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Город *
              </label>
              <input
                type="text"
                value={newPerson.location}
                onChange={(e) => setNewPerson({...newPerson, location: e.target.value})}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Описание
              </label>
              <textarea
                value={newPerson.bio}
                onChange={(e) => setNewPerson({...newPerson, bio: e.target.value})}
                rows={3}
                placeholder="Краткое описание..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Учебное заведение
                </label>
                <input
                  type="text"
                  value={newPerson.school}
                  onChange={(e) => setNewPerson({...newPerson, school: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Профессия
                </label>
                <input
                  type="text"
                  value={newPerson.occupation}
                  onChange={(e) => setNewPerson({...newPerson, occupation: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
                Социальные сети
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Instagram username"
                  value={newPerson.socialMedia.instagram}
                  onChange={(e) => setNewPerson({
                    ...newPerson,
                    socialMedia: {...newPerson.socialMedia, instagram: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="TikTok username"
                  value={newPerson.socialMedia.tiktok}
                  onChange={(e) => setNewPerson({
                    ...newPerson,
                    socialMedia: {...newPerson.socialMedia, tiktok: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium"
              >
                Добавить человека
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('feed')}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg font-medium"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Компонент правил и безопасности
  const GuidelinesView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          📋 Правила и безопасность
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              🔴 Красные флаги - что это?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Красные флаги - это предупреждающие знаки о потенциально проблемном поведении человека. 
              Они помогают другим людям принимать осознанные решения о взаимодействии.
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
              <li>Агрессивное или контролирующее поведение</li>
              <li>Неуважение к границам других людей</li>
              <li>Ложь и обман</li>
              <li>Финансовые проблемы или эксплуатация</li>
              <li>Зависимости, влияющие на поведение</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              🟢 Зеленые флаги - хорошие качества
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Зеленые флаги показывают положительные качества и здоровое поведение человека.
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
              <li>Уважение к границам и согласию</li>
              <li>Эмоциональная зрелость и поддержка</li>
              <li>Честность в общении</li>
              <li>Ответственность и надежность</li>
              <li>Доброта и эмпатия</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
              ⚠️ Важные правила
            </h3>
            <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>Добавляйте только достоверную информацию</li>
              <li>Не публикуйте личные данные (номера телефонов, адреса)</li>
              <li>Уважайте анонимность других пользователей</li>
              <li>Не используйте платформу для мести или клеветы</li>
              <li>Сообщайте о злоупотреблениях модераторам</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              🛡️ Защита от злоупотреблений
            </h3>
            <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
              <li>Система голосования помогает фильтровать недостоверную информацию</li>
              <li>Верификация профилей повышает доверие к данным</li>
              <li>Модерация контента предотвращает злоупотребления</li>
              <li>Анонимность защищает пользователей от преследования</li>
              <li>Возможность обжалования неправильных флагов</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
              💡 Как использовать платформу
            </h3>
            <ol className="list-decimal list-inside text-green-700 dark:text-green-300 space-y-1">
              <li>Ищите человека через поиск или просматривайте ленту</li>
              <li>Если не нашли - добавьте новый профиль</li>
              <li>Добавляйте флаги на основе личного опыта</li>
              <li>Голосуйте за достоверные флаги других пользователей</li>
              <li>Оставляйте развернутые отзывы о взаимодействии</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🔍 FlagSpotter
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Анонимная платформа для обмена информацией о людях
            </p>
          </div>
          
          <Link 
            href="/"
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            ← На главную
          </Link>
        </div>

        {/* Навигация */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentView('feed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'feed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              🏠 Лента
            </button>
            <button
              onClick={() => setCurrentView('add-person')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'add-person'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              ➕ Добавить человека
            </button>
            <button
              onClick={() => setCurrentView('guidelines')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'guidelines'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              📋 Правила
            </button>
          </div>
        </div>

        {/* Основной контент */}
        {currentView === 'feed' && <Feed />}
        {currentView === 'add-person' && <AddPersonView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'guidelines' && <GuidelinesView />}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            🔍 Анонимно, безопасно, информативно
          </p>
        </footer>
      </div>
    </div>
  );
}
