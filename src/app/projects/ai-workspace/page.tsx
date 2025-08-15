"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Типы данных
interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  type: "note" | "task" | "project" | "idea";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: Date;
  updatedAt: Date;
  aiSummary?: string;
  linkedDocuments: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  dueDate?: string;
  tags: string[];
  estimatedTime?: number;
  actualTime?: number;
  createdAt: Date;
  aiInsights?: string[];
}

interface AIMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  context?: string;
}

interface VoiceNote {
  id: string;
  title: string;
  duration: number;
  transcript: string;
  createdAt: Date;
  tags: string[];
}

// Симуляция AI ответов
const aiResponses = {
  productivity: [
    "На основе анализа ваших задач, рекомендую сосредоточиться на 3 приоритетных задачах сегодня.",
    "Ваша продуктивность повысилась на 23% за последнюю неделю. Отличная работа!",
    "Обнаружил паттерн: задачи по дизайну выполняются быстрее во второй половине дня."
  ],
  suggestions: [
    "Предлагаю создать шаблон для повторяющихся задач типа 'Еженедельный отчет'.",
    "Заметил, что у вас много задач с тегом 'urgent'. Возможно, стоит пересмотреть планирование.",
    "Рекомендую разбить задачу 'Большой проект' на более мелкие подзадачи."
  ],
  insights: [
    "Анализ показывает, что ваше пиковое время продуктивности - 10:00-12:00.",
    "За последний месяц вы завершили 87% запланированных задач. Это отличный показатель!",
    "Обратите внимание: задачи с оценкой времени выполняются на 34% эффективнее."
  ]
};

