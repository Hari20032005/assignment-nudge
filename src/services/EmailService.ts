
import emailjs from 'emailjs-com';

export class EmailService {
  // These IDs should be replaced with your actual EmailJS account details
  private static readonly SERVICE_ID = 'service_id'; // Replace with your EmailJS service ID
  private static readonly TEMPLATE_ID = 'template_id'; // Replace with your EmailJS template ID
  private static readonly USER_ID = 'user_id'; // Replace with your EmailJS user ID

  static async sendVerificationCode(email: string, code: string, purpose: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development') {
        // For development, log to console
        console.log(`[EMAIL SIMULATION] To: ${email}, Code: ${code}, Purpose: ${purpose}`);
        return true;
      }

      // For production, send actual email with EmailJS
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        {
          to_email: email,
          verification_code: code,
          purpose: purpose
        },
        this.USER_ID
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Check if EmailJS is properly configured
  static isConfigured(): boolean {
    return (
      this.SERVICE_ID !== 'service_id' && 
      this.TEMPLATE_ID !== 'template_id' && 
      this.USER_ID !== 'user_id'
    );
  }
}
