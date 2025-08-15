"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
}

export default function ColorPalette() {
  const [colors, setColors] = useState<Color[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const generateRandomColor = (): string => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  const generatePalette = useCallback(() => {
    const newColors: Color[] = [];
    for (let i = 0; i < 5; i++) {
      const hex = generateRandomColor();
      newColors.push({
        hex,
        rgb: hexToRgb(hex),
        hsl: hexToHsl(hex)
      });
    }
    setColors(newColors);
  }, []);

  const generateHarmoniousPalette = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.random() * 20; // 70-90%
    const baseLightness = 50 + Math.random() * 20; // 50-70%

    const hues = [
      baseHue,
      (baseHue + 30) % 360,  // Аналогичный
      (baseHue + 60) % 360,  // Триадный
      (baseHue + 180) % 360, // Комплементарный
      (baseHue + 210) % 360  // Сплит-комплементарный
    ];

    const newColors: Color[] = hues.map((hue, index) => {
      const lightness = baseLightness + (index - 2) * 10; // Варьируем яркость
      const hslString = `hsl(${hue}, ${saturation}%, ${Math.max(20, Math.min(80, lightness))}%)`;
      
      // Конвертируем HSL в HEX
      const h = hue / 360;
      const s = saturation / 100;
      const l = Math.max(20, Math.min(80, lightness)) / 100;

      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;

      let r, g, b;
      if (h < 1/6) { r = c; g = x; b = 0; }
      else if (h < 2/6) { r = x; g = c; b = 0; }
      else if (h < 3/6) { r = 0; g = c; b = x; }
      else if (h < 4/6) { r = 0; g = x; b = c; }
      else if (h < 5/6) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

      return {
        hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: hslString
      };
    });

    setColors(newColors);
  };

  const copyToClipboard = async (text: string, colorHex: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(colorHex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Не удалось скопировать: ', err);
    }
  };

  const exportPalette = () => {
    const paletteData = {
      colors: colors,
      generated: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'color-palette.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
          >
            ← Назад к проектам
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Генератор Палитр MVP
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Создание цветовых палитр с возможностью копирования кодов
          </p>
        </header>

        {/* MVP Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">MVP функция:</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Генерация цветовых палитр и копирование цветовых кодов в различных форматах (HEX, RGB, HSL)
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={generatePalette}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              🎲 Случайная палитра
            </button>
            <button
              onClick={generateHarmoniousPalette}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors duration-200"
            >
              🎨 Гармоничная палитра
            </button>
            {colors.length > 0 && (
              <button
                onClick={exportPalette}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
              >
                💾 Экспорт JSON
              </button>
            )}
          </div>
        </div>

        {/* Color Palette */}
        {colors.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Создайте свою первую палитру
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Нажмите на одну из кнопок выше, чтобы сгенерировать цветовую палитру
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {colors.map((color, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700"
              >
                {/* Color Preview */}
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: color.hex }}
                ></div>
                
                {/* Color Info */}
                <div className="p-4">
                  <div className="space-y-2">
                    {/* HEX */}
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">HEX</div>
                      <button
                        onClick={() => copyToClipboard(color.hex, color.hex)}
                        className="w-full text-left font-mono text-sm bg-slate-100 dark:bg-slate-700 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {color.hex}
                        {copiedColor === color.hex && (
                          <span className="float-right text-green-600">✓</span>
                        )}
                      </button>
                    </div>

                    {/* RGB */}
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">RGB</div>
                      <button
                        onClick={() => copyToClipboard(color.rgb, color.hex)}
                        className="w-full text-left font-mono text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {color.rgb}
                      </button>
                    </div>

                    {/* HSL */}
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">HSL</div>
                      <button
                        onClick={() => copyToClipboard(color.hsl, color.hex)}
                        className="w-full text-left font-mono text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {color.hsl}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {colors.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Нажмите на любой цветовой код, чтобы скопировать его в буфер обмена
            </p>
          </div>
        )}

        {/* Tech Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Технологии: Color Theory, Clipboard API, File Download, TypeScript, Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
