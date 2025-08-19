"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

// Типы данных для приложения доставки еды
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  preparationTime: number;
  isVegetarian: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  allergies: string[];
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  categories: string[];
  menu: MenuItem[];
  reviews: Review[];
  location: string;
  phone: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  restaurantId: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  orderItems: string[];
}

interface Order {
  id: string;
  restaurantId: string;
  items: CartItem[];
  total: number;
  status: 'preparing' | 'ready' | 'delivering' | 'delivered';
  orderTime: Date;
  estimatedDelivery: Date;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  deliveryInstructions?: string;
}

// Данные ресторанов и меню
const restaurantsData: Restaurant[] = [
  {
    id: "burger-palace",
    name: "🍔 Burger Palace",
    description: "Лучшие бургеры в городе с сочной говядиной и свежими овощами",
    image: "🍔",
    cuisine: "Американская",
    rating: 4.8,
    deliveryTime: "25-35 мин",
    deliveryFee: 150,
    minimumOrder: 500,
    isOpen: true,
    location: "ул. Центральная, 123",
    phone: "+7 (999) 123-45-67",
    categories: ["Бургеры", "Закуски", "Напитки", "Десерты"],
    menu: [
      {
        id: "classic-burger",
        name: "Классический бургер",
        description: "Сочная говяжья котлета, салат, помидор, лук, сыр чеддер",
        price: 390,
        image: "🍔",
        category: "Бургеры",
        rating: 4.9,
        preparationTime: 15,
        isVegetarian: false,
        isSpicy: false,
        isPopular: true,
        allergies: ["глютен", "молоко"]
      },
      {
        id: "cheese-burger",
        name: "Чизбургер Делюкс",
        description: "Двойная котлета, двойной сыр, бекон, специальный соус",
        price: 520,
        image: "🧀",
        category: "Бургеры",
        rating: 4.7,
        preparationTime: 18,
        isVegetarian: false,
        isSpicy: false,
        isPopular: true,
        allergies: ["глютен", "молоко"]
      },
      {
        id: "veggie-burger",
        name: "Вегги бургер",
        description: "Котлета из нута и овощей, авокадо, салат, веганский соус",
        price: 350,
        image: "🥬",
        category: "Бургеры",
        rating: 4.5,
        preparationTime: 12,
        isVegetarian: true,
        isSpicy: false,
        isPopular: false,
        allergies: ["глютен"]
      },
      {
        id: "fries",
        name: "Картофель фри",
        description: "Хрустящий картофель с морской солью",
        price: 180,
        image: "🍟",
        category: "Закуски",
        rating: 4.6,
        preparationTime: 8,
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        allergies: []
      },
      {
        id: "onion-rings",
        name: "Луковые кольца",
        description: "Хрустящие кольца лука в панировке",
        price: 220,
        image: "🧅",
        category: "Закуски",
        rating: 4.4,
        preparationTime: 10,
        isVegetarian: true,
        isSpicy: false,
        isPopular: false,
        allergies: ["глютен"]
      },
      {
        id: "cola",
        name: "Кола",
        description: "Освежающий газированный напиток",
        price: 120,
        image: "🥤",
        category: "Напитки",
        rating: 4.2,
        preparationTime: 2,
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        allergies: []
      },
      {
        id: "milkshake",
        name: "Молочный коктейль",
        description: "Ванильный коктейль с взбитыми сливками",
        price: 250,
        image: "🥛",
        category: "Напитки",
        rating: 4.8,
        preparationTime: 5,
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        allergies: ["молоко"]
      }
    ],
    reviews: [
      {
        id: "rev1",
        userName: "Алексей К.",
        rating: 5,
        comment: "Отличные бургеры! Быстрая доставка, все горячее.",
        date: "2024-01-15",
        orderItems: ["Классический бургер", "Картофель фри"]
      },
      {
        id: "rev2",
        userName: "Мария П.",
        rating: 4,
        comment: "Вкусно, но цена немного высоковата.",
        date: "2024-01-10",
        orderItems: ["Чизбургер Делюкс"]
      }
    ]
  },
  {
    id: "pizza-express",
    name: "🍕 Pizza Express",
    description: "Итальянская пицца на тонком тесте с доставкой за 20 минут",
    image: "🍕",
    cuisine: "Итальянская",
    rating: 4.6,
    deliveryTime: "20-30 мин",
    deliveryFee: 200,
    minimumOrder: 600,
    isOpen: true,
    location: "пр. Победы, 45",
    phone: "+7 (999) 234-56-78",
    categories: ["Пицца", "Паста", "Салаты", "Напитки"],
    menu: [
      {
        id: "margherita",
        name: "Маргарита",
        description: "Томатный соус, моцарелла, базилик, оливковое масло",
        price: 450,
        image: "🍕",
        category: "Пицца",
        rating: 4.8,
        preparationTime: 15,
        isVegetarian: true,
        isSpicy: false,
        isPopular: true,
        allergies: ["глютен", "молоко"]
      },
      {
        id: "pepperoni",
        name: "Пепперони",
        description: "Пикантная салями пепперони, моцарелла, томатный соус",
        price: 520,
        image: "🌶️",
        category: "Пицца",
        rating: 4.7,
        preparationTime: 18,
        isVegetarian: false,
        isSpicy: true,
        isPopular: true,
        allergies: ["глютен", "молоко"]
      },
      {
        id: "carbonara-pasta",
        name: "Паста Карбонара",
        description: "Спагетти с беконом, яйцом, пармезаном и черным перцем",
        price: 380,
        image: "🍝",
        category: "Паста",
        rating: 4.6,
        preparationTime: 12,
        isVegetarian: false,
        isSpicy: false,
        isPopular: true,
        allergies: ["глютен", "молоко", "яйца"]
      },
      {
        id: "caesar-salad",
        name: "Цезарь с курицей",
        description: "Салат романо, курица гриль, сухарики, пармезан, соус цезарь",
        price: 320,
        image: "🥗",
        category: "Салаты",
        rating: 4.4,
        preparationTime: 8,
        isVegetarian: false,
        isSpicy: false,
        isPopular: false,
        allergies: ["глютен", "молоко", "яйца"]
      }
    ],
    reviews: [
      {
        id: "rev3",
        userName: "Дмитрий С.",
        rating: 5,
        comment: "Лучшая пицца в городе! Тесто просто идеальное.",
        date: "2024-01-12",
        orderItems: ["Маргарита", "Пепперони"]
      }
    ]
  },
  {
    id: "sushi-master",
    name: "🍣 Sushi Master",
    description: "Свежие суши и роллы от шеф-повара из Японии",
    image: "🍣",
    cuisine: "Японская",
    rating: 4.9,
    deliveryTime: "30-45 мин",
    deliveryFee: 250,
    minimumOrder: 800,
    isOpen: true,
    location: "ул. Морская, 78",
    phone: "+7 (999) 345-67-89",
    categories: ["Роллы", "Суши", "Супы", "Напитки"],
    menu: [
      {
        id: "california-roll",
        name: "Калифорния",
        description: "Краб, авокадо, огурец, икра тобико, кунжут",
        price: 380,
        image: "🍣",
        category: "Роллы",
        rating: 4.8,
        preparationTime: 15,
        isVegetarian: false,
        isSpicy: false,
        isPopular: true,
        allergies: ["морепродукты", "кунжут"]
      },
      {
        id: "philadelphia-roll",
        name: "Филадельфия",
        description: "Лосось, сливочный сыр, огурец, нори",
        price: 420,
        image: "🐟",
        category: "Роллы",
        rating: 4.9,
        preparationTime: 18,
        isVegetarian: false,
        isSpicy: false,
        isPopular: true,
        allergies: ["рыба", "молоко"]
      },
      {
        id: "salmon-sushi",
        name: "Суши с лососем",
        description: "Свежий норвежский лосось на рисе с васаби",
        price: 180,
        image: "🍣",
        category: "Суши",
        rating: 4.9,
        preparationTime: 10,
        isVegetarian: false,
        isSpicy: false,
        isPopular: true,
        allergies: ["рыба"]
      },
      {
        id: "miso-soup",
        name: "Суп мисо",
        description: "Традиционный японский суп с тофу и водорослями",
        price: 220,
        image: "🍲",
        category: "Супы",
        rating: 4.5,
        preparationTime: 8,
        isVegetarian: true,
        isSpicy: false,
        isPopular: false,
        allergies: ["соя"]
      }
    ],
    reviews: [
      {
        id: "rev4",
        userName: "Анна В.",
        rating: 5,
        comment: "Невероятно свежие суши! Как в Токио.",
        date: "2024-01-08",
        orderItems: ["Филадельфия", "Суши с лососем"]
      }
    ]
  }
];

