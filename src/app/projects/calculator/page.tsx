"use client";

import { useState } from "react";
import Link from "next/link";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEqual = () => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const Button = ({ 
    onClick, 
    className = "", 
    children 
  }: { 
    onClick: () => void; 
    className?: string; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`h-16 rounded-lg font-semibold text-lg transition-all duration-150 hover:scale-105 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
          >
            ← Назад к проектам
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Калькулятор MVP
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Простой калькулятор с базовыми математическими операциями
          </p>
        </header>

        {/* MVP Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">MVP функция:</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Выполнение базовых математических операций: сложение, вычитание, умножение, деление
          </p>
        </div>

        {/* Calculator */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
          {/* Display */}
          <div className="mb-4">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-right">
              <div className="text-3xl font-mono text-slate-900 dark:text-slate-100 break-all">
                {display}
              </div>
              {operation && previousValue !== null && (
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {previousValue} {operation}
                </div>
              )}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <Button
              onClick={clear}
              className="col-span-2 bg-red-500 hover:bg-red-600 text-white"
            >
              Clear
            </Button>
            <Button
              onClick={() => performOperation("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ÷
            </Button>
            <Button
              onClick={() => performOperation("*")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ×
            </Button>

            {/* Row 2 */}
            <Button
              onClick={() => inputNumber("7")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              7
            </Button>
            <Button
              onClick={() => inputNumber("8")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              8
            </Button>
            <Button
              onClick={() => inputNumber("9")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              9
            </Button>
            <Button
              onClick={() => performOperation("-")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              −
            </Button>

            {/* Row 3 */}
            <Button
              onClick={() => inputNumber("4")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              4
            </Button>
            <Button
              onClick={() => inputNumber("5")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              5
            </Button>
            <Button
              onClick={() => inputNumber("6")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              6
            </Button>
            <Button
              onClick={() => performOperation("+")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              +
            </Button>

            {/* Row 4 */}
            <Button
              onClick={() => inputNumber("1")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              1
            </Button>
            <Button
              onClick={() => inputNumber("2")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              2
            </Button>
            <Button
              onClick={() => inputNumber("3")}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              3
            </Button>
            <Button
              onClick={handleEqual}
              className="row-span-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              =
            </Button>

            {/* Row 5 */}
            <Button
              onClick={() => inputNumber("0")}
              className="col-span-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              0
            </Button>
            <Button
              onClick={inputDecimal}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-slate-100"
            >
              .
            </Button>
          </div>
        </div>

        {/* Tech Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Технологии: React State Management, TypeScript, Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
