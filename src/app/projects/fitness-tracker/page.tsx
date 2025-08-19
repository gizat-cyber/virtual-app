"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

// Типы данных для фитнес трекера
interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  description: string;
  instructions: string[];
  difficulty: 'Начинающий' | 'Средний' | 'Продвинутый';
  equipment: string[];
  image: string;
  videoUrl?: string;
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  duration?: number; // для кардио в секундах
  distance?: number; // для бега в метрах
  restTime: number; // отдых в секундах
  completed: boolean;
  notes?: string;
}

interface WorkoutSession {
  id: string;
  name: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  duration: number; // в минутах
  sets: WorkoutSet[];
  totalWeight: number;
  totalReps: number;
  calories: number;
  notes?: string;
  completed: boolean;
}

interface Goal {
  id: string;
  type: 'weight' | 'reps' | 'duration' | 'frequency' | 'bodyweight';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  category: string;
  completed: boolean;
  createdAt: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: Date;
  requirement: string;
  points: number;
}

interface UserStats {
  totalWorkouts: number;
  totalDuration: number; // в минутах
  totalWeight: number; // кг поднято
  totalReps: number;
  caloriesBurned: number;
  currentStreak: number;
  longestStreak: number;
  favoriteExercise: string;
  achievements: string[];
  level: number;
  experience: number;
}

// Данные упражнений
const exercisesData: Exercise[] = [
  {
    id: "bench-press",
    name: "Жим лежа",
    category: "Силовые",
    muscleGroups: ["Грудь", "Плечи", "Трицепс"],
    description: "Базовое упражнение для развития мышц груди",
    instructions: [
      "Лягте на скамью, стопы плотно на полу",
      "Возьмите штангу широким хватом",
      "Опустите штангу к груди контролируемо",
      "Выжмите вверх, полностью выпрямив руки"
    ],
    difficulty: "Средний",
    equipment: ["Штанга", "Скамья"],
    image: "🏋️"
  },
  {
    id: "squat",
    name: "Приседания",
    category: "Силовые",
    muscleGroups: ["Квадрицепс", "Ягодицы", "Икры"],
    description: "Король всех упражнений для нижней части тела",
    instructions: [
      "Поставьте ноги на ширине плеч",
      "Опуститесь, отводя таз назад",
      "Держите спину прямой",
      "Вернитесь в исходное положение"
    ],
    difficulty: "Начинающий",
    equipment: ["Штанга", "Стойка"],
    image: "🦵"
  },
  {
    id: "deadlift",
    name: "Становая тяга",
    category: "Силовые",
    muscleGroups: ["Спина", "Ягодицы", "Бицепс бедра"],
    description: "Комплексное упражнение для всего тела",
    instructions: [
      "Встаньте над штангой, ноги на ширине плеч",
      "Согните колени и возьмите штангу",
      "Поднимайте, разгибая ноги и спину",
      "Полностью выпрямитесь вверху"
    ],
    difficulty: "Продвинутый",
    equipment: ["Штанга"],
    image: "💪"
  },
  {
    id: "pull-ups",
    name: "Подтягивания",
    category: "Силовые",
    muscleGroups: ["Спина", "Бицепс"],
    description: "Упражнение с собственным весом для спины",
    instructions: [
      "Возьмитесь за перекладину широким хватом",
      "Подтянитесь, сводя лопатки",
      "Достаньте подбородком до перекладины",
      "Опуститесь контролируемо"
    ],
    difficulty: "Средний",
    equipment: ["Турник"],
    image: "🎯"
  },
  {
    id: "push-ups",
    name: "Отжимания",
    category: "Силовые",
    muscleGroups: ["Грудь", "Плечи", "Трицепс"],
    description: "Классическое упражнение с собственным весом",
    instructions: [
      "Примите упор лежа",
      "Опуститесь, касаясь грудью пола",
      "Отжимайтесь, полностью выпрямляя руки",
      "Держите тело прямым"
    ],
    difficulty: "Начинающий",
    equipment: [],
    image: "💥"
  },
  {
    id: "running",
    name: "Бег",
    category: "Кардио",
    muscleGroups: ["Ноги", "Кор"],
    description: "Аэробное упражнение для выносливости",
    instructions: [
      "Начните с легкой разминки",
      "Поддерживайте ровный темп",
      "Дышите ритмично",
      "Следите за техникой бега"
    ],
    difficulty: "Начинающий",
    equipment: ["Беговые кроссовки"],
    image: "🏃"
  },
  {
    id: "plank",
    name: "Планка",
    category: "Кор",
    muscleGroups: ["Кор", "Плечи"],
    description: "Изометрическое упражнение для мышц кора",
    instructions: [
      "Примите упор на предплечья",
      "Держите тело прямой линией",
      "Напрягите пресс",
      "Дышите спокойно"
    ],
    difficulty: "Начинающий",
    equipment: [],
    image: "🧘"
  }
];

