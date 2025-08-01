# Настройка Supabase для LevAI

## 1. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub или создайте аккаунт
4. Создайте новый проект:
   - **Name**: `levai-platform`
   - **Database Password**: придумайте надежный пароль
   - **Region**: выберите ближайший регион

## 2. Получение ключей API

1. В панели управления перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://xyz.supabase.co`)
   - **anon public** ключ

## 3. Обновление конфигурации

Замените в `index.html` строки 32-33:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

## 4. Создание таблицы профилей

В SQL Editor выполните:

```sql
-- Создание таблицы профилей пользователей
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Функция для автоматического создания профиля
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## 5. Дополнительные таблицы (опционально)

```sql
-- Таблица курсов
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица прогресса пользователей
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Включение RLS для новых таблиц
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Политики для курсов (все могут читать)
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

-- Политики для прогресса (только свой прогресс)
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 6. Тестирование

1. Откройте `index.html` в браузере
2. Попробуйте зарегистрироваться
3. Проверьте, что пользователь появился в таблице `profiles`
4. Попробуйте войти и выйти

## 7. Дополнительные возможности

### Email подтверждение
В **Authentication** → **Settings** включите:
- **Enable email confirmations**
- **Enable email change confirmations**

### OAuth провайдеры
Добавьте вход через:
- Google
- GitHub
- Discord

### Storage для файлов
Создайте bucket для:
- Аватаров пользователей
- Изображений курсов
- Видео уроков

## 8. Мониторинг

В панели Supabase отслеживайте:
- **Database** → **Logs** - SQL запросы
- **Authentication** → **Users** - зарегистрированные пользователи
- **Edge Functions** - для серверной логики

## 9. Безопасность

- Никогда не публикуйте `service_role` ключ
- Используйте только `anon` ключ на фронтенде
- Настройте CORS в **Settings** → **API**
- Регулярно обновляйте пароли

## 10. Масштабирование

При росте проекта:
- Перейдите на платный план
- Настройте реплики базы данных
- Используйте Edge Functions для тяжелой логики
- Настройте CDN для статических файлов 