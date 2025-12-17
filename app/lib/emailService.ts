/**
 * Email Service Module
 * Story 7.1.5 - Email Confirmation with Ticket Details
 * 
 * Handles email sending using Resend service
 */

import { Resend } from 'resend';
import { getDb } from './db';
import { emailLogs } from './schema';
import { randomUUID } from 'crypto';

// Lazy initialization for Resend client - gets env var at runtime, not module load
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Email configuration - use functions to get env vars at runtime
function getFromEmail(): string {
  return process.env.EMAIL_FROM || 'onboarding@resend.dev';
}

function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL || 'support@fracassaautolinee.it';
}

export interface TicketEmailData {
  ticketNumber: string;
  passengerName: string;
  passengerSurname: string;
  passengerEmail: string;
  originStopName: string;
  destinationStopName: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  amountPaid: number; // in cents
  passengerCount: number;
  purchaseTimestamp: Date;
  ticketUrl?: string; // Optional link to view ticket in app
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Format currency amount (cents to euros)
 */
function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return euros.toFixed(2);
}

/**
 * Format date for display (DD/MM/YYYY)
 */
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Format datetime for display
 */
function formatDateTime(date: Date): string {
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome'
  });
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(data: TicketEmailData): string {
  const formattedDate = formatDate(data.departureDate);
  const amountFormatted = formatCurrency(data.amountPaid);
  const purchaseDateTime = formatDateTime(data.purchaseTimestamp);
  const fullName = `${data.passengerName} ${data.passengerSurname}`;

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conferma Biglietto Fracassa Autolinee</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1e40af;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 30px 20px;
    }
    .ticket-number-box {
      background-color: #eff6ff;
      border: 2px solid #1e40af;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .ticket-number-label {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ticket-number {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
      margin: 0;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 500;
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #1e293b;
      text-align: right;
    }
    .cta-button {
      display: inline-block;
      background-color: #1e40af;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer-divider {
      margin: 15px 0;
      border: 0;
      border-top: 1px solid #e2e8f0;
    }
    .support-info {
      margin-top: 15px;
      font-size: 13px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px 15px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-value {
        text-align: left;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="logo">🚌 Fracassa Autolinee</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Conferma Acquisto Biglietto</p>
    </div>
    
    <div class="content">
      <p>Gentile <strong>${fullName}</strong>,</p>
      <p>Grazie per aver scelto Fracassa Autolinee! Il tuo biglietto è stato confermato con successo.</p>
      
      <div class="ticket-number-box">
        <p class="ticket-number-label">Numero Biglietto</p>
        <p class="ticket-number">${data.ticketNumber}</p>
      </div>
      
      <div class="section">
        <h2 class="section-title">Dettagli Passeggero</h2>
        <div class="info-row">
          <span class="info-label">Nome e Cognome:&nbsp;</span>
          <span class="info-value">${fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:&nbsp;</span>
          <span class="info-value">${data.passengerEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Numero Passeggeri:&nbsp;</span>
          <span class="info-value">${data.passengerCount}</span>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Dettagli Viaggio</h2>
        <div class="info-row">
          <span class="info-label">Partenza:&nbsp;</span>
          <span class="info-value">${data.originStopName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Destinazione:&nbsp;</span>
          <span class="info-value">${data.destinationStopName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data:&nbsp;</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Orario:&nbsp;</span>
          <span class="info-value">${data.departureTime}</span>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Dettagli Pagamento</h2>
        <div class="info-row">
          <span class="info-label">Importo Pagato:&nbsp;</span>
          <span class="info-value">€ ${amountFormatted}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data Acquisto:&nbsp;</span>
          <span class="info-value">${purchaseDateTime}</span>
        </div>
      </div>
      
      ${data.ticketUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.ticketUrl}" class="cta-button">Visualizza Biglietto nell'App</a>
      </div>
      ` : ''}
      
      <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Importante:</strong> Conserva questo biglietto e presentalo all'autista al momento della partenza. Il numero del biglietto potrebbe essere richiesto per la verifica.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>Fracassa Autolinee</strong></p>
      <p style="margin: 5px 0;">Servizi di trasporto passeggeri di qualità</p>
      
      <hr class="footer-divider">
      
      <div class="support-info">
        <p style="margin: 5px 0;"><strong>Hai bisogno di assistenza?</strong></p>
        <p style="margin: 5px 0;">Contattaci: <a href="mailto:${getSupportEmail()}" style="color: #1e40af;">${getSupportEmail()}</a></p>
      </div>
      
      <p style="margin: 15px 0 5px 0; font-size: 11px; color: #94a3b8;">
        Questa email è stata generata automaticamente. Per favore non rispondere a questo messaggio.
      </p>
      <p style="margin: 5px 0; font-size: 11px; color: #94a3b8;">
        © ${new Date().getFullYear()} Fracassa Autolinee. Tutti i diritti riservati.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email template (fallback for non-HTML clients)
 */
function generateEmailText(data: TicketEmailData): string {
  const formattedDate = formatDate(data.departureDate);
  const amountFormatted = formatCurrency(data.amountPaid);
  const purchaseDateTime = formatDateTime(data.purchaseTimestamp);
  const fullName = `${data.passengerName} ${data.passengerSurname}`;

  return `
FRACASSA AUTOLINEE
Conferma Acquisto Biglietto

Gentile ${fullName},

Grazie per aver scelto Fracassa Autolinee! Il tuo biglietto è stato confermato con successo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NUMERO BIGLIETTO
${data.ticketNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETTAGLI PASSEGGERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome e Cognome:      ${fullName}
Email:               ${data.passengerEmail}
Numero Passeggeri:   ${data.passengerCount}

DETTAGLI VIAGGIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Partenza:            ${data.originStopName}
Destinazione:        ${data.destinationStopName}
Data:                ${formattedDate}
Orario:              ${data.departureTime}

DETTAGLI PAGAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Importo Pagato:      € ${amountFormatted}
Data Acquisto:       ${purchaseDateTime}

${data.ticketUrl ? `\nVISUALIZZA BIGLIETTO: ${data.ticketUrl}\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANTE: Conserva questo biglietto e presentalo all'autista 
al momento della partenza. Il numero del biglietto potrebbe 
essere richiesto per la verifica.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hai bisogno di assistenza?
Contattaci: ${getSupportEmail()}

Questa email è stata generata automaticamente. 
Per favore non rispondere a questo messaggio.

© ${new Date().getFullYear()} Fracassa Autolinee. Tutti i diritti riservati.
  `.trim();
}

/**
 * Log email send attempt to database
 */
async function logEmailSend(
  ticketNumber: string,
  recipientEmail: string,
  status: 'sent' | 'failed' | 'retrying',
  messageId?: string,
  errorMessage?: string,
  attemptCount: number = 1
): Promise<void> {
  try {
    const db = getDb();
    const logId = randomUUID();
    const now = new Date();

    await db.insert(emailLogs).values({
      id: logId,
      ticketNumber,
      recipientEmail,
      emailType: 'ticket_confirmation',
      status,
      messageId,
      errorMessage,
      attemptCount,
      sentAt: status === 'sent' ? now : null,
      createdAt: now,
    });

    console.log('[EMAIL_LOG] Email log recorded:', {
      logId,
      ticketNumber,
      status,
      attemptCount
    });
  } catch (error) {
    console.error('[EMAIL_LOG] Failed to log email send:', error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

/**
 * Send ticket confirmation email
 * 
 * @param data - Ticket information for email
 * @returns Result indicating success or failure
 */
export async function sendTicketConfirmationEmail(
  data: TicketEmailData
): Promise<SendEmailResult> {
  try {
    // Validate email address
    if (!data.passengerEmail || !data.passengerEmail.includes('@')) {
      console.error('[EMAIL] Invalid email address:', data.passengerEmail);
      await logEmailSend(
        data.ticketNumber,
        data.passengerEmail,
        'failed',
        undefined,
        'Invalid email address'
      );
      return {
        success: false,
        error: 'Invalid email address'
      };
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[EMAIL] RESEND_API_KEY not configured');
      await logEmailSend(
        data.ticketNumber,
        data.passengerEmail,
        'failed',
        undefined,
        'Email service not configured'
      );
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    console.log('[EMAIL] Sending confirmation email:', {
      to: data.passengerEmail,
      ticketNumber: data.ticketNumber,
      timestamp: new Date().toISOString()
    });

    // Generate email content
    const htmlContent = generateEmailHTML(data);
    const textContent = generateEmailText(data);

    // Send email via Resend
    const result = await getResendClient().emails.send({
      from: getFromEmail(),
      to: data.passengerEmail,
      subject: `Conferma Biglietto ${data.ticketNumber} - Fracassa Autolinee`,
      html: htmlContent,
      text: textContent,
    });

    console.log('[EMAIL] Email sent successfully:', {
      messageId: result.data?.id,
      ticketNumber: data.ticketNumber,
      timestamp: new Date().toISOString()
    });

    // Log successful send
    await logEmailSend(
      data.ticketNumber,
      data.passengerEmail,
      'sent',
      result.data?.id
    );

    return {
      success: true,
      messageId: result.data?.id
    };

  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed send
    await logEmailSend(
      data.ticketNumber,
      data.passengerEmail,
      'failed',
      undefined,
      errorMessage
    );
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Send email with retry logic
 * 
 * @param data - Ticket information for email
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Delay between retries in milliseconds (default: 2000)
 * @returns Result indicating success or failure
 */
export async function sendTicketConfirmationEmailWithRetry(
  data: TicketEmailData,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<SendEmailResult> {
  let lastError: string = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[EMAIL] Attempt ${attempt}/${maxRetries} to send email for ticket ${data.ticketNumber}`);
    
    // Log retry attempts
    if (attempt > 1) {
      try {
        await logEmailSend(
          data.ticketNumber,
          data.passengerEmail,
          'retrying',
          undefined,
          `Retry attempt ${attempt} of ${maxRetries}`,
          attempt
        );
      } catch (logError) {
        console.error('[EMAIL] Failed to log retry attempt:', logError);
      }
    }
    
    const result = await sendTicketConfirmationEmail(data);
    
    if (result.success) {
      if (attempt > 1) {
        console.log(`[EMAIL] Email sent successfully on attempt ${attempt}`);
      }
      return result;
    }
    
    lastError = result.error || 'Unknown error';
    
    // Don't wait after the last attempt
    if (attempt < maxRetries) {
      console.log(`[EMAIL] Retry attempt ${attempt} failed, waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error(`[EMAIL] All ${maxRetries} attempts failed for ticket ${data.ticketNumber}`);
  
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`
  };
}