// Готовые тренировки
const workoutTemplates = [
  {
    id: "push-day",
    name: "Push Day (Толкание)",
    description: "Тренировка грудных мышц, плеч и трицепса",
    exercises: ["bench-press", "push-ups"],
    duration: 60
  },
  {
    id: "pull-day",
    name: "Pull Day (Тяга)",
    description: "Тренировка спины и бицепса",
    exercises: ["pull-ups", "deadlift"],
    duration: 60
  },
  {
    id: "leg-day",
    name: "Leg Day (Ноги)",
    description: "Тренировка нижней части тела",
    exercises: ["squat", "deadlift"],
    duration: 75
  },
  {
    id: "cardio",
    name: "Кардио тренировка",
    description: "Аэробная нагрузка для выносливости",
    exercises: ["running", "plank"],
    duration: 45
  }
];

// Основной компонент фитнес трекера
export default function FitnessTracker() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'workouts' | 'exercises' | 'progress' | 'goals' | 'calendar'>('dashboard');
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalWorkouts: 0,
    totalDuration: 0,
    totalWeight: 0,
    totalReps: 0,
    caloriesBurned: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteExercise: "",
    achievements: [],
    level: 1,
    experience: 0
  });

  // Загрузка данных из localStorage
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('fitness-workouts');
    if (savedWorkouts) {
      const workouts = JSON.parse(savedWorkouts).map((w: any) => ({
        ...w,
        date: new Date(w.date),
        startTime: w.startTime ? new Date(w.startTime) : undefined,
        endTime: w.endTime ? new Date(w.endTime) : undefined
      }));
      setWorkoutSessions(workouts);
    }

    const savedGoals = localStorage.getItem('fitness-goals');
    if (savedGoals) {
      const goals = JSON.parse(savedGoals).map((g: any) => ({
        ...g,
        deadline: new Date(g.deadline),
        createdAt: new Date(g.createdAt)
      }));
      setGoals(goals);
    }

    const savedStats = localStorage.getItem('fitness-stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

    const savedAchievements = localStorage.getItem('fitness-achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements).map((a: any) => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
      })));
    } else {
      // Инициализация достижений
      initializeAchievements();
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem('fitness-workouts', JSON.stringify(workoutSessions));
  }, [workoutSessions]);

  useEffect(() => {
    localStorage.setItem('fitness-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fitness-stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('fitness-achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Инициализация достижений
  const initializeAchievements = () => {
    const initialAchievements: Achievement[] = [
      {
        id: "first-workout",
        title: "Первые шаги",
        description: "Завершите первую тренировку",
        icon: "🎯",
        category: "Начинающий",
        unlocked: false,
        requirement: "Завершить 1 тренировку",
        points: 10
      },
      {
        id: "week-streak",
        title: "Неделя в деле",
        description: "Тренируйтесь 7 дней подряд",
        icon: "🔥",
        category: "Постоянство",
        unlocked: false,
        requirement: "7 дней подряд",
        points: 50
      },
      {
        id: "heavy-lifter",
        title: "Тяжеловес",
        description: "Поднимите 1000 кг за тренировку",
        icon: "💪",
        category: "Сила",
        unlocked: false,
        requirement: "1000 кг за тренировку",
        points: 100
      },
      {
        id: "marathon-runner",
        title: "Марафонец",
        description: "Пробегите 42.2 км суммарно",
        icon: "🏃",
        category: "Выносливость",
        unlocked: false,
        requirement: "42.2 км бега",
        points: 200
      },
      {
        id: "goal-crusher",
        title: "Покоритель целей",
        description: "Достигните 5 целей",
        icon: "🏆",
        category: "Достижения",
        unlocked: false,
        requirement: "5 достигнутых целей",
        points: 150
      }
    ];
    setAchievements(initialAchievements);
  };

  // Создание новой тренировки
  const startWorkout = useCallback((templateId?: string) => {
    const template = workoutTemplates.find(t => t.id === templateId);
    const newWorkout: WorkoutSession = {
      id: `workout-${Date.now()}`,
      name: template?.name || "Новая тренировка",
      date: new Date(),
      startTime: new Date(),
      duration: 0,
      sets: [],
      totalWeight: 0,
      totalReps: 0,
      calories: 0,
      completed: false
    };

    setCurrentWorkout(newWorkout);
    setIsWorkoutActive(true);
    setCurrentView('workouts');
  }, []);

  // Добавление упражнения в активную тренировку
  const addExerciseToWorkout = useCallback((exerciseId: string) => {
    if (!currentWorkout) return;

    const newSet: WorkoutSet = {
      id: `set-${Date.now()}`,
      exerciseId,
      reps: 0,
      weight: 0,
      restTime: 60,
      completed: false
    };

    setCurrentWorkout(prev => prev ? {
      ...prev,
      sets: [...prev.sets, newSet]
    } : null);
  }, [currentWorkout]);

  // Обновление сета
  const updateSet = useCallback((setId: string, updates: Partial<WorkoutSet>) => {
    if (!currentWorkout) return;

    setCurrentWorkout(prev => prev ? {
      ...prev,
      sets: prev.sets.map(set => 
        set.id === setId ? { ...set, ...updates } : set
      )
    } : null);
  }, [currentWorkout]);

  // Завершение тренировки
  const finishWorkout = useCallback(() => {
    if (!currentWorkout) return;

    const finishedWorkout: WorkoutSession = {
      ...currentWorkout,
      endTime: new Date(),
      duration: currentWorkout.startTime ? 
        Math.round((Date.now() - currentWorkout.startTime.getTime()) / 60000) : 0,
      totalWeight: currentWorkout.sets.reduce((sum, set) => 
        sum + (set.completed ? set.weight * set.reps : 0), 0),
      totalReps: currentWorkout.sets.reduce((sum, set) => 
        sum + (set.completed ? set.reps : 0), 0),
      calories: Math.round(currentWorkout.sets.length * 15 + (currentWorkout.duration || 0) * 5),
      completed: true
    };

    setWorkoutSessions(prev => [finishedWorkout, ...prev]);
    
    // Обновление статистики
    setUserStats(prev => ({
      ...prev,
      totalWorkouts: prev.totalWorkouts + 1,
      totalDuration: prev.totalDuration + finishedWorkout.duration,
      totalWeight: prev.totalWeight + finishedWorkout.totalWeight,
      totalReps: prev.totalReps + finishedWorkout.totalReps,
      caloriesBurned: prev.caloriesBurned + finishedWorkout.calories,
      experience: prev.experience + Math.round(finishedWorkout.duration / 2)
    }));

    // Проверка достижений
    checkAchievements(finishedWorkout);

    setCurrentWorkout(null);
    setIsWorkoutActive(false);
    setCurrentView('dashboard');
  }, [currentWorkout]);

  // Проверка достижений
  const checkAchievements = useCallback((workout: WorkoutSession) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;

      switch (achievement.id) {
        case "first-workout":
          shouldUnlock = userStats.totalWorkouts >= 0; // Первая тренировка
          break;
        case "heavy-lifter":
          shouldUnlock = workout.totalWeight >= 1000;
          break;
        case "week-streak":
          shouldUnlock = userStats.currentStreak >= 7;
          break;
        case "marathon-runner":
          // Примерная логика для бега
          shouldUnlock = false; // Реализовать подсчет дистанции
          break;
        case "goal-crusher":
          shouldUnlock = goals.filter(g => g.completed).length >= 5;
          break;
      }

      if (shouldUnlock) {
        return {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        };
      }

      return achievement;
    }));
  }, [userStats, goals]);

  // Создание новой цели
  const createGoal = useCallback((goalData: Omit<Goal, 'id' | 'currentValue' | 'completed' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      currentValue: 0,
      completed: false,
      createdAt: new Date()
    };

    setGoals(prev => [...prev, newGoal]);
  }, []);

  // Обновление прогресса цели
  const updateGoalProgress = useCallback((goalId: string, newValue: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const completed = newValue >= goal.targetValue;
        return {
          ...goal,
          currentValue: newValue,
          completed
        };
      }
      return goal;
    }));
  }, []);

  // Фильтрация упражнений
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');

  const filteredExercises = useMemo(() => {
    return exercisesData.filter(exercise => {
      const matchesCategory = exerciseFilter === 'all' || exercise.category === exerciseFilter;
      const matchesMuscleGroup = muscleGroupFilter === 'all' || 
        exercise.muscleGroups.includes(muscleGroupFilter);
      return matchesCategory && matchesMuscleGroup;
    });
  }, [exerciseFilter, muscleGroupFilter]);

  // Уникальные категории и мышечные группы
  const categories = useMemo(() => {
    const allCategories = exercisesData.map(e => e.category);
    return Array.from(new Set(allCategories));
  }, []);

  const muscleGroups = useMemo(() => {
    const allMuscleGroups = exercisesData.flatMap(e => e.muscleGroups);
    return Array.from(new Set(allMuscleGroups));
  }, []);

  // Статистика последних тренировок
  const recentWorkouts = useMemo(() => {
    return workoutSessions.slice(0, 5);
  }, [workoutSessions]);

  // Компонент дашборда
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Тренировок</p>
              <p className="text-2xl font-bold text-blue-600">{userStats.totalWorkouts}</p>
            </div>
            <div className="text-3xl">🏋️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Часов</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(userStats.totalDuration / 60)}
              </p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Поднято кг</p>
              <p className="text-2xl font-bold text-purple-600">
                {userStats.totalWeight.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">💪</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Калорий</p>
              <p className="text-2xl font-bold text-orange-600">
                {userStats.caloriesBurned.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Быстрый старт
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workoutTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => startWorkout(template.id)}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {template.description}
              </p>
              <p className="text-xs text-slate-500">
                ~{template.duration} мин
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Последние тренировки */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Последние тренировки
        </h2>
        {recentWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏃</div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Пока нет тренировок
            </p>
            <button
              onClick={() => startWorkout()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Начать первую тренировку
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map(workout => (
              <div key={workout.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {workout.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {workout.date.toLocaleDateString()} • {workout.duration} мин • {workout.sets.length} упражнений
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {workout.totalWeight} кг
                  </p>
                  <p className="text-xs text-slate-500">
                    {workout.calories} ккал
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Активные цели */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Активные цели
          </h2>
          <button
            onClick={() => setCurrentView('goals')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Все цели →
          </button>
        </div>
        
        {goals.filter(g => !g.completed).slice(0, 3).map(goal => (
          <div key={goal.id} className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                {goal.title}
              </h3>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {goal.currentValue}/{goal.targetValue} {goal.unit}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        {goals.filter(g => !g.completed).length === 0 && (
          <p className="text-slate-600 dark:text-slate-400 text-center py-4">
            Нет активных целей. Создайте первую цель!
          </p>
        )}
      </div>
    </div>
  );

  // Компонент активной тренировки
  const ActiveWorkout = () => {
    if (!currentWorkout) return null;

    const [currentExerciseId, setCurrentExerciseId] = useState<string>('');
    const [showAddExercise, setShowAddExercise] = useState(false);

    return (
      <div className="space-y-6">
        {/* Заголовок тренировки */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currentWorkout.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Начата: {currentWorkout.startTime?.toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={finishWorkout}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium mb-2"
              >
                Завершить тренировку
              </button>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Упражнений: {currentWorkout.sets.length}
              </p>
            </div>
          </div>
        </div>

        {/* Упражнения в тренировке */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Упражнения
            </h3>
            <button
              onClick={() => setShowAddExercise(!showAddExercise)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Добавить упражнение
            </button>
          </div>

          {showAddExercise && (
            <div className="mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                Выберите упражнение:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {exercisesData.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      addExerciseToWorkout(exercise.id);
                      setShowAddExercise(false);
                    }}
                    className="p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{exercise.image}</span>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {exercise.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {exercise.muscleGroups.join(", ")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentWorkout.sets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                Добавьте упражнения для начала тренировки
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentWorkout.sets.map((set, index) => {
                const exercise = exercisesData.find(e => e.id === set.exerciseId);
                if (!exercise) return null;

                return (
                  <div key={set.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{exercise.image}</span>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {exercise.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Подход {index + 1}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateSet(set.id, { completed: !set.completed })}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          set.completed
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {set.completed ? '✓ Выполнено' : 'Выполнить'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Повторения
                        </label>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(set.id, { reps: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Вес (кг)
                        </label>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(set.id, { weight: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Отдых (сек)
                        </label>
                        <input
                          type="number"
                          value={set.restTime}
                          onChange={(e) => updateSet(set.id, { restTime: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setCurrentWorkout(prev => prev ? {
                              ...prev,
                              sets: prev.sets.filter(s => s.id !== set.id)
                            } : null);
                          }}
                          className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Компонент библиотеки упражнений
  const ExerciseLibrary = () => (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={exerciseFilter}
            onChange={(e) => setExerciseFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Все категории</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={muscleGroupFilter}
            onChange={(e) => setMuscleGroupFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Все мышечные группы</option>
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Список упражнений */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{exercise.image}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {exercise.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {exercise.category}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Мышечные группы:
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exercise.muscleGroups.map(group => (
                    <span
                      key={group}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Сложность:
                </p>
                <span className={`text-sm px-2 py-1 rounded ${
                  exercise.difficulty === 'Начинающий' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                  exercise.difficulty === 'Средний' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  {exercise.difficulty}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                {exercise.description}
              </p>

              {isWorkoutActive && (
                <button
                  onClick={() => addExerciseToWorkout(exercise.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Добавить в тренировку
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Компонент целей
  const Goals = () => {
    const [showCreateGoal, setShowCreateGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({
      type: 'weight' as Goal['type'],
      title: '',
      description: '',
      targetValue: 0,
      unit: 'кг',
      deadline: '',
      category: 'Сила'
    });

    const handleCreateGoal = (e: React.FormEvent) => {
      e.preventDefault();
      if (newGoal.title && newGoal.targetValue > 0 && newGoal.deadline) {
        createGoal({
          ...newGoal,
          deadline: new Date(newGoal.deadline)
        });
        setNewGoal({
          type: 'weight',
          title: '',
          description: '',
          targetValue: 0,
          unit: 'кг',
          deadline: '',
          category: 'Сила'
        });
        setShowCreateGoal(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Заголовок и кнопка создания */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Мои цели
            </h2>
            <button
              onClick={() => setShowCreateGoal(!showCreateGoal)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              + Новая цель
            </button>
          </div>
        </div>

        {/* Форма создания цели */}
        {showCreateGoal && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Создать новую цель
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Название цели"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({...newGoal, type: e.target.value as Goal['type']})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="weight">Вес</option>
                  <option value="reps">Повторения</option>
                  <option value="duration">Время</option>
                  <option value="frequency">Частота</option>
                </select>
              </div>
              
              <textarea
                placeholder="Описание цели"
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Целевое значение"
                  value={newGoal.targetValue || ''}
                  onChange={(e) => setNewGoal({...newGoal, targetValue: parseFloat(e.target.value) || 0})}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Единица измерения"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Создать цель
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGoal(false)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Список целей */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => (
            <div key={goal.id} className={`rounded-lg shadow-md p-6 ${
              goal.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-slate-800'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {goal.description}
                  </p>
                </div>
                {goal.completed && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm">
                    ✓ Выполнено
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Прогресс:</span>
                  <span className="text-sm font-medium">
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      goal.completed ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                <span>Срок: {goal.deadline.toLocaleDateString()}</span>
                <span>{goal.category}</span>
              </div>

              {!goal.completed && (
                <div className="mt-4 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Обновить прогресс"
                    className="flex-1 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseFloat((e.target as HTMLInputElement).value);
                        if (value >= 0) {
                          updateGoalProgress(goal.id, value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector(`input[placeholder="Обновить прогресс"]`) as HTMLInputElement;
                      const value = parseFloat(input?.value || '0');
                      if (value >= 0) {
                        updateGoalProgress(goal.id, value);
                        if (input) input.value = '';
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Обновить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {goals.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Пока нет целей
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Создайте первую цель для мотивации!
            </p>
          </div>
        )}
      </div>
    );
  };

  // Компонент достижений
  const Achievements = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        🏆 Достижения
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border ${
              achievement.unlocked
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  achievement.unlocked 
                    ? 'text-yellow-800 dark:text-yellow-200' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {achievement.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {achievement.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {achievement.requirement}
                </p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Получено: {achievement.unlockedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-blue-600">
                  {achievement.points} XP
                </span>
              </div>
            </div>
          </div>
        ))}
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
              🏋️ Фитнес трекер
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Отслеживайте тренировки, достигайте целей, будьте в форме
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
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              📊 Дашборд
            </button>
            {isWorkoutActive ? (
              <button
                onClick={() => setCurrentView('workouts')}
                className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white animate-pulse"
              >
                🏃 Активная тренировка
              </button>
            ) : (
              <button
                onClick={() => startWorkout()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'workouts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                🏋️ Начать тренировку
              </button>
            )}
            <button
              onClick={() => setCurrentView('exercises')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'exercises'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              💪 Упражнения
            </button>
            <button
              onClick={() => setCurrentView('goals')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'goals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              🎯 Цели ({goals.filter(g => !g.completed).length})
            </button>
            <button
              onClick={() => setCurrentView('progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              📈 Прогресс
            </button>
          </div>
        </div>

        {/* Основной контент */}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'workouts' && isWorkoutActive && <ActiveWorkout />}
        {currentView === 'exercises' && <ExerciseLibrary />}
        {currentView === 'goals' && <Goals />}
        {currentView === 'progress' && <Achievements />}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            💪 Каждая тренировка приближает вас к цели!
          </p>
        </footer>
      </div>
    </div>
  );
}
