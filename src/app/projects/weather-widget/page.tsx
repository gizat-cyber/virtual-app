"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDemo, setUseDemo] = useState(false);

  const demoWeatherData: WeatherData = {
    temperature: 22,
    condition: "Солнечно",
    location: "Алматы, Казахстан",
    humidity: 45,
    windSpeed: 12,
    icon: "☀️"
  };

  const getLocationAndWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Геолокация не поддерживается вашим браузером");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      
      // В реальном приложении здесь был бы запрос к API погоды
      // Например: OpenWeatherMap, WeatherAPI и т.д.
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ru`);
      
      // Для демонстрации MVP используем заглушку
      setTimeout(() => {
        const mockWeatherData: WeatherData = {
          temperature: Math.round(Math.random() * 30 + 5), // 5-35°C
          condition: ["Солнечно", "Облачно", "Дождь", "Снег", "Туман"][Math.floor(Math.random() * 5)],
          location: `Широта: ${latitude.toFixed(2)}, Долгота: ${longitude.toFixed(2)}`,
          humidity: Math.round(Math.random() * 50 + 30), // 30-80%
          windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 км/ч
          icon: ["☀️", "⛅", "🌧️", "❄️", "🌫️"][Math.floor(Math.random() * 5)]
        };
        
        setWeather(mockWeatherData);
        setLoading(false);
      }, 1500);

    } catch (error: any) {
      setError(error.message || "Не удалось получить данные о погоде");
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setUseDemo(true);
    setWeather(demoWeatherData);
    setError(null);
  };

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      "Солнечно": "☀️",
      "Облачно": "⛅",
      "Дождь": "🌧️",
      "Снег": "❄️",
      "Туман": "🌫️"
    };
    return icons[condition] || "🌤️";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-slate-800 dark:via-slate-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <header className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4"
          >
            ← Назад к проектам
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Виджет Погоды MVP
          </h1>
          <p className="text-blue-100">
            Получение данных о погоде с использованием геолокации
          </p>
        </header>

        {/* MVP Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/20">
          <h3 className="font-medium text-white mb-2">MVP функция:</h3>
          <p className="text-sm text-blue-100">
            Показ текущей температуры и условий погоды на основе местоположения пользователя
          </p>
        </div>

        {/* Weather Widget */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
          {!weather && !loading && (
            <div className="text-center">
              <div className="text-6xl mb-4">🌤️</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Получить данные о погоде
              </h3>
              <p className="text-blue-100 mb-6 text-sm">
                Разрешите доступ к геолокации для получения актуальной информации о погоде
              </p>
              <div className="space-y-3">
                <button
                  onClick={getLocationAndWeather}
                  className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
                >
                  Определить местоположение
                </button>
                <button
                  onClick={loadDemoData}
                  className="w-full bg-blue-500/50 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-500/70 transition-colors duration-200"
                >
                  Показать демо данные
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-4">🌪️</div>
              <p className="text-white">Получение данных о погоде...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-red-200 mb-4">{error}</p>
              <button
                onClick={loadDemoData}
                className="bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
              >
                Показать демо данные
              </button>
            </div>
          )}

          {weather && (
            <div className="text-center">
              {useDemo && (
                <div className="bg-yellow-500/20 text-yellow-100 text-xs px-3 py-1 rounded-full mb-4 inline-block">
                  Демо режим
                </div>
              )}
              
              <div className="text-6xl mb-4">{weather.icon}</div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {weather.temperature}°C
              </h2>
              
              <p className="text-xl text-blue-100 mb-4">
                {weather.condition}
              </p>
              
              <p className="text-sm text-blue-200 mb-6">
                📍 {weather.location}
              </p>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-xs text-blue-200">Влажность</div>
                  <div className="text-lg font-semibold text-white">{weather.humidity}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl mb-1">💨</div>
                  <div className="text-xs text-blue-200">Ветер</div>
                  <div className="text-lg font-semibold text-white">{weather.windSpeed} км/ч</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setWeather(null);
                  setUseDemo(false);
                  setError(null);
                }}
                className="w-full bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-colors duration-200"
              >
                Обновить данные
              </button>
            </div>
          )}
        </div>

        {/* Tech Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-blue-200">
            Технологии: Geolocation API, React Hooks, TypeScript, Tailwind CSS
          </p>
          <p className="text-xs text-blue-300 mt-1">
            * В production версии используется реальный API погоды
          </p>
        </div>
      </div>
    </div>
  );
}
