import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  mvpFunction: string;
  tags: string[];
  status: "В разработке" | "MVP готов" | "Завершен";
}

const projects: Project[] = [
  {
    id: "todo-app",
    title: "Todo App",
    description: "Простое приложение для управления задачами с возможностью добавления, редактирования и удаления задач.",
    mvpFunction: "Создание и отметка выполнения задач",
    tags: ["React", "Local Storage", "CRUD"],
    status: "MVP готов"
  },
  {
    id: "weather-widget",
    title: "Виджет погоды",
    description: "Виджет для отображения текущей погоды с геолокацией пользователя.",
    mvpFunction: "Показ текущей температуры и условий погоды",
    tags: ["API", "Геолокация", "Real-time"],
    status: "В разработке"
  },
  {
    id: "calculator",
    title: "Калькулятор",
    description: "Веб-калькулятор с базовыми математическими операциями и красивым интерфейсом.",
    mvpFunction: "Выполнение базовых математических операций",
    tags: ["JavaScript", "UI/UX", "Math"],
    status: "MVP готов"
  },
  {
    id: "color-palette",
    title: "Генератор палитр",
    description: "Инструмент для создания цветовых палитр с возможностью экспорта в различные форматы.",
    mvpFunction: "Генерация и копирование цветовых кодов",
    tags: ["Design", "Color Theory", "Export"],
    status: "В разработке"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Портфолио MVP Проектов
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Коллекция минимально жизнеспособных продуктов, созданных для изучения и демонстрации различных технологий
          </p>
        </header>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "MVP готов"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : project.status === "В разработке"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Project Info */}
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {project.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

                {/* MVP Function */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    MVP функция:
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                    {project.mvpFunction}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <Link
                  href={`/projects/${project.id}`}
                  className="block w-full text-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2 px-4 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors duration-200"
                >
                  Открыть проект
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            Каждый проект представляет собой отдельную страницу с полностью функциональным MVP
          </p>
        </footer>
      </div>
    </div>
  );
}
