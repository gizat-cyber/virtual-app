"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// Типы данных для игрового центра
interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  bestGame: string;
  achievements: string[];
  records: {
    snake: number;
    memory: number;
    game2048: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: string;
}

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "Легко" | "Средне" | "Сложно";
  bestScore: number;
  played: number;
}

// Компонент игры Змейка
const SnakeGame = ({ onScoreUpdate, onGameEnd }: { onScoreUpdate: (score: number) => void; onGameEnd: (score: number) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'paused' | 'gameOver'>('waiting');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<number | undefined>(undefined);

  // Состояние игры
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameSpeed, setGameSpeed] = useState(150);

  const BOARD_SIZE = 20;

  // Генерация еды
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
    setFood(newFood);
  }, []);

  // Управление клавишами
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    switch (event.key) {
      case 'ArrowUp':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      case ' ':
        event.preventDefault();
        setGameState(gameState === 'playing' ? 'paused' : 'playing');
        break;
    }
  }, [direction, gameState]);

  // Игровой цикл
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Проверка столкновений со стенами
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameState('gameOver');
        onGameEnd(score);
        return currentSnake;
      }

      // Проверка столкновений с собой
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        onGameEnd(score);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Проверка еды
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreUpdate(newScore);
        generateFood();
        
        // Увеличение скорости
        if (newScore % 50 === 0) {
          setGameSpeed(prev => Math.max(80, prev - 10));
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, score, gameState, onScoreUpdate, onGameEnd, generateFood]);

  // Отрисовка игры
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка канваса
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 20, 0);
      ctx.lineTo(i * 20, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * 20);
      ctx.lineTo(canvas.width, i * 20);
      ctx.stroke();
    }

    // Змейка
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#10b981' : '#34d399';
      ctx.fillRect(segment.x * 20 + 1, segment.y * 20 + 1, 18, 18);
      
      if (index === 0) {
        // Глаза змейки
        ctx.fillStyle = '#fff';
        ctx.fillRect(segment.x * 20 + 6, segment.y * 20 + 6, 3, 3);
        ctx.fillRect(segment.x * 20 + 11, segment.y * 20 + 6, 3, 3);
      }
    });

    // Еда
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * 20 + 2, food.y * 20 + 2, 16, 16);
    
    // Блеск еды
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(food.x * 20 + 4, food.y * 20 + 4, 4, 4);
  }, [snake, food]);

  // Эффекты
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = window.setInterval(gameLoop, gameSpeed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameSpeed, gameState]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('snake-highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-highscore', score.toString());
    }
  }, [score, highScore]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameSpeed(150);
    generateFood();
    setGameState('playing');
  };

  const resetGame = () => {
    setGameState('waiting');
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameSpeed(150);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex justify-between items-center w-full max-w-md">
        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Счет: </span>
          <span className="font-bold text-green-600">{score}</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Рекорд: </span>
          <span className="font-bold text-amber-600">{highScore}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-800"
        />
        
        {gameState === 'waiting' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <div className="text-2xl mb-4">🐍</div>
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Начать игру
              </button>
            </div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <div className="text-2xl mb-4">⏸️</div>
              <p className="text-lg">Пауза</p>
              <p className="text-sm text-slate-300 mt-2">Нажмите пробел для продолжения</p>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <div className="text-2xl mb-4">💀</div>
              <p className="text-xl mb-2">Игра окончена!</p>
              <p className="text-lg mb-4">Счет: <span className="font-bold text-green-400">{score}</span></p>
              <div className="space-x-3">
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Еще раз
                </button>
                <button
                  onClick={resetGame}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  В меню
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-slate-600 dark:text-slate-400 max-w-md">
        <p className="mb-1">🎮 <strong>Управление:</strong> стрелки для движения</p>
        <p>⏸️ <strong>Пауза:</strong> пробел</p>
      </div>
    </div>
  );
};

