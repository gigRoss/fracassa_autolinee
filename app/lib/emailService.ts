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
 * Note: Uses fully inline styles for maximum email client compatibility
 * and avoids elements that might trigger collapsible behavior
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
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, address=no, email=no, date=no, url=no">
  <title>Conferma Biglietto Fracassa Autolinee</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; color: #1e40af; padding: 30px 20px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <p style="font-size: 28px; font-weight: bold; margin: 0; color: #1e40af;">Fracassa Autolinee</p>
              <p style="margin: 10px 0 0 0; font-size: 13px; font-weight: 600; color: #f59e0b; text-transform: uppercase; letter-spacing: 2px;">Conferma Acquisto Biglietto</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <!-- Greeting -->
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #333333;">Gentile <strong>${fullName}</strong>,</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">Grazie per aver scelto Fracassa Autolinee! Il tuo biglietto è stato confermato con successo.</p>
              
              <!-- Ticket Number Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #eff6ff; border: 2px solid #1e40af; border-radius: 8px; padding: 20px; text-align: center;">
                    <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Numero Biglietto</p>
                    <p style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 1px;">${data.ticketNumber}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Section: Dettagli Passeggero -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                <tr>
                  <td style="font-size: 18px; font-weight: 600; color: #1e293b; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">Dettagli Passeggero</td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Nome e Cognome</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Email</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${data.passengerEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Numero Passeggeri</td>
                        <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${data.passengerCount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Section: Dettagli Viaggio -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                <tr>
                  <td style="font-size: 18px; font-weight: 600; color: #1e293b; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">Dettagli Viaggio</td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Partenza</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${data.originStopName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Destinazione</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${data.destinationStopName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Data</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Orario</td>
                        <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${data.departureTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Section: Dettagli Pagamento -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                <tr>
                  <td style="font-size: 18px; font-weight: 600; color: #1e293b; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">Dettagli Pagamento</td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Importo Pagato</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">€ ${amountFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-weight: 500; color: #64748b; text-align: left; width: 45%; vertical-align: top;">Data Acquisto</td>
                        <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right; width: 55%; vertical-align: top;">${purchaseDateTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${data.ticketUrl ? `
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.ticketUrl}" style="display: inline-block; background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">Visualizza Biglietto nell'App</a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Important Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>Importante:</strong> Conserva questo biglietto e presentalo all'autista al momento della partenza. Il numero del biglietto potrebbe essere richiesto per la verifica.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px; border-top: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding-top: 20px; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e293b;"><strong>Per info e assistenza:</strong></p>
                    <p style="margin: 5px 0; font-size: 13px; color: #64748b;">Tel. <a href="tel:+390861410578" style="color: #1e40af;">0861 410578</a> · WhatsApp <a href="https://wa.me/393451120967" style="color: #1e40af;">345 1120967</a></p>
                    <p style="margin: 5px 0; font-size: 13px; color: #64748b;"><a href="mailto:autolineefracassa@alice.it" style="color: #1e40af;">autolineefracassa@alice.it</a></p>
                    <p style="margin: 15px 0 0 0; font-size: 11px; color: #94a3b8;">© Fracassa Autolinee S.r.l. · P. IVA 01765220676</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

Per info e assistenza:
Tel. 0861 410578
WhatsApp 345 1120967
autolineefracassa@alice.it

© Fracassa Autolinee S.r.l. · P. IVA 01765220676
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

    // Prepare email options
    const emailOptions = {
      from: getFromEmail(),
      to: data.passengerEmail,
      subject: `Conferma Acquisto Biglietto Fracassa Autolinee`,
      html: htmlContent,
      text: textContent,
    };

    // Send email via Resend
    const result = await getResendClient().emails.send(emailOptions);

    // Validate messageId is present - if null/undefined, the email was not actually sent
    const messageId = result.data?.id;
    if (!messageId) {
      const errorMsg = 'Email API returned no messageId - email was not sent';
      console.error('[EMAIL] CRITICAL: Email send failed - no messageId returned:', {
        ticketNumber: data.ticketNumber,
        to: data.passengerEmail,
        result: JSON.stringify(result),
        timestamp: new Date().toISOString()
      });
      
      await logEmailSend(
        data.ticketNumber,
        data.passengerEmail,
        'failed',
        undefined,
        errorMsg
      );
      
      return {
        success: false,
        error: errorMsg
      };
    }

    console.log('[EMAIL] Email sent successfully:', {
      messageId,
      ticketNumber: data.ticketNumber,
      timestamp: new Date().toISOString()
    });

    // Log successful send
    await logEmailSend(
      data.ticketNumber,
      data.passengerEmail,
      'sent',
      messageId
    );

    return {
      success: true,
      messageId
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

