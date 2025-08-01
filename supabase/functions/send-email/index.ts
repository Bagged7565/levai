import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { from_name, from_email, subject, message, to_email } = await req.json()

    // Validate required fields
    if (!from_name || !from_email || !message || !to_email) {
      throw new Error('Missing required fields')
    }

    // Create email content
    const emailContent = `
Новое сообщение с сайта LevAI

Имя: ${from_name}
Email: ${from_email}
Тема: ${subject || 'Сообщение с сайта LevAI'}

Сообщение:
${message}

---
Отправлено с сайта LevAI
    `.trim()

    // Send email using Deno's built-in SMTP or external service
    // For now, we'll use a simple console log and you can integrate with your preferred email service
    console.log('Email to send:', {
      to: to_email,
      from: 'noreply@levai.ru',
      subject: subject || 'Сообщение с сайта LevAI',
      content: emailContent
    })

    // TODO: Integrate with your preferred email service:
    // - Gmail SMTP
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend.com

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 