export default function AIWorkspace() {
  // Состояния
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  
  const [activeView, setActiveView] = useState<"dashboard" | "documents" | "tasks" | "ai-chat" | "voice" | "analytics">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // AI Chat
  const [aiInput, setAiInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Drag & Drop для Kanban
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Формы
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    title: "",
    content: "",
    type: "note" as Document["type"],
    priority: "medium" as Document["priority"],
    tags: ""
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
    estimatedTime: "",
    tags: ""
  });

  // Загрузка данных
  useEffect(() => {
    const savedDocs = localStorage.getItem("ai-workspace-documents");
    const savedTasks = localStorage.getItem("ai-workspace-tasks");
    const savedMessages = localStorage.getItem("ai-workspace-messages");
    const savedVoiceNotes = localStorage.getItem("ai-workspace-voice");
    
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedMessages) setAiMessages(JSON.parse(savedMessages));
    if (savedVoiceNotes) setVoiceNotes(JSON.parse(savedVoiceNotes));
    
    // Приветственное сообщение от AI
    if (!savedMessages) {
      const welcomeMessage: AIMessage = {
        id: "welcome",
        type: "ai",
        content: "👋 Привет! Я ваш AI-ассистент. Готов помочь с организацией работы, анализом продуктивности и умными советами. Чем могу быть полезен?",
        timestamp: new Date(),
        context: "welcome"
      };
      setAiMessages([welcomeMessage]);
    }
  }, []);

  // Сохранение данных
  useEffect(() => {
    localStorage.setItem("ai-workspace-documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("ai-workspace-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("ai-workspace-messages", JSON.stringify(aiMessages));
  }, [aiMessages]);

  useEffect(() => {
    localStorage.setItem("ai-workspace-voice", JSON.stringify(voiceNotes));
  }, [voiceNotes]);

  // AI функции
  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("продуктивность") || message.includes("эффективность")) {
      return aiResponses.productivity[Math.floor(Math.random() * aiResponses.productivity.length)];
    } else if (message.includes("совет") || message.includes("рекомендация")) {
      return aiResponses.suggestions[Math.floor(Math.random() * aiResponses.suggestions.length)];
    } else if (message.includes("анализ") || message.includes("статистика")) {
      return aiResponses.insights[Math.floor(Math.random() * aiResponses.insights.length)];
    } else if (message.includes("задач")) {
      const todoCount = tasks.filter(t => t.status === "todo").length;
      const inProgressCount = tasks.filter(t => t.status === "in-progress").length;
      return `У вас ${todoCount} новых задач и ${inProgressCount} в работе. Рекомендую начать с задач высокого приоритета.`;
    } else if (message.includes("документ")) {
      const recentDocs = documents.filter(d => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return new Date(d.updatedAt) > dayAgo;
      }).length;
      return `За последний день вы обновили ${recentDocs} документов. Отличная активность!`;
    }
    
    return "Интересный вопрос! Могу проанализировать ваши задачи, дать советы по продуктивности или помочь с организацией документов. О чем хотели бы узнать подробнее?";
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput("");
    setIsTyping(true);

    // Имитация задержки AI
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAIResponse(aiInput),
        timestamp: new Date(),
        context: "response"
      };
      
      setAiMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  // Функции документов
  const addDocument = () => {
    if (!documentForm.title.trim()) return;

    const newDoc: Document = {
      id: Date.now().toString(),
      title: documentForm.title,
      content: documentForm.content,
      type: documentForm.type,
      priority: documentForm.priority,
      tags: documentForm.tags.split(",").map(t => t.trim()).filter(t => t),
      createdAt: new Date(),
      updatedAt: new Date(),
      linkedDocuments: [],
      aiSummary: documentForm.content.length > 100 
        ? `Документ содержит ${documentForm.content.split(" ").length} слов. Основные темы: ${documentForm.tags}.`
        : undefined
    };

    setDocuments(prev => [newDoc, ...prev]);
    setDocumentForm({
      title: "",
      content: "",
      type: "note",
      priority: "medium",
      tags: ""
    });
    setShowDocumentForm(false);
  };

  // Функции задач
  const addTask = () => {
    if (!taskForm.title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      status: "todo",
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      estimatedTime: taskForm.estimatedTime ? parseInt(taskForm.estimatedTime) : undefined,
      tags: taskForm.tags.split(",").map(t => t.trim()).filter(t => t),
      createdAt: new Date(),
      aiInsights: ["Новая задача добавлена в бэклог", "Рекомендуется установить дедлайн"]
    };

    setTasks(prev => [newTask, ...prev]);
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      estimatedTime: "",
      tags: ""
    });
    setShowTaskForm(false);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date() }
        : task
    ));
  };

  // Voice Recording
  const startRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Имитация записи
    setTimeout(() => {
      stopRecording();
    }, 5000 + Math.random() * 10000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }

    // Имитация транскрипции
    const mockTranscripts = [
      "Нужно не забыть подготовить презентацию к завтрашней встрече с клиентом",
      "Идея для нового проекта: создать мобильное приложение для учета времени",
      "Обсудить с командой возможность внедрения новых технологий в проект"
    ];

    const newVoiceNote: VoiceNote = {
      id: Date.now().toString(),
      title: `Голосовая заметка ${new Date().toLocaleTimeString()}`,
      duration: recordingTime,
      transcript: mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)],
      createdAt: new Date(),
      tags: ["voice", "auto-generated"]
    };

    setVoiceNotes(prev => [newVoiceNote, ...prev]);
    setRecordingTime(0);
  };

  // Статистика
  const getStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const totalDocs = documents.length;
    const todayDocs = documents.filter(d => {
      const today = new Date().toDateString();
      return new Date(d.createdAt).toDateString() === today;
    }).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      totalTasks,
      completedTasks,
      totalDocs,
      todayDocs,
      completionRate,
      voiceNotesCount: voiceNotes.length
    };
  };

  const stats = getStats();

  // Фильтрация
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => doc.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => task.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "done": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
          >
            ← Назад к проектам
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🤖 AI-Powered Workspace
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Интеллектуальное управление задачами, документами и продуктивностью
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 lg:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => setShowDocumentForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 text-sm"
              >
                📝 Документ
              </button>
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 text-sm"
              >
                ✅ Задача
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  isRecording 
                    ? "bg-red-600 text-white hover:bg-red-700 animate-pulse" 
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isRecording ? `🔴 ${formatTime(recordingTime)}` : "🎙️ Голос"}
              </button>
            </div>
          </div>
        </header>

        {/* Features Overview */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">🚀 Продвинутые возможности:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span>🤖</span>
              <span>AI-ассистент</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Умная аналитика</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎙️</span>
              <span>Голосовые заметки</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📋</span>
              <span>Kanban доска</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔍</span>
              <span>Умный поиск</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Автоматизация</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl mb-6 border border-white/20 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: "dashboard", label: "📊 Дашборд", icon: "📊" },
              { id: "tasks", label: "✅ Задачи", icon: "✅" },
              { id: "documents", label: "📝 Документы", icon: "📝" },
              { id: "ai-chat", label: "🤖 AI Чат", icon: "🤖" },
              { id: "voice", label: "🎙️ Голос", icon: "🎙️" },
              { id: "analytics", label: "📈 Аналитика", icon: "📈" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeView === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-slate-700/50"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-700/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks View - Kanban Board */}
        {activeView === "tasks" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Поиск задач..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-100"
                />
                <div className="flex gap-2">
                  {["urgent", "high", "medium", "low"].map(priority => (
                    <button
                      key={priority}
                      onClick={() => {
                        if (selectedTags.includes(priority)) {
                          setSelectedTags(selectedTags.filter(t => t !== priority));
                        } else {
                          setSelectedTags([...selectedTags, priority]);
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedTags.includes(priority)
                          ? `${getPriorityColor(priority)} text-white`
                          : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { status: "todo", title: "К выполнению", icon: "📋", color: "bg-slate-100 dark:bg-slate-700" },
                { status: "in-progress", title: "В работе", icon: "🔄", color: "bg-blue-100 dark:bg-blue-900/30" },
                { status: "review", title: "На проверке", icon: "👀", color: "bg-yellow-100 dark:bg-yellow-900/30" },
                { status: "done", title: "Готово", icon: "✅", color: "bg-green-100 dark:bg-green-900/30" }
              ].map((column) => (
                <div
                  key={column.status}
                  className={`${column.color} rounded-xl p-4 border border-white/20 dark:border-slate-600`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedTask) {
                      updateTaskStatus(draggedTask, column.status as Task["status"]);
                      setDraggedTask(null);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                      <span>{column.icon}</span>
                      <span>{column.title}</span>
                    </h3>
                    <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full text-xs">
                      {filteredTasks.filter(t => t.status === column.status).length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredTasks
                      .filter(task => task.status === column.status)
                      .map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setDraggedTask(task.id)}
                          className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-move border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                              {task.title}
                            </h4>
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-2">
                              {task.dueDate && (
                                <span className="flex items-center space-x-1">
                                  <span>📅</span>
                                  <span>{new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                                </span>
                              )}
                              {task.estimatedTime && (
                                <span className="flex items-center space-x-1">
                                  <span>⏱️</span>
                                  <span>{task.estimatedTime}ч</span>
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              {task.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="bg-slate-100 dark:bg-slate-600 px-1 py-0.5 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {task.aiInsights && task.aiInsights.length > 0 && (
                            <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded text-xs">
                              <span className="text-indigo-600 dark:text-indigo-400">🤖 {task.aiInsights[0]}</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents View */}
        {activeView === "documents" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Поиск документов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                />
                <div className="flex gap-2">
                  {["note", "task", "project", "idea"].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        if (selectedTags.includes(type)) {
                          setSelectedTags(selectedTags.filter(t => t !== type));
                        } else {
                          setSelectedTags([...selectedTags, type]);
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedTags.includes(type)
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {type === "note" ? "📝" : type === "task" ? "✅" : type === "project" ? "🚀" : "💡"} {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {doc.type === "note" ? "📝" : doc.type === "task" ? "✅" : doc.type === "project" ? "🚀" : "💡"}
                      </span>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {doc.title}
                      </h3>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(doc.priority)}`}></div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {doc.content}
                  </p>

                  {doc.aiSummary && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        🤖 AI: {doc.aiSummary}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{new Date(doc.updatedAt).toLocaleDateString('ru-RU')}</span>
                    <div className="flex space-x-1">
                      {doc.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchQuery || selectedTags.length > 0
                    ? "Документы не найдены. Попробуйте изменить критерии поиска."
                    : "Пока нет документов. Создайте первый документ!"
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Chat View */}
        {activeView === "ai-chat" && (
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700 h-[600px] flex flex-col">
            <div className="p-6 border-b border-white/20 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>🤖</span>
                <span>AI Ассистент</span>
                <span className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                  Online
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.type === "user"
                        ? "bg-indigo-600 text-white ml-auto"
                        : "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-2 opacity-70 ${
                      message.type === "user" ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl border border-slate-200 dark:border-slate-600">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/20 dark:border-slate-700">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendAIMessage()}
                  placeholder="Спросите AI о продуктивности, задачах или получите советы..."
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                />
                <button
                  onClick={sendAIMessage}
                  disabled={!aiInput.trim() || isTyping}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Отправить
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Анализ продуктивности", "Советы по задачам", "Статистика работы"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setAiInput(suggestion);
                      setTimeout(() => sendAIMessage(), 100);
                    }}
                    className="text-xs bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Voice Notes View */}
        {activeView === "voice" && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                🎙️ Голосовые заметки с AI транскрипцией
              </h3>
              
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-3 bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-xl">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-700 dark:text-red-300 font-medium">
                        Запись: {formatTime(recordingTime)}
                      </span>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      🛑 Остановить запись
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startRecording}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    🎙️ Начать запись
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voiceNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {note.title}
                    </h4>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTime(note.duration)}
                    </span>
                  </div>

                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {note.transcript}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{new Date(note.createdAt).toLocaleDateString('ru-RU')}</span>
                    <div className="flex space-x-1">
                      {note.tags.map(tag => (
                        <span key={tag} className="bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {voiceNotes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎙️</div>
                <p className="text-slate-500 dark:text-slate-400">
                  Пока нет голосовых заметок. Запишите первую!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {activeView === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">📊 Общая статистика</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Продуктивность:</span>
                    <span className="font-medium text-green-600">{stats.completionRate.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Активность:</span>
                    <span className="font-medium text-blue-600">Высокая</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Фокус:</span>
                    <span className="font-medium text-purple-600">87%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">🎯 Задачи по статусам</h4>
                <div className="space-y-3">
                  {[
                    { status: "todo", label: "К выполнению", color: "bg-slate-500" },
                    { status: "in-progress", label: "В работе", color: "bg-blue-500" },
                    { status: "review", label: "На проверке", color: "bg-yellow-500" },
                    { status: "done", label: "Готово", color: "bg-green-500" }
                  ].map((item) => {
                    const count = tasks.filter(t => t.status === item.status).length;
                    const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                    return (
                      <div key={item.status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{count}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">🏆 Достижения</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Продуктивность</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Завершено {stats.completedTasks} задач</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Документооборот</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Создано {stats.totalDocs} документов</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎙️</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Голосовые заметки</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{stats.voiceNotesCount} записей</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">🤖 AI Инсайты и Рекомендации</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Анализ продуктивности</h5>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✅ Отличная динамика выполнения задач за последнюю неделю
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        📊 Пиковая активность приходится на утренние часы
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Рекомендации</h5>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        💡 Рекомендуем планировать сложные задачи на утро
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        🎯 Добавьте больше коротких задач для поддержания мотивации
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Всего задач</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTasks}</p>
                    <p className="text-xs text-green-600">+{tasks.filter(t => {
                      const today = new Date().toDateString();
                      return new Date(t.createdAt).toDateString() === today;
                    }).length} сегодня</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Выполнено</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-xs text-slate-500">{stats.completionRate.toFixed(1)}% от общего</p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Документов</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalDocs}</p>
                    <p className="text-xs text-blue-600">+{stats.todayDocs} сегодня</p>
                  </div>
                  <div className="text-3xl">📝</div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Голосовые заметки</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.voiceNotesCount}</p>
                    <p className="text-xs text-purple-600">AI транскрипция</p>
                  </div>
                  <div className="text-3xl">🎙️</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700">
                <div className="p-6 border-b border-white/20 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Последние задачи
                  </h3>
                </div>
                <div className="p-6">
                  {tasks.slice(0, 5).length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      Пока нет задач. Создайте первую!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                {task.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700">
                <div className="p-6 border-b border-white/20 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    AI Инсайты
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">🤖</span>
                        <div>
                          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                            Анализ продуктивности
                          </p>
                          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                            {aiResponses.insights[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">💡</span>
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-200">
                            Рекомендация
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            {aiResponses.suggestions[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Form Modal */}
        {showDocumentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Создать документ
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Название документа"
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={documentForm.type}
                    onChange={(e) => setDocumentForm({...documentForm, type: e.target.value as Document["type"]})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="note">📝 Заметка</option>
                    <option value="task">✅ Задача</option>
                    <option value="project">🚀 Проект</option>
                    <option value="idea">💡 Идея</option>
                  </select>

                  <select
                    value={documentForm.priority}
                    onChange={(e) => setDocumentForm({...documentForm, priority: e.target.value as Document["priority"]})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="low">🟢 Низкий</option>
                    <option value="medium">🟡 Средний</option>
                    <option value="high">🟠 Высокий</option>
                    <option value="urgent">🔴 Срочно</option>
                  </select>
                </div>

                <textarea
                  placeholder="Содержание документа..."
                  rows={6}
                  value={documentForm.content}
                  onChange={(e) => setDocumentForm({...documentForm, content: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                />

                <input
                  type="text"
                  placeholder="Теги (через запятую)"
                  value={documentForm.tags}
                  onChange={(e) => setDocumentForm({...documentForm, tags: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                />

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowDocumentForm(false)}
                    className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={addDocument}
                    disabled={!documentForm.title.trim()}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Создать
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Создать задачу
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Название задачи"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-100"
                />

                <textarea
                  placeholder="Описание задачи..."
                  rows={4}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-100"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as Task["priority"]})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="low">🟢 Низкий</option>
                    <option value="medium">🟡 Средний</option>
                    <option value="high">🟠 Высокий</option>
                    <option value="urgent">🔴 Срочно</option>
                  </select>

                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-100"
                  />

                  <input
                    type="number"
                    placeholder="Часы"
                    value={taskForm.estimatedTime}
                    onChange={(e) => setTaskForm({...taskForm, estimatedTime: e.target.value})}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Теги (через запятую)"
                  value={taskForm.tags}
                  onChange={(e) => setTaskForm({...taskForm, tags: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-slate-100"
                />

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={addTask}
                    disabled={!taskForm.title.trim()}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Создать
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tech Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Технологии: Advanced React Patterns, AI Simulation, Voice API, Drag & Drop, Complex State Management, Real-time Updates
          </p>
        </div>
      </div>
    </div>
  );
}
