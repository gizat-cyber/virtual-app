"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Типы данных для умного дома
interface Device {
  id: string;
  name: string;
  type: "light" | "climate" | "security" | "appliance" | "sensor";
  room: string;
  status: "online" | "offline" | "maintenance";
  isOn: boolean;
  properties: {
    brightness?: number;
    color?: string;
    temperature?: number;
    humidity?: number;
    battery?: number;
    energy?: number;
    volume?: number;
    speed?: number;
  };
  lastUpdated: Date;
  automated: boolean;
}

interface Room {
  id: string;
  name: string;
  icon: string;
  temperature: number;
  humidity: number;
  lighting: number;
  devices: string[];
  occupied: boolean;
}

interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  devices: { deviceId: string; settings: any }[];
  triggers: {
    time?: string;
    weather?: string;
    presence?: boolean;
    manual: boolean;
  };
  active: boolean;
}

interface EnergyData {
  timestamp: Date;
  consumption: number;
  production?: number;
  cost: number;
}

interface SecurityEvent {
  id: string;
  type: "motion" | "door" | "window" | "alarm" | "camera";
  location: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
  description: string;
  handled: boolean;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  pressure: number;
  forecast: {
    day: string;
    temp: { min: number; max: number };
    condition: string;
  }[];
}

export default function SmartHome() {
  // Основные состояния
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  const [activeView, setActiveView] = useState<"dashboard" | "devices" | "rooms" | "energy" | "security" | "automation" | "settings">("dashboard");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [securityMode, setSecurityMode] = useState<"home" | "away" | "sleep" | "off">("home");
  
  // Voice control
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  
  // Автоматизация
  const [automationEnabled, setAutomationEnabled] = useState(true);
  
  // Инициализация данных
  useEffect(() => {
    initializeSmartHome();
    loadWeatherData();
    
    // Симуляция обновлений в реальном времени
    const interval = setInterval(() => {
      updateDeviceStates();
      updateEnergyData();
      checkAutomation();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeSmartHome = () => {
    // Инициализация комнат
    const initialRooms: Room[] = [
      {
        id: "living-room",
        name: "Гостиная",
        icon: "🛋️",
        temperature: 22,
        humidity: 45,
        lighting: 75,
        devices: ["light-1", "tv-1", "climate-1"],
        occupied: true
      },
      {
        id: "bedroom",
        name: "Спальня",
        icon: "🛏️",
        temperature: 20,
        humidity: 50,
        lighting: 30,
        devices: ["light-2", "climate-2"],
        occupied: false
      },
      {
        id: "kitchen",
        name: "Кухня",
        icon: "🍳",
        temperature: 24,
        humidity: 55,
        lighting: 90,
        devices: ["light-3", "coffee-1", "fridge-1"],
        occupied: false
      },
      {
        id: "bathroom",
        name: "Ванная",
        icon: "🛁",
        temperature: 23,
        humidity: 70,
        lighting: 50,
        devices: ["light-4", "heater-1"],
        occupied: false
      }
    ];

    // Инициализация устройств
    const initialDevices: Device[] = [
      // Освещение
      {
        id: "light-1",
        name: "Потолочная лампа",
        type: "light",
        room: "living-room",
        status: "online",
        isOn: true,
        properties: { brightness: 75, color: "#FFD700" },
        lastUpdated: new Date(),
        automated: true
      },
      {
        id: "light-2",
        name: "Ночник",
        type: "light",
        room: "bedroom",
        status: "online",
        isOn: false,
        properties: { brightness: 30, color: "#FF6B6B" },
        lastUpdated: new Date(),
        automated: true
      },
      {
        id: "light-3",
        name: "Кухонная подсветка",
        type: "light",
        room: "kitchen",
        status: "online",
        isOn: true,
        properties: { brightness: 90, color: "#FFFFFF" },
        lastUpdated: new Date(),
        automated: false
      },
      {
        id: "light-4",
        name: "Зеркальная подсветка",
        type: "light",
        room: "bathroom",
        status: "online",
        isOn: false,
        properties: { brightness: 50, color: "#87CEEB" },
        lastUpdated: new Date(),
        automated: true
      },
      
      // Климат
      {
        id: "climate-1",
        name: "Кондиционер",
        type: "climate",
        room: "living-room",
        status: "online",
        isOn: true,
        properties: { temperature: 22, humidity: 45 },
        lastUpdated: new Date(),
        automated: true
      },
      {
        id: "climate-2",
        name: "Обогреватель",
        type: "climate",
        room: "bedroom",
        status: "online",
        isOn: false,
        properties: { temperature: 20 },
        lastUpdated: new Date(),
        automated: true
      },
      
      // Бытовая техника
      {
        id: "tv-1",
        name: "Smart TV",
        type: "appliance",
        room: "living-room",
        status: "online",
        isOn: false,
        properties: { volume: 25 },
        lastUpdated: new Date(),
        automated: false
      },
      {
        id: "coffee-1",
        name: "Кофемашина",
        type: "appliance",
        room: "kitchen",
        status: "online",
        isOn: false,
        properties: { temperature: 85 },
        lastUpdated: new Date(),
        automated: true
      },
      {
        id: "fridge-1",
        name: "Холодильник",
        type: "appliance",
        room: "kitchen",
        status: "online",
        isOn: true,
        properties: { temperature: 4, energy: 150 },
        lastUpdated: new Date(),
        automated: false
      },
      
      // Безопасность
      {
        id: "camera-1",
        name: "Входная камера",
        type: "security",
        room: "entrance",
        status: "online",
        isOn: true,
        properties: { battery: 85 },
        lastUpdated: new Date(),
        automated: false
      },
      {
        id: "sensor-1",
        name: "Датчик движения",
        type: "sensor",
        room: "living-room",
        status: "online",
        isOn: true,
        properties: { battery: 78 },
        lastUpdated: new Date(),
        automated: true
      }
    ];

    // Сценарии автоматизации
    const initialScenarios: Scenario[] = [
      {
        id: "morning",
        name: "Доброе утро",
        icon: "🌅",
        description: "Постепенное включение света, запуск кофемашины, включение новостей",
        devices: [
          { deviceId: "light-1", settings: { isOn: true, brightness: 50 } },
          { deviceId: "light-3", settings: { isOn: true, brightness: 80 } },
          { deviceId: "coffee-1", settings: { isOn: true } }
        ],
        triggers: { time: "07:00", manual: true },
        active: true
      },
      {
        id: "evening",
        name: "Вечерний отдых",
        icon: "🌙",
        description: "Приглушенное освещение, комфортная температура, тихая музыка",
        devices: [
          { deviceId: "light-1", settings: { isOn: true, brightness: 30, color: "#FF6B6B" } },
          { deviceId: "light-2", settings: { isOn: true, brightness: 20 } },
          { deviceId: "climate-1", settings: { temperature: 21 } }
        ],
        triggers: { time: "20:00", manual: true },
        active: true
      },
      {
        id: "away",
        name: "Никого дома",
        icon: "🚪",
        description: "Экономия энергии, включение охраны, имитация присутствия",
        devices: [
          { deviceId: "light-1", settings: { isOn: false } },
          { deviceId: "climate-1", settings: { temperature: 18 } },
          { deviceId: "camera-1", settings: { isOn: true } }
        ],
        triggers: { presence: false, manual: true },
        active: true
      },
      {
        id: "party",
        name: "Вечеринка",
        icon: "🎉",
        description: "Яркое цветное освещение, громкая музыка, отключение автоматики",
        devices: [
          { deviceId: "light-1", settings: { isOn: true, brightness: 100, color: "#FF00FF" } },
          { deviceId: "light-3", settings: { isOn: true, brightness: 100, color: "#00FF00" } },
          { deviceId: "tv-1", settings: { isOn: true, volume: 60 } }
        ],
        triggers: { manual: true },
        active: false
      }
    ];

    setRooms(initialRooms);
    setDevices(initialDevices);
    setScenarios(initialScenarios);

    // Загружаем сохраненные данные
    const savedDevices = localStorage.getItem("smart-home-devices");
    const savedEnergy = localStorage.getItem("smart-home-energy");
    const savedSecurity = localStorage.getItem("smart-home-security");

    if (savedDevices) setDevices(JSON.parse(savedDevices));
    if (savedEnergy) setEnergyData(JSON.parse(savedEnergy));
    if (savedSecurity) setSecurityEvents(JSON.parse(savedSecurity));
  };

  const loadWeatherData = () => {
    // Симуляция погодных данных
    const mockWeather: WeatherData = {
      temperature: 18,
      humidity: 62,
      condition: "Облачно",
      windSpeed: 12,
      pressure: 1013,
      forecast: [
        { day: "Сегодня", temp: { min: 15, max: 22 }, condition: "Облачно" },
        { day: "Завтра", temp: { min: 12, max: 18 }, condition: "Дождь" },
        { day: "Послезавтра", temp: { min: 16, max: 24 }, condition: "Солнечно" }
      ]
    };
    setWeather(mockWeather);
  };

  // Обновление состояний устройств
  const updateDeviceStates = () => {
    setDevices(prev => prev.map(device => {
      const updated = { ...device };
      
      // Симуляция изменений
      if (device.type === "sensor") {
        updated.properties.battery = Math.max(0, (device.properties.battery || 100) - 0.1);
      }
      
      if (device.type === "appliance" && device.isOn) {
        updated.properties.energy = (device.properties.energy || 0) + Math.random() * 5;
      }
      
      updated.lastUpdated = new Date();
      return updated;
    }));
  };

  // Обновление данных энергопотребления
  const updateEnergyData = () => {
    const currentHour = new Date().getHours();
    const baseConsumption = currentHour < 6 || currentHour > 22 ? 200 : 400;
    const randomVariation = Math.random() * 100 - 50;
    
    setEnergyData(prev => {
      const newData: EnergyData = {
        timestamp: new Date(),
        consumption: baseConsumption + randomVariation,
        production: Math.random() * 50, // Солнечные панели
        cost: (baseConsumption + randomVariation) * 0.15 // 15 тенге за кВт
      };
      
      return [...prev.slice(-23), newData]; // Храним последние 24 часа
    });
  };

  // Проверка и выполнение автоматизации
  const checkAutomation = () => {
    if (!automationEnabled) return;

    const currentTime = new Date();
    const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    scenarios.forEach(scenario => {
      if (scenario.active && scenario.triggers.time === timeString) {
        executeScenario(scenario.id);
      }
    });
  };

  // Управление устройствами
  const toggleDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, isOn: !device.isOn, lastUpdated: new Date() }
        : device
    ));
  };

  const updateDeviceProperty = (deviceId: string, property: string, value: any) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { 
            ...device, 
            properties: { ...device.properties, [property]: value },
            lastUpdated: new Date()
          }
        : device
    ));
  };

  // Выполнение сценария
  const executeScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    scenario.devices.forEach(({ deviceId, settings }) => {
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { 
              ...device, 
              isOn: settings.isOn !== undefined ? settings.isOn : device.isOn,
              properties: { ...device.properties, ...settings },
              lastUpdated: new Date()
            }
          : device
      ));
    });

    // Добавляем событие в историю
    const event: SecurityEvent = {
      id: Date.now().toString(),
      type: "alarm",
      location: "system",
      timestamp: new Date(),
      severity: "low",
      description: `Выполнен сценарий: ${scenario.name}`,
      handled: true
    };
    setSecurityEvents(prev => [event, ...prev.slice(0, 99)]);
  };

  // Голосовое управление
  const startVoiceControl = () => {
    setIsListening(true);
    
    // Симуляция распознавания речи
    setTimeout(() => {
      const commands = [
        "Включи свет в гостиной",
        "Установи температуру 22 градуса",
        "Запусти сценарий доброе утро",
        "Выключи все устройства",
        "Включи режим охраны"
      ];
      
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setVoiceCommand(randomCommand);
      setLastCommand(randomCommand);
      processVoiceCommand(randomCommand);
      setIsListening(false);
      
      setTimeout(() => setVoiceCommand(""), 3000);
    }, 2000);
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes("включи свет")) {
      const lightDevices = devices.filter(d => d.type === "light");
      lightDevices.forEach(device => toggleDevice(device.id));
    } else if (lowerCommand.includes("температур")) {
      const tempMatch = command.match(/(\d+)/);
      if (tempMatch) {
        const temp = parseInt(tempMatch[1]);
        const climateDevices = devices.filter(d => d.type === "climate");
        climateDevices.forEach(device => {
          updateDeviceProperty(device.id, "temperature", temp);
        });
      }
    } else if (lowerCommand.includes("доброе утро")) {
      executeScenario("morning");
    } else if (lowerCommand.includes("выключи все")) {
      devices.forEach(device => {
        if (device.type !== "security" && device.type !== "sensor") {
          setDevices(prev => prev.map(d => 
            d.id === device.id ? { ...d, isOn: false } : d
          ));
        }
      });
    }
  };

  // Сохранение данных
  useEffect(() => {
    localStorage.setItem("smart-home-devices", JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem("smart-home-energy", JSON.stringify(energyData));
  }, [energyData]);

  useEffect(() => {
    localStorage.setItem("smart-home-security", JSON.stringify(securityEvents));
  }, [securityEvents]);

  // Фильтрация устройств
  const filteredDevices = selectedRoom === "all" 
    ? devices 
    : devices.filter(device => device.room === selectedRoom);

  // Получение статистики
  const getStats = () => {
    const onlineDevices = devices.filter(d => d.status === "online").length;
    const activeDevices = devices.filter(d => d.isOn).length;
    const currentConsumption = energyData[energyData.length - 1]?.consumption || 0;
    const dailyCost = energyData.slice(-24).reduce((sum, data) => sum + data.cost, 0);
    const unhandledAlerts = securityEvents.filter(e => !e.handled && e.severity !== "low").length;

    return {
      onlineDevices,
      totalDevices: devices.length,
      activeDevices,
      currentConsumption: Math.round(currentConsumption),
      dailyCost: Math.round(dailyCost),
      unhandledAlerts
    };
  };

  const stats = getStats();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "light": return "💡";
      case "climate": return "🌡️";
      case "security": return "🔒";
      case "appliance": return "📱";
      case "sensor": return "📡";
      default: return "🔧";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-600";
      case "offline": return "text-red-600";
      case "maintenance": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🏠 Smart Home Control Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Управление умным домом: освещение, климат, безопасность, энергопотребление
              </p>
            </div>
            
            {/* Quick Controls */}
            <div className="mt-4 lg:mt-0 flex flex-wrap gap-2">
              <button
                onClick={startVoiceControl}
                disabled={isListening}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  isListening 
                    ? "bg-red-600 text-white animate-pulse" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isListening ? "🎙️ Слушаю..." : "🎤 Голосовое управление"}
              </button>
              <select
                value={securityMode}
                onChange={(e) => setSecurityMode(e.target.value as any)}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="home">🏠 Дома</option>
                <option value="away">🚪 Ушел</option>
                <option value="sleep">😴 Сон</option>
                <option value="off">⚪ Выкл</option>
              </select>
              <button
                onClick={() => setAutomationEnabled(!automationEnabled)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  automationEnabled 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                🤖 {automationEnabled ? "Автоматика ВКЛ" : "Автоматика ВЫКЛ"}
              </button>
            </div>
          </div>
        </header>

        {/* Voice Command Display */}
        {voiceCommand && (
          <div className="mb-6 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">🎤</span>
              <span className="text-blue-800 dark:text-blue-200 font-medium">Распознано:</span>
              <span className="text-blue-900 dark:text-blue-100">"{voiceCommand}"</span>
            </div>
          </div>
        )}

        {/* Smart Features Info */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">🚀 Возможности умного дома:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span>💡</span>
              <span>Умное освещение</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌡️</span>
              <span>Климат-контроль</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Система безопасности</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Мониторинг энергии</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎤</span>
              <span>Голосовое управление</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🤖</span>
              <span>Автоматизация</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl mb-6 border border-white/20 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: "dashboard", label: "📊 Дашборд", icon: "📊" },
              { id: "devices", label: "🔧 Устройства", icon: "🔧" },
              { id: "rooms", label: "🏠 Комнаты", icon: "🏠" },
              { id: "energy", label: "⚡ Энергия", icon: "⚡" },
              { id: "security", label: "🔒 Безопасность", icon: "🔒" },
              { id: "automation", label: "🤖 Автоматизация", icon: "🤖" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeView === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-700/50"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-700/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Devices View */}
        {activeView === "devices" && (
          <div className="space-y-6">
            {/* Device Filters */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="all">Все комнаты</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.icon} {room.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {["light", "climate", "security", "appliance", "sensor"].map(type => (
                    <button
                      key={type}
                      className="px-3 py-1 text-xs rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    >
                      {getDeviceIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{device.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {rooms.find(r => r.id === device.room)?.name || device.room}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-xs font-medium ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                      <button
                        onClick={() => toggleDevice(device.id)}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          device.isOn 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          device.isOn ? "translate-x-6" : "translate-x-0.5"
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Device Controls */}
                  <div className="space-y-3">
                    {device.type === "light" && (
                      <>
                        {/* Brightness */}
                        <div>
                          <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">
                            Яркость: {device.properties.brightness}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={device.properties.brightness || 50}
                            onChange={(e) => updateDeviceProperty(device.id, "brightness", parseInt(e.target.value))}
                            className="w-full"
                            disabled={!device.isOn}
                          />
                        </div>
                        {/* Color */}
                        <div>
                          <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">Цвет</label>
                          <input
                            type="color"
                            value={device.properties.color || "#FFFFFF"}
                            onChange={(e) => updateDeviceProperty(device.id, "color", e.target.value)}
                            className="w-full h-8 rounded"
                            disabled={!device.isOn}
                          />
                        </div>
                      </>
                    )}

                    {device.type === "climate" && (
                      <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">
                          Температура: {device.properties.temperature}°C
                        </label>
                        <input
                          type="range"
                          min="16"
                          max="30"
                          value={device.properties.temperature || 22}
                          onChange={(e) => updateDeviceProperty(device.id, "temperature", parseInt(e.target.value))}
                          className="w-full"
                          disabled={!device.isOn}
                        />
                      </div>
                    )}

                    {device.type === "appliance" && device.properties.volume !== undefined && (
                      <div>
                        <label className="text-sm text-slate-600 dark:text-slate-400 block mb-1">
                          Громкость: {device.properties.volume}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={device.properties.volume}
                          onChange={(e) => updateDeviceProperty(device.id, "volume", parseInt(e.target.value))}
                          className="w-full"
                          disabled={!device.isOn}
                        />
                      </div>
                    )}

                    {/* Battery Level */}
                    {device.properties.battery !== undefined && (
                      <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700 rounded">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">Батарея</span>
                          <span className={`font-medium ${
                            device.properties.battery > 20 ? "text-green-600" : "text-red-600"
                          }`}>
                            {device.properties.battery}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${
                              device.properties.battery > 20 ? "bg-green-500" : "bg-red-500"
                            }`}
                            style={{ width: `${device.properties.battery}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Automation Toggle */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Автоматизация</span>
                      <button
                        onClick={() => {
                          setDevices(prev => prev.map(d => 
                            d.id === device.id ? { ...d, automated: !d.automated } : d
                          ));
                        }}
                        className={`w-8 h-4 rounded-full transition-colors ${
                          device.automated ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full shadow transform transition-transform ${
                          device.automated ? "translate-x-4" : "translate-x-0.5"
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
                    Обновлено: {new Date(device.lastUpdated).toLocaleTimeString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rooms View */}
        {activeView === "rooms" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const roomDevices = devices.filter(d => d.room === room.id);
                const activeDevices = roomDevices.filter(d => d.isOn).length;
                
                return (
                  <div
                    key={room.id}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{room.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{room.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {activeDevices}/{roomDevices.length} устройств активно
                          </p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${
                        room.occupied ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}></div>
                    </div>

                    {/* Room Environment */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-lg">🌡️</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{room.temperature}°C</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Температура</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-lg">💧</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{room.humidity}%</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Влажность</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-lg">💡</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{room.lighting}%</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Освещение</div>
                      </div>
                    </div>

                    {/* Room Devices */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Устройства:</h4>
                      {roomDevices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                          <div className="flex items-center space-x-2">
                            <span>{getDeviceIcon(device.type)}</span>
                            <span className="text-sm text-slate-900 dark:text-slate-100">{device.name}</span>
                          </div>
                          <button
                            onClick={() => toggleDevice(device.id)}
                            className={`w-8 h-4 rounded-full transition-colors ${
                              device.isOn ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full shadow transform transition-transform ${
                              device.isOn ? "translate-x-4" : "translate-x-0.5"
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            roomDevices.forEach(device => {
                              if (device.type !== "security" && device.type !== "sensor") {
                                setDevices(prev => prev.map(d => 
                                  d.id === device.id ? { ...d, isOn: true } : d
                                ));
                              }
                            });
                          }}
                          className="flex-1 text-xs bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
                        >
                          Все ВКЛ
                        </button>
                        <button
                          onClick={() => {
                            roomDevices.forEach(device => {
                              if (device.type !== "security" && device.type !== "sensor") {
                                setDevices(prev => prev.map(d => 
                                  d.id === device.id ? { ...d, isOn: false } : d
                                ));
                              }
                            });
                          }}
                          className="flex-1 text-xs bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                        >
                          Все ВЫКЛ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Energy View */}
        {activeView === "energy" && (
          <div className="space-y-6">
            {/* Energy Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">⚡ Текущее потребление</h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{stats.currentConsumption}W</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">в реальном времени</p>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">💰 Стоимость сегодня</h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{stats.dailyCost}₸</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">за {energyData.length} часов</p>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">🌱 Производство</h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round((energyData[energyData.length - 1]?.production || 0))}W
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">солнечные панели</p>
                </div>
              </div>
            </div>

            {/* Energy Chart Simulation */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">📈 График потребления (24 часа)</h4>
              <div className="h-64 flex items-end justify-between space-x-1">
                {energyData.slice(-24).map((data, index) => {
                  const height = (data.consumption / 600) * 100; // Нормализация для отображения
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${Math.round(data.consumption)}W в ${new Date(data.timestamp).getHours()}:00`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span>24 часа назад</span>
                <span>Сейчас</span>
              </div>
            </div>

            {/* Device Energy Consumption */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">🔌 Потребление по устройствам</h4>
              <div className="space-y-3">
                {devices
                  .filter(d => d.properties.energy !== undefined)
                  .sort((a, b) => (b.properties.energy || 0) - (a.properties.energy || 0))
                  .map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getDeviceIcon(device.type)}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{device.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {rooms.find(r => r.id === device.room)?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          {Math.round(device.properties.energy || 0)}W
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {((device.properties.energy || 0) * 0.15).toFixed(1)}₸/час
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Security View */}
        {activeView === "security" && (
          <div className="space-y-6">
            {/* Security Status */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">🔒 Система безопасности</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Режим:</span>
                  <select
                    value={securityMode}
                    onChange={(e) => setSecurityMode(e.target.value as any)}
                    className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="home">🏠 Дома</option>
                    <option value="away">🚪 Ушел</option>
                    <option value="sleep">😴 Сон</option>
                    <option value="off">⚪ Выключена</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="text-2xl mb-2">📹</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {devices.filter(d => d.type === "security").length}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Камеры</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="text-2xl mb-2">📡</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {devices.filter(d => d.type === "sensor").length}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Датчики</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className="font-medium text-red-600">{stats.unhandledAlerts}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Активные угрозы</div>
                </div>
              </div>
            </div>

            {/* Security Events */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700">
              <div className="p-6 border-b border-white/20 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">📝 События безопасности</h4>
              </div>
              <div className="p-6">
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔒</div>
                    <p className="text-slate-500 dark:text-slate-400">Нет событий безопасности</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {securityEvents.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">
                            {event.type === "motion" ? "🚶" :
                             event.type === "door" ? "🚪" :
                             event.type === "alarm" ? "🔔" :
                             event.type === "camera" ? "📹" : "⚠️"}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{event.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {event.location} • {new Date(event.timestamp).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity === "high" ? "Высокая" : 
                             event.severity === "medium" ? "Средняя" : "Низкая"}
                          </span>
                          {!event.handled && event.severity !== "low" && (
                            <button
                              onClick={() => {
                                setSecurityEvents(prev => prev.map(e => 
                                  e.id === event.id ? { ...e, handled: true } : e
                                ));
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              Обработать
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Automation View */}
        {activeView === "automation" && (
          <div className="space-y-6">
            {/* Automation Toggle */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">🤖 Система автоматизации</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Умные сценарии и расписания для вашего дома
                  </p>
                </div>
                <button
                  onClick={() => setAutomationEnabled(!automationEnabled)}
                  className={`w-16 h-8 rounded-full transition-colors ${
                    automationEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform ${
                    automationEnabled ? "translate-x-8" : "translate-x-0.5"
                  }`}></div>
                </button>
              </div>
            </div>

            {/* Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{scenario.icon}</span>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{scenario.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{scenario.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setScenarios(prev => prev.map(s => 
                          s.id === scenario.id ? { ...s, active: !s.active } : s
                        ));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        scenario.active ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        scenario.active ? "translate-x-6" : "translate-x-0.5"
                      }`}></div>
                    </button>
                  </div>

                  {/* Triggers */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Триггеры:</h5>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {scenario.triggers.time && (
                        <div className="flex items-center space-x-2">
                          <span>⏰</span>
                          <span>Время: {scenario.triggers.time}</span>
                        </div>
                      )}
                      {scenario.triggers.weather && (
                        <div className="flex items-center space-x-2">
                          <span>🌤️</span>
                          <span>Погода: {scenario.triggers.weather}</span>
                        </div>
                      )}
                      {scenario.triggers.presence !== undefined && (
                        <div className="flex items-center space-x-2">
                          <span>👤</span>
                          <span>Присутствие: {scenario.triggers.presence ? "Дома" : "Вне дома"}</span>
                        </div>
                      )}
                      {scenario.triggers.manual && (
                        <div className="flex items-center space-x-2">
                          <span>👆</span>
                          <span>Ручной запуск</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Affected Devices */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Устройства ({scenario.devices.length}):
                    </h5>
                    <div className="space-y-1">
                      {scenario.devices.slice(0, 3).map(({ deviceId }) => {
                        const device = devices.find(d => d.id === deviceId);
                        return device ? (
                          <div key={deviceId} className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <span>{getDeviceIcon(device.type)}</span>
                            <span>{device.name}</span>
                          </div>
                        ) : null;
                      })}
                      {scenario.devices.length > 3 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          +{scenario.devices.length - 3} еще...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Execute Button */}
                  {scenario.triggers.manual && (
                    <button
                      onClick={() => executeScenario(scenario.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Запустить сценарий
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Устройства онлайн</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.onlineDevices}</p>
                    <p className="text-xs text-green-600">из {stats.totalDevices} всего</p>
                  </div>
                  <div className="text-3xl">🔧</div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Активны сейчас</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.activeDevices}</p>
                    <p className="text-xs text-slate-500">устройств работают</p>
                  </div>
                  <div className="text-3xl">⚡</div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Потребление</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.currentConsumption}W</p>
                    <p className="text-xs text-slate-500">текущая мощность</p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Расходы за день</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.dailyCost}₸</p>
                    <p className="text-xs text-slate-500">стоимость энергии</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>
            </div>

            {/* Weather & Quick Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weather Widget */}
              {weather && (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    🌤️ Погода
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {weather.temperature}°C
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">{weather.condition}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Влажность</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{weather.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Ветер</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{weather.windSpeed} км/ч</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Room Status */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  🏠 Статус комнат
                </h3>
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{room.icon}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{room.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {room.temperature}°C • {room.humidity}% влажность
                          </p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        room.occupied ? "bg-green-500" : "bg-gray-400"
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Scenarios */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  🎬 Быстрые сценарии
                </h3>
                <div className="space-y-3">
                  {scenarios.filter(s => s.triggers.manual).map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => executeScenario(scenario.id)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{scenario.icon}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{scenario.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{scenario.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl border border-white/20 dark:border-slate-700">
              <div className="p-6 border-b border-white/20 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  📝 Последние события
                </h3>
              </div>
              <div className="p-6">
                {securityEvents.slice(0, 5).length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    Нет недавних событий
                  </p>
                ) : (
                  <div className="space-y-3">
                    {securityEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {event.type === "motion" ? "🚶" :
                             event.type === "door" ? "🚪" :
                             event.type === "alarm" ? "🔔" :
                             event.type === "camera" ? "📹" : "⚠️"}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{event.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {event.location} • {new Date(event.timestamp).toLocaleTimeString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tech Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Технологии: IoT Simulation, Real-time Updates, Voice Commands, Complex Automation, Energy Monitoring, Smart Home Protocols
          </p>
        </div>
      </div>
    </div>
  );
}