// Основной компонент приложения доставки еды
export default function FoodDeliveryApp() {
  const [currentView, setCurrentView] = useState<'restaurants' | 'menu' | 'cart' | 'checkout' | 'orders'>('restaurants');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'deliveryFee'>('rating');

  // Загрузка корзины и заказов из localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('food-delivery-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const savedOrders = localStorage.getItem('food-delivery-orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders).map((order: any) => ({
        ...order,
        orderTime: new Date(order.orderTime),
        estimatedDelivery: new Date(order.estimatedDelivery)
      })));
    }
  }, []);

  // Сохранение корзины в localStorage
  useEffect(() => {
    localStorage.setItem('food-delivery-cart', JSON.stringify(cart));
  }, [cart]);

  // Сохранение заказов в localStorage
  useEffect(() => {
    localStorage.setItem('food-delivery-orders', JSON.stringify(orders));
  }, [orders]);

  // Фильтрация и сортировка ресторанов
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurantsData.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCuisine = cuisineFilter === 'all' || restaurant.cuisine === cuisineFilter;
      return matchesSearch && matchesCuisine && restaurant.isOpen;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'deliveryTime':
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
        case 'deliveryFee':
          return a.deliveryFee - b.deliveryFee;
        default:
          return 0;
      }
    });
  }, [searchQuery, cuisineFilter, sortBy]);

  // Фильтрация меню по категории
  const filteredMenu = useMemo(() => {
    if (!selectedRestaurant) return [];
    
    if (selectedCategory === 'all') {
      return selectedRestaurant.menu;
    }
    
    return selectedRestaurant.menu.filter(item => item.category === selectedCategory);
  }, [selectedRestaurant, selectedCategory]);

  // Добавление товара в корзину
  const addToCart = useCallback((menuItem: MenuItem, restaurantId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.menuItem.id === menuItem.id && item.restaurantId === restaurantId
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.menuItem.id === menuItem.id && item.restaurantId === restaurantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { menuItem, quantity: 1, restaurantId }];
      }
    });
  }, []);

  // Удаление товара из корзины
  const removeFromCart = useCallback((menuItemId: string, restaurantId: string) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.menuItem.id === menuItemId && item.restaurantId === restaurantId)
    ));
  }, []);

  // Изменение количества товара в корзине
  const updateCartItemQuantity = useCallback((menuItemId: string, restaurantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId, restaurantId);
      return;
    }

    setCart(prevCart => prevCart.map(item =>
      item.menuItem.id === menuItemId && item.restaurantId === restaurantId
        ? { ...item, quantity }
        : item
    ));
  }, [removeFromCart]);

  // Расчет общей стоимости корзины
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  }, [cart]);

  // Расчет стоимости доставки
  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    const restaurantId = cart[0].restaurantId;
    const restaurant = restaurantsData.find(r => r.id === restaurantId);
    return restaurant?.deliveryFee || 0;
  }, [cart]);

  // Оформление заказа
  const placeOrder = useCallback((customerInfo: any, paymentMethod: string, deliveryInstructions?: string) => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      restaurantId: cart[0].restaurantId,
      items: [...cart],
      total: cartTotal + deliveryFee,
      status: 'preparing',
      orderTime: new Date(),
      estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000), // +35 минут
      customerInfo,
      paymentMethod,
      deliveryInstructions
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setCart([]);
    setCurrentView('orders');

    // Симуляция изменения статуса заказа
    setTimeout(() => {
      setOrders(prevOrders => prevOrders.map(order =>
        order.id === newOrder.id ? { ...order, status: 'ready' } : order
      ));
    }, 10000); // 10 секунд - готовится

    setTimeout(() => {
      setOrders(prevOrders => prevOrders.map(order =>
        order.id === newOrder.id ? { ...order, status: 'delivering' } : order
      ));
    }, 20000); // 20 секунд - в пути

    setTimeout(() => {
      setOrders(prevOrders => prevOrders.map(order =>
        order.id === newOrder.id ? { ...order, status: 'delivered' } : order
      ));
    }, 35000); // 35 секунд - доставлен
  }, [cart, cartTotal, deliveryFee]);

  // Получение уникальных типов кухонь
  const cuisines = useMemo(() => {
    const allCuisines = restaurantsData.map(r => r.cuisine);
    return Array.from(new Set(allCuisines));
  }, []);

  // Компонент каталога ресторанов
  const RestaurantsCatalog = () => (
    <div className="space-y-6">
      {/* Поиск и фильтры */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Поиск ресторанов или блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>
          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="all">Все кухни</option>
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="rating">По рейтингу</option>
            <option value="deliveryTime">По времени доставки</option>
            <option value="deliveryFee">По стоимости доставки</option>
          </select>
        </div>
      </div>

      {/* Список ресторанов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <div
            key={restaurant.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
            onClick={() => {
              setSelectedRestaurant(restaurant);
              setSelectedCategory('all');
              setCurrentView('menu');
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{restaurant.image}</div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-yellow-600">
                    <span>⭐</span>
                    <span className="font-medium">{restaurant.rating}</span>
                  </div>
                  <div className="text-xs text-slate-500">{restaurant.deliveryTime}</div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {restaurant.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                {restaurant.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                  {restaurant.cuisine}
                </span>
                <div className="text-slate-500">
                  Доставка: {restaurant.deliveryFee}₽
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                <span>Мин. заказ: {restaurant.minimumOrder}₽</span>
                <span>{restaurant.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Компонент меню ресторана
  const RestaurantMenu = () => {
    if (!selectedRestaurant) return null;

    return (
      <div className="space-y-6">
        {/* Информация о ресторане */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{selectedRestaurant.image}</div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedRestaurant.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedRestaurant.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="flex items-center space-x-1 text-yellow-600">
                    <span>⭐</span>
                    <span>{selectedRestaurant.rating}</span>
                  </span>
                  <span className="text-slate-500">
                    🚚 {selectedRestaurant.deliveryTime}
                  </span>
                  <span className="text-slate-500">
                    📞 {selectedRestaurant.phone}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('restaurants')}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              ← Назад к ресторанам
            </button>
          </div>
        </div>

        {/* Фильтр по категориям */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              Все блюда
            </button>
            {selectedRestaurant.categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Меню */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMenu.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </h3>
                    {item.isPopular && (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded">
                        🔥 Популярное
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="text-green-600" title="Вегетарианское">🌱</span>
                    )}
                    {item.isSpicy && (
                      <span className="text-red-600" title="Острое">🌶️</span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{item.rating}</span>
                    </span>
                    <span>⏱️ {item.preparationTime} мин</span>
                    {item.allergies.length > 0 && (
                      <span title={`Аллергены: ${item.allergies.join(', ')}`}>
                        ⚠️ Аллергены
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-3xl ml-4">{item.image}</div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-orange-600">
                  {item.price}₽
                </span>
                <button
                  onClick={() => addToCart(item, selectedRestaurant.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Компонент корзины
  const Cart = () => {
    if (cart.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Корзина пуста
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Добавьте блюда из любимых ресторанов
          </p>
          <button
            onClick={() => setCurrentView('restaurants')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Выбрать ресторан
          </button>
        </div>
      );
    }

    const restaurant = restaurantsData.find(r => r.id === cart[0].restaurantId);

    return (
      <div className="space-y-6">
        {/* Информация о заказе */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Ваш заказ
          </h2>
          {restaurant && (
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">{restaurant.image}</span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Доставка: {restaurant.deliveryTime} • {restaurant.deliveryFee}₽
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Товары в корзине */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.menuItem.id}-${index}`} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{item.menuItem.image}</span>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.menuItem.price}₽ за штуку
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateCartItemQuantity(item.menuItem.id, item.restaurantId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartItemQuantity(item.menuItem.id, item.restaurantId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.menuItem.id, item.restaurantId)}
                    className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 ml-2"
                  >
                    ×
                  </button>
                  <span className="w-20 text-right font-medium text-slate-900 dark:text-slate-100">
                    {item.menuItem.price * item.quantity}₽
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Итого */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Стоимость блюд:</span>
              <span>{cartTotal}₽</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Доставка:</span>
              <span>{deliveryFee}₽</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Итого:</span>
              <span>{cartTotal + deliveryFee}₽</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('checkout')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-medium mt-6 transition-colors"
            disabled={cartTotal < (restaurant?.minimumOrder || 0)}
          >
            {cartTotal < (restaurant?.minimumOrder || 0) 
              ? `Минимальный заказ: ${restaurant?.minimumOrder}₽`
              : 'Оформить заказ'
            }
          </button>
        </div>
      </div>
    );
  };

  // Компонент оформления заказа
  const Checkout = () => {
    const [customerInfo, setCustomerInfo] = useState({
      name: '',
      phone: '',
      address: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (customerInfo.name && customerInfo.phone && customerInfo.address) {
        placeOrder(customerInfo, paymentMethod, deliveryInstructions);
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Оформление заказа
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Контактная информация */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Контактная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="tel"
                  placeholder="Номер телефона"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Адрес доставки"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white mt-4"
              />
            </div>

            {/* Способ оплаты */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Способ оплаты
              </h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600"
                  />
                  <span className="text-slate-900 dark:text-slate-100">💳 Банковской картой</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600"
                  />
                  <span className="text-slate-900 dark:text-slate-100">💵 Наличными при получении</span>
                </label>
              </div>
            </div>

            {/* Комментарий к заказу */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Комментарий к заказу
              </h3>
              <textarea
                placeholder="Особые пожелания к заказу или доставке..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white resize-none"
              />
            </div>

            {/* Итого и кнопка */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  К оплате:
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  {cartTotal + deliveryFee}₽
                </span>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentView('cart')}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg font-medium"
                >
                  Назад в корзину
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-medium"
                >
                  Подтвердить заказ
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Компонент отслеживания заказов
  const OrderTracking = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'preparing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
        case 'ready': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
        case 'delivering': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
        case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        default: return 'text-slate-600 bg-slate-100 dark:bg-slate-700';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'preparing': return '👨‍🍳 Готовится';
        case 'ready': return '📦 Готов к выдаче';
        case 'delivering': return '🚚 В пути';
        case 'delivered': return '✅ Доставлен';
        default: return status;
      }
    };

    if (orders.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Заказов пока нет
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Сделайте первый заказ в любимом ресторане
          </p>
          <button
            onClick={() => setCurrentView('restaurants')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Заказать еду
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Мои заказы
          </h2>
        </div>

        {orders.map(order => {
          const restaurant = restaurantsData.find(r => r.id === order.restaurantId);
          
          return (
            <div key={order.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Заказ #{order.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {order.orderTime.toLocaleString()}
                  </p>
                  {restaurant && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {restaurant.image} {restaurant.name}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Прогресс-бар */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Заказ принят</span>
                  <span>Готовится</span>
                  <span>В пути</span>
                  <span>Доставлен</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: order.status === 'preparing' ? '25%' :
                             order.status === 'ready' ? '50%' :
                             order.status === 'delivering' ? '75%' :
                             order.status === 'delivered' ? '100%' : '0%'
                    }}
                  ></div>
                </div>
              </div>

              {/* Товары в заказе */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-slate-900 dark:text-slate-100">
                      {item.menuItem.name} × {item.quantity}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {item.menuItem.price * item.quantity}₽
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {order.status === 'delivered' ? 'Доставлен' : 
                   `Ожидаемое время: ${order.estimatedDelivery.toLocaleTimeString()}`}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {order.total}₽
                </div>
              </div>

              {order.status === 'delivered' && (
                <div className="mt-4 text-center">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Оценить заказ
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🍔 Доставка еды
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Любимые рестораны с доставкой на дом
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
              onClick={() => setCurrentView('restaurants')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'restaurants'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              🏪 Рестораны
            </button>
            {selectedRestaurant && (
              <button
                onClick={() => setCurrentView('menu')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'menu'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                📋 Меню
              </button>
            )}
            <button
              onClick={() => setCurrentView('cart')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'cart'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              🛒 Корзина ({cart.length})
            </button>
            <button
              onClick={() => setCurrentView('orders')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'orders'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              📦 Мои заказы ({orders.length})
            </button>
          </div>
        </div>

        {/* Основной контент */}
        {currentView === 'restaurants' && <RestaurantsCatalog />}
        {currentView === 'menu' && <RestaurantMenu />}
        {currentView === 'cart' && <Cart />}
        {currentView === 'checkout' && <Checkout />}
        {currentView === 'orders' && <OrderTracking />}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            🍕 Быстрая доставка из лучших ресторанов города!
          </p>
        </footer>
      </div>
    </div>
  );
}