// Компонент игры Memory
const MemoryGame = ({ onScoreUpdate, onGameEnd }: { onScoreUpdate: (score: number) => void; onGameEnd: (score: number) => void }) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed'>('waiting');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
  const TOTAL_PAIRS = 8;

  const initializeGame = useCallback(() => {
    const gameEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(gameEmojis);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setGameState('playing');
  }, []);

  const handleCardClick = useCallback((cardId: number) => {
    if (gameState !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Совпадение найдено
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(prev => {
            const newMatches = prev + 1;
            const score = Math.max(0, 1000 - moves * 10 - timeElapsed * 2);
            onScoreUpdate(score);
            
            if (newMatches === TOTAL_PAIRS) {
              setGameState('completed');
              onGameEnd(score);
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // Совпадения нет
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [cards, flippedCards, gameState, moves, timeElapsed, onScoreUpdate, onGameEnd]);

  // Таймер
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex justify-between items-center w-full max-w-lg">
        <div className="text-sm space-y-1">
          <div>
            <span className="text-slate-600 dark:text-slate-400">Ходы: </span>
            <span className="font-bold text-blue-600">{moves}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Пары: </span>
            <span className="font-bold text-green-600">{matches}/{TOTAL_PAIRS}</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Время: </span>
          <span className="font-bold text-purple-600">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {gameState === 'waiting' ? (
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-bold mb-4">Memory Game</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Найдите все пары карточек за минимальное количество ходов!
          </p>
          <button
            onClick={initializeGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Начать игру
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 max-w-lg">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  w-16 h-16 rounded-lg flex items-center justify-center text-2xl cursor-pointer
                  transition-all duration-300 transform hover:scale-105
                  ${card.isFlipped || card.isMatched
                    ? 'bg-white dark:bg-slate-700 shadow-lg' 
                    : 'bg-blue-500 hover:bg-blue-600 shadow-md'
                  }
                  ${card.isMatched ? 'ring-2 ring-green-400' : ''}
                `}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '❓'}
              </div>
            ))}
          </div>

          {gameState === 'completed' && (
            <div className="text-center bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                Поздравляем!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Игра завершена за {moves} ходов и {formatTime(timeElapsed)}
              </p>
              <button
                onClick={initializeGame}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Играть снова
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Компонент игры 2048
const Game2048 = ({ onScoreUpdate, onGameEnd }: { onScoreUpdate: (score: number) => void; onGameEnd: (score: number) => void }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver' | 'won'>('waiting');
  const [bestScore, setBestScore] = useState(0);

  const BOARD_SIZE = 4;

  // Инициализация пустой доски
  const createEmptyBoard = useCallback(() => {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
  }, []);

  // Добавление новой плитки
  const addRandomTile = useCallback((currentBoard: number[][]) => {
    const emptyCells: {row: number, col: number}[] = [];
    
    currentBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 0) {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newBoard = currentBoard.map(row => [...row]);
      newBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
      return newBoard;
    }
    
    return currentBoard;
  }, []);

  // Инициализация игры
  const initializeGame = useCallback(() => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    
    setBoard(newBoard);
    setScore(0);
    setGameState('playing');
  }, [createEmptyBoard, addRandomTile]);

  // Движение влево
  const moveLeft = useCallback((currentBoard: number[][]) => {
    let newBoard = currentBoard.map(row => [...row]);
    let scoreIncrease = 0;
    let moved = false;

    for (let row = 0; row < BOARD_SIZE; row++) {
      // Убираем пустые ячейки
      let rowArray = newBoard[row].filter(cell => cell !== 0);
      
      // Объединяем одинаковые плитки
      for (let col = 0; col < rowArray.length - 1; col++) {
        if (rowArray[col] === rowArray[col + 1]) {
          rowArray[col] *= 2;
          scoreIncrease += rowArray[col];
          rowArray[col + 1] = 0;
        }
      }
      
      // Снова убираем пустые ячейки после объединения
      rowArray = rowArray.filter(cell => cell !== 0);
      
      // Дополняем нулями справа
      while (rowArray.length < BOARD_SIZE) {
        rowArray.push(0);
      }
      
      // Проверяем, изменилась ли строка
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (newBoard[row][col] !== rowArray[col]) {
          moved = true;
        }
      }
      
      newBoard[row] = rowArray;
    }

    return { board: newBoard, score: scoreIncrease, moved };
  }, []);

  // Поворот доски на 90 градусов по часовой стрелке
  const rotateBoard = useCallback((currentBoard: number[][]) => {
    const newBoard = createEmptyBoard();
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        newBoard[col][BOARD_SIZE - 1 - row] = currentBoard[row][col];
      }
    }
    return newBoard;
  }, [createEmptyBoard]);

  // Универсальная функция движения
  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameState !== 'playing') return;

    let currentBoard = board.map(row => [...row]);
    
    // Поворачиваем доску для других направлений
    for (let i = 0; i < { left: 0, up: 1, right: 2, down: 3 }[direction]; i++) {
      currentBoard = rotateBoard(currentBoard);
    }
    
    const { board: movedBoard, score: scoreIncrease, moved } = moveLeft(currentBoard);
    
    if (!moved) return;
    
    // Поворачиваем обратно
    let finalBoard = movedBoard;
    for (let i = 0; i < { left: 0, up: 3, right: 2, down: 1 }[direction]; i++) {
      finalBoard = rotateBoard(finalBoard);
    }
    
    // Добавляем новую плитку
    finalBoard = addRandomTile(finalBoard);
    
    const newScore = score + scoreIncrease;
    setBoard(finalBoard);
    setScore(newScore);
    onScoreUpdate(newScore);
    
    // Проверяем победу (2048)
    const hasWon = finalBoard.some(row => row.some(cell => cell === 2048));
    if (hasWon && gameState === 'playing') {
      setGameState('won');
    }
    
    // Проверяем поражение
    const isEmpty = finalBoard.some(row => row.some(cell => cell === 0));
    if (!isEmpty && !canMove(finalBoard)) {
      setGameState('gameOver');
      onGameEnd(newScore);
    }
  }, [board, gameState, score, moveLeft, rotateBoard, addRandomTile, onScoreUpdate, onGameEnd]);

  // Проверка возможности хода
  const canMove = useCallback((currentBoard: number[][]) => {
    // Проверяем все направления
    for (const direction of ['left', 'right', 'up', 'down'] as const) {
      let testBoard = currentBoard.map(row => [...row]);
      
      for (let i = 0; i < { left: 0, up: 1, right: 2, down: 3 }[direction]; i++) {
        testBoard = rotateBoard(testBoard);
      }
      
      const { moved } = moveLeft(testBoard);
      if (moved) return true;
    }
    return false;
  }, [moveLeft, rotateBoard]);

  // Обработка клавиш
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        move('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        move('right');
        break;
      case 'ArrowUp':
        event.preventDefault();
        move('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        move('down');
        break;
    }
  }, [move]);

  // Эффекты
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const savedBestScore = localStorage.getItem('2048-bestscore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-bestscore', score.toString());
    }
  }, [score, bestScore]);

  // Получение цвета плитки
  const getTileColor = (value: number) => {
    const colors: {[key: number]: string} = {
      2: 'bg-slate-100 text-slate-800',
      4: 'bg-slate-200 text-slate-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-orange-600 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-red-500 text-white',
      2048: 'bg-red-600 text-white'
    };
    return colors[value] || 'bg-purple-600 text-white';
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex justify-between items-center w-full max-w-sm">
        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Счет: </span>
          <span className="font-bold text-blue-600">{score}</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Лучший: </span>
          <span className="font-bold text-amber-600">{bestScore}</span>
        </div>
      </div>

      {gameState === 'waiting' ? (
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-4">2048</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Объединяйте плитки, чтобы достичь 2048!
          </p>
          <button
            onClick={initializeGame}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Начать игру
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 p-4 bg-slate-300 dark:bg-slate-700 rounded-lg">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-16 h-16 rounded flex items-center justify-center font-bold text-lg
                    transition-all duration-150
                    ${cell === 0 
                      ? 'bg-slate-200 dark:bg-slate-600' 
                      : getTileColor(cell)
                    }
                  `}
                >
                  {cell !== 0 && cell}
                </div>
              ))
            )}
          </div>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>🎮 <strong>Управление:</strong> стрелки для движения</p>
          </div>

          {/* Кнопки для мобильных */}
          <div className="grid grid-cols-3 gap-2 max-w-48 md:hidden">
            <div></div>
            <button 
              onClick={() => move('up')}
              className="bg-slate-600 hover:bg-slate-700 text-white p-3 rounded"
            >
              ⬆️
            </button>
            <div></div>
            <button 
              onClick={() => move('left')}
              className="bg-slate-600 hover:bg-slate-700 text-white p-3 rounded"
            >
              ⬅️
            </button>
            <button
              onClick={initializeGame}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs"
            >
              🔄
            </button>
            <button 
              onClick={() => move('right')}
              className="bg-slate-600 hover:bg-slate-700 text-white p-3 rounded"
            >
              ➡️
            </button>
            <div></div>
            <button 
              onClick={() => move('down')}
              className="bg-slate-600 hover:bg-slate-700 text-white p-3 rounded"
            >
              ⬇️
            </button>
            <div></div>
          </div>

          {gameState === 'won' && (
            <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">
                Победа!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Вы достигли 2048! Счет: {score}
              </p>
              <button
                onClick={() => setGameState('playing')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium mr-3"
              >
                Продолжить
              </button>
              <button
                onClick={initializeGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Новая игра
              </button>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
              <div className="text-4xl mb-4">💀</div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                Игра окончена!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Итоговый счет: {score}
              </p>
              <button
                onClick={initializeGame}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Основной компонент игрового центра
export default function GamesHub() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesPlayed: 0,
    totalScore: 0,
    bestGame: '',
    achievements: [],
    records: {
      snake: 0,
      memory: 0,
      game2048: 0
    }
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first_game',
      title: 'Первые шаги',
      description: 'Сыграть первую игру',
      icon: '🎮',
      unlocked: false,
      condition: 'gamesPlayed >= 1'
    },
    {
      id: 'snake_master',
      title: 'Змеиный мастер',
      description: 'Набрать 100+ очков в Змейке',
      icon: '🐍',
      unlocked: false,
      condition: 'snake >= 100'
    },
    {
      id: 'memory_champion',
      title: 'Чемпион памяти',
      description: 'Завершить Memory Game за 20 ходов',
      icon: '🧠',
      unlocked: false,
      condition: 'memory >= 800'
    },
    {
      id: 'puzzle_solver',
      title: 'Мастер головоломок',
      description: 'Достичь 2048 в одноименной игре',
      icon: '🎯',
      unlocked: false,
      condition: 'game2048 >= 1000'
    },
    {
      id: 'perfect_score',
      title: 'Идеальный результат',
      description: 'Набрать 1000+ очков в любой игре',
      icon: '⭐',
      unlocked: false,
      condition: 'totalScore >= 1000'
    }
  ]);

  const games: Game[] = [
    {
      id: 'snake',
      title: 'Змейка',
      description: 'Классическая игра: управляйте змейкой, собирайте еду и не врезайтесь в стены!',
      icon: '🐍',
      difficulty: 'Средне',
      bestScore: gameStats.records.snake,
      played: 0
    },
    {
      id: 'memory',
      title: 'Memory Game',
      description: 'Тренировка памяти: найдите все пары карточек за минимальное количество ходов.',
      icon: '🧠',
      difficulty: 'Легко',
      bestScore: gameStats.records.memory,
      played: 0
    },
    {
      id: '2048',
      title: '2048',
      description: 'Головоломка с числами: объединяйте плитки, чтобы достичь заветной 2048!',
      icon: '🎯',
      difficulty: 'Сложно',
      bestScore: gameStats.records.game2048,
      played: 0
    }
  ];

  // Загрузка статистики из localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('games-hub-stats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  // Сохранение статистики в localStorage
  useEffect(() => {
    localStorage.setItem('games-hub-stats', JSON.stringify(gameStats));
  }, [gameStats]);

  const handleScoreUpdate = useCallback((gameId: string, score: number) => {
    setGameStats(prev => ({
      ...prev,
      totalScore: prev.totalScore + score,
      records: {
        ...prev.records,
        [gameId]: Math.max(prev.records[gameId as keyof typeof prev.records], score)
      }
    }));
  }, []);

  const handleGameEnd = useCallback((gameId: string, score: number) => {
    setGameStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      bestGame: score > (prev.records[gameId as keyof typeof prev.records] || 0) ? gameId : prev.bestGame,
      records: {
        ...prev.records,
        [gameId]: Math.max(prev.records[gameId as keyof typeof prev.records], score)
      }
    }));
  }, []);

  const renderCurrentGame = () => {
    switch (currentGame) {
      case 'snake':
        return (
          <SnakeGame
            onScoreUpdate={(score) => handleScoreUpdate('snake', score)}
            onGameEnd={(score) => handleGameEnd('snake', score)}
          />
        );
      case 'memory':
        return (
          <MemoryGame
            onScoreUpdate={(score) => handleScoreUpdate('memory', score)}
            onGameEnd={(score) => handleGameEnd('memory', score)}
          />
        );
      case '2048':
        return (
          <Game2048
            onScoreUpdate={(score) => handleScoreUpdate('game2048', score)}
            onGameEnd={(score) => handleGameEnd('game2048', score)}
          />
        );
      default:
        return null;
    }
  };

  if (currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header с кнопкой назад */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentGame(null)}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <span>←</span>
              <span>Назад к играм</span>
            </button>
            
            <Link 
              href="/"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              🏠 На главную
            </Link>
          </div>

          {/* Игра */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            {renderCurrentGame()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🎮 Игровой центр
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Коллекция классических мини-игр с современным дизайном
            </p>
          </div>
          
          <Link 
            href="/"
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            ← На главную
          </Link>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{gameStats.gamesPlayed}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Игр сыграно</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{gameStats.totalScore}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Общий счет</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{gameStats.bestGame || '—'}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Лучшая игра</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{gameStats.achievements.length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Достижения</div>
          </div>
        </div>

        {/* Игры */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{game.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {game.title}
                  </h3>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 text-center">
                  {game.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Сложность:</span>
                    <span className={`font-medium ${
                      game.difficulty === 'Легко' ? 'text-green-600' :
                      game.difficulty === 'Средне' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {game.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Лучший результат:</span>
                    <span className="font-medium text-blue-600">{game.bestScore}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentGame(game.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Играть
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Достижения */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            🏆 Достижения
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            🎮 Наслаждайтесь классическими играми в современном исполнении!
          </p>
        </footer>
      </div>
    </div>
  );
}
