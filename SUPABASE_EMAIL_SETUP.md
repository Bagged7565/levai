# Настройка отправки писем через Supabase Edge Functions

## 1. Установка Supabase CLI

```bash
npm install -g supabase
```

## 2. Инициализация проекта

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

## 3. Настройка Resend (бесплатный email сервис)

1. **Зарегистрируйтесь** на [resend.com](https://resend.com)
2. **Получите API ключ** в разделе API Keys
3. **Добавьте домен** (или используйте тестовый)

## 4. Развертывание Edge Function

### Вариант A: С Resend (рекомендуется)

```bash
# Создайте функцию
supabase functions new send-email-with-resend

# Добавьте переменную окружения
supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Разверните функцию
supabase functions deploy send-email-with-resend
```

### Вариант B: Простая версия (для тестирования)

```bash
# Создайте функцию
supabase functions new send-email

# Разверните функцию
supabase functions deploy send-email
```

## 5. Обновление кода

Замените в `index.html` строку 251:

```javascript
// Замените на вашу почту
'your-email@example.com' → 'your-actual-email@gmail.com'
```

## 6. Тестирование

1. **Откройте сайт**
2. **Нажмите кнопку "Почта"**
3. **Заполните форму**
4. **Отправьте сообщение**
5. **Проверьте вашу почту**

## 🎯 Готово!

Теперь письма будут отправляться через Supabase Edge Functions!

## Альтернативные email сервисы:

### SendGrid
```typescript
// В Edge Function
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to_email }] }],
    from: { email: 'noreply@levai.ru' },
    subject: subject,
    content: [{ type: 'text/plain', value: emailContent }]
  })
})
```

### Gmail SMTP
```typescript
// В Edge Function
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const client = new SmtpClient();
await client.connectTLS({
  hostname: "smtp.gmail.com",
  port: 587,
  username: "your-email@gmail.com",
  password: "your-app-password",
});

await client.send({
  from: "your-email@gmail.com",
  to: to_email,
  subject: subject,
  content: emailContent,
});

await client.close();
```

## Преимущества Supabase Edge Functions:

✅ **Бесплатный тариф** (500,000 вызовов/месяц)  
✅ **Глобальное развертывание**  
✅ **Автоматическое масштабирование**  
✅ **Встроенная безопасность**  
✅ **Интеграция с Supabase**  

**Выберите предпочитаемый email сервис и следуйте инструкции!** 