// All visible texts live here, so another language is a copy of this object.
import type { Gender, ProductCategory, ProductType } from "@/generated/prisma/enums";

export const brand = "Shimitsu";

/** Russian plural: plural(1, "модель", "модели", "моделей") -> "модель". */
function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const t = {
  meta: {
    title: `${brand} · Витрина`,
    description: "Листайте рейл, наведите на вещь, чтобы развернуть её, нажмите, чтобы открыть.",
  },
  header: {
    utility: [
      { label: "Магазины", href: "#" },
      { label: "Помощь", href: "#" },
    ],
    join: "Присоединиться",
    login: "Войти",
    logout: "Выйти",
    account: "Аккаунт",
    nav: [
      { label: "Главная", href: "/" },
      { label: "Коллекция", href: "/#collection" },
      { label: "Витрина", href: "/showcase" },
      { label: "Обувь", href: "/showcase#footwear" },
      { label: "Контакты", href: "/#contacts" },
    ],
    search: "Поиск",
  },
  hero: {
    eyebrowA: "Новая коллекция",
    eyebrowB: "Премиальный стритвир",
    titleA: "Слои, которые",
    titleB: "сидят идеально.",
  },
  rail: {
    label: "Рейл с одеждой: листайте мышью, наведите на вещь, чтобы развернуть её",
    hint: "Наведите на вещь · листайте, чтобы рассмотреть",
    blurb: "Плотный футер. Свободный крой. Сделано надолго.",
    shop: "Смотреть коллекцию",
  },
  detail: {
    photo: "Фото",
    backAlt: "вид сзади",
    add: "В корзину",
    adding: "Добавляем…",
    close: "Закрыть",
    page: "Страница товара",
    chooseSize: "Выберите размер",
    soldOut: "Нет в наличии",
    lowStock: (n: number) => `Осталось ${n} шт.`,
    sizeSoldOut: "нет в наличии",
  },
  cart: {
    title: "Корзина",
    items: "шт.",
    close: "Закрыть корзину",
    empty: "Ваша корзина пуста.",
    size: "Размер",
    decrease: "Уменьшить количество",
    increase: "Увеличить количество",
    remove: "Удалить",
    total: "Итого",
    note: "Налоги и доставка рассчитываются при оформлении.",
    checkout: "Оформить заказ",
  },
  home: {
    metaTitle: `${brand} · Главная`,
    hero: {
      eyebrowA: "Новая коллекция",
      eyebrowB: "Осень — зима",
      titleA: "Слои, которые",
      titleB: "сидят идеально.",
      text: "Плотный футер, свободный крой и спокойные цвета. Наведите на вещь, и она повернётся лицом.",
      primary: "Смотреть витрину",
      secondary: "Новинки",
    },
    marquee: ["Новая коллекция", "Плотный футер", "Свободный крой", "Возврат в течение 14 дней", "Сделано надолго"],
    marqueeShipping: (amount: string) => `Бесплатная доставка от ${amount}`,
    types: {
      eyebrow: "Каталог",
      title: "Выберите слой",
      soon: "Скоро в продаже",
      open: "Открыть",
      count: (n: number) => `${n} ${plural(n, "модель", "модели", "моделей")}`,
    },
    arrivals: {
      eyebrow: "Коллекция",
      title: "Избранные вещи",
      all: "Вся витрина",
      new: "Новинка",
      empty: "Скоро здесь появятся новые вещи.",
    },
    values: {
      eyebrow: "Почему Shimitsu",
      title: "Одежда, которую хочется носить каждый день.",
      items: [
        { n: "01", title: "Плотный футер", text: "Тяжёлый хлопок, который держит форму и приятен к телу." },
        { n: "02", title: "Свободный крой", text: "Оверсайз-посадка, в которой удобно и в городе, и в дороге." },
        { n: "03", title: "Сделано надолго", text: "Прочные швы и фурнитура: вещи служат годами, а не сезон." },
      ],
    },
    cta: {
      eyebrow: "Присоединяйтесь",
      title: "Первыми узнавайте о новых коллекциях.",
      text: "Создайте аккаунт, чтобы сохранять заказы и не пропускать новинки.",
      primary: "Создать аккаунт",
      secondary: "У меня уже есть аккаунт",
    },
  },
  catalog: {
    types: { TOP: "Верх", BOTTOM: "Низ", FOOTWEAR: "Обувь" } satisfies Record<ProductType, string>,
    typeHints: {
      TOP: "Худи, футболки, куртки",
      BOTTOM: "Джинсы, брюки, карго",
      FOOTWEAR: "Кроссовки, ботинки, лоферы",
    } satisfies Record<ProductType, string>,
    categories: {
      T_SHIRT: "Футболка",
      SHIRT: "Рубашка",
      SWEATSHIRT: "Свитшот",
      HOODIE: "Худи",
      KNITWEAR: "Трикотаж",
      BLAZER: "Блейзер",
      JACKET: "Куртка",
      COAT: "Пальто",
      JEANS: "Джинсы",
      TROUSERS: "Брюки",
      CARGO: "Карго",
      JOGGERS: "Джоггеры",
      SHORTS: "Шорты",
      SNEAKERS: "Кроссовки",
      BOOTS: "Ботинки",
      LOAFERS: "Лоферы",
      SANDALS: "Сандалии",
    } satisfies Record<ProductCategory, string>,
    genders: { MEN: "Мужское", WOMEN: "Женское", UNISEX: "Унисекс" } satisfies Record<Gender, string>,
    sizeLabel: {
      TOP: "Размер",
      BOTTOM: "Размер (талия)",
      FOOTWEAR: "Размер (EU)",
    } satisfies Record<ProductType, string>,
    views: { front: "Спереди", side: "Сбоку", back: "Сзади" },
    sale: (percent: number) => `−${percent}%`,
  },
  showcase: {
    tabsLabel: "Разделы витрины",
    top: "Верхняя одежда",
    bottom: "Нижняя одежда",
    footwear: "Обувь",
    emptyTop: "Верхняя одежда скоро появится.",
    emptyBottom: "Нижняя одежда скоро появится.",
  },
  shelf: {
    eyebrow: "Обувь",
    title: "Стойка с обувью",
    hint: "Листайте ряды вбок, нажмите на пару, чтобы рассмотреть",
    empty: "Обувь скоро появится.",
    row: (n: number) => `Ряд ${n}`,
  },
  footer: {
    blurb: "Премиальный стритвир. Плотный футер, свободный крой, сделано надолго.",
    columns: [
      {
        title: "Магазин",
        links: [
          { label: "Витрина", href: "/showcase" },
          { label: "Коллекция", href: "/#collection" },
          { label: "Обувь", href: "/showcase#footwear" },
        ],
      },
      {
        title: "Помощь",
        links: [
          { label: "Доставка", href: "#" },
          { label: "Возврат", href: "#" },
          { label: "Таблица размеров", href: "#" },
        ],
      },
      {
        title: "Аккаунт",
        links: [
          { label: "Войти", href: "/auth/sign-in" },
          { label: "Присоединиться", href: "/auth/sign-up" },
        ],
      },
    ],
    contactsTitle: "Контакты",
    email: "hello@shimitsu.example",
    rights: "Все права защищены.",
    legal: [
      { label: "Конфиденциальность", href: "#" },
      { label: "Условия", href: "#" },
    ],
  },
  auth: {
    back: "На главную",
    showPassword: "Показать пароль",
    hidePassword: "Скрыть пароль",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Пароль",
    google: "Продолжить с Google",
    or: "или",
    errors: {
      name: "Введите имя (минимум 2 символа).",
      email: "Введите корректный email.",
      passwordRequired: "Введите пароль.",
      password: "Пароль должен быть от 8 до 72 символов.",
      mismatch: "Пароли не совпадают.",
      exists: "Этот email уже зарегистрирован.",
      invalid: "Неверный email или пароль.",
      generic: "Что-то пошло не так. Попробуйте ещё раз.",
      google: "Не удалось войти через Google.",
    },
    signIn: {
      metaTitle: `${brand} · Вход`,
      eyebrow: "Аккаунт",
      title: "С возвращением",
      subtitle: "Войдите, чтобы продолжить покупки.",
      submit: "Войти",
      submitting: "Входим…",
      noAccount: "Нет аккаунта?",
      toSignUp: "Зарегистрироваться",
    },
    signUp: {
      metaTitle: `${brand} · Регистрация`,
      eyebrow: "Присоединяйтесь",
      title: "Создайте аккаунт",
      subtitle: "Это займёт меньше минуты.",
      name: "Имя",
      namePlaceholder: "Как к вам обращаться",
      confirm: "Повторите пароль",
      hint: "Минимум 8 символов.",
      submit: "Создать аккаунт",
      submitting: "Создаём…",
      haveAccount: "Уже есть аккаунт?",
      toSignIn: "Войти",
    },
  },
};
