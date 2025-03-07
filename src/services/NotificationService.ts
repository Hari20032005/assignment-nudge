
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  static isAvailable(): boolean {
    return Capacitor.isPluginAvailable('LocalNotifications');
  }

  static async checkPermissions() {
    if (!this.isAvailable()) return false;
    
    const permStatus = await LocalNotifications.checkPermissions();
    return permStatus.display === 'granted';
  }

  static async requestPermissions() {
    if (!this.isAvailable()) return false;
    
    const permStatus = await LocalNotifications.requestPermissions();
    return permStatus.display === 'granted';
  }

  static async scheduleNotification(title: string, body: string, id: number, scheduleDate: Date) {
    if (!this.isAvailable()) {
      console.warn('Local notifications not available on this platform');
      return false;
    }
    
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: scheduleDate },
            sound: 'beep.wav',
            attachments: null,
            actionTypeId: '',
            extra: null
          }
        ]
      });
      
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  static createGoogleCalendarEvent(title: string, description: string, startDate: Date, endDate: Date) {
    try {
      // Format dates for Google Calendar URL
      const startIso = startDate.toISOString().replace(/-|:|\.\d+/g, '');
      const endIso = endDate.toISOString().replace(/-|:|\.\d+/g, '');

      // Encode the event parameters
      const eventParams = {
        action: 'TEMPLATE',
        text: title,
        details: description,
        dates: `${startIso}/${endIso}`
      };

      // Construct the Google Calendar URL
      const baseUrl = 'https://calendar.google.com/calendar/render';
      const queryString = Object.entries(eventParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const calendarUrl = `${baseUrl}?${queryString}`;
      
      return calendarUrl;
    } catch (error) {
      console.error('Error creating Google Calendar event URL:', error);
      return null;
    }
  }
  
  static createMultipleCalendarEventsLink(assignments: { title: string, description: string, startDate: Date, endDate: Date }[]) {
    try {
      // Create a simple HTML page with links to all calendar events
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Add Assignments to Google Calendar</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #4285f4; }
            .assignment { margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .assignment h2 { margin-top: 0; font-size: 18px; }
            .btn { display: inline-block; background: #4285f4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .instructions { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .add-all { margin: 20px 0; text-align: center; }
            .add-all .btn { background: #0f9d58; font-size: 16px; padding: 12px 24px; }
          </style>
        </head>
        <body>
          <h1>VIT Assignment Calendar</h1>
          <div class="instructions">
            <p><strong>Instructions:</strong> Click on each "Add to Calendar" button below to add individual assignments to your Google Calendar. 
            You will need to complete the process in Google Calendar for each assignment.</p>
          </div>
      `;
      
      // Generate a section for each assignment
      assignments.forEach((assignment, index) => {
        const calendarUrl = this.createGoogleCalendarEvent(
          assignment.title,
          assignment.description,
          assignment.startDate,
          assignment.endDate
        );
        
        if (calendarUrl) {
          htmlContent += `
            <div class="assignment">
              <h2>${assignment.title}</h2>
              <p>${assignment.description.replace(/\n/g, '<br>')}</p>
              <p><strong>Date:</strong> ${assignment.startDate.toLocaleDateString()} - ${assignment.endDate.toLocaleDateString()}</p>
              <a href="${calendarUrl}" target="_blank" class="btn">Add to Calendar</a>
            </div>
          `;
        }
      });
      
      // Close the HTML
      htmlContent += `
          <script>
            // Open the first calendar link automatically
            window.onload = function() {
              const links = document.querySelectorAll('.btn');
              if (links.length > 0) {
                links[0].click();
              }
            };
          </script>
        </body>
        </html>
      `;
      
      // Create a blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open the HTML page in a new tab
      const newWindow = window.open(url, '_blank');
      
      // Check if the window was successfully opened
      if (newWindow === null) {
        console.error('Pop-up was blocked. Please allow pop-ups for this site.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating calendar events page:', error);
      return false;
    }
  }
}
