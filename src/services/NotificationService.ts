
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { CalendarEvent, createHelperPageUrl } from '@/utils/googleCalendarApi';

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
      // Ensure we're working with Date objects
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);
      
      // Format dates for Google Calendar URL
      const startIso = start.toISOString().replace(/-|:|\.\d+/g, '');
      const endIso = end.toISOString().replace(/-|:|\.\d+/g, '');

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
      
      // Return the URL which can be used to directly add to Google Calendar
      return calendarUrl;
    } catch (error) {
      console.error('Error creating Google Calendar event URL:', error);
      return null;
    }
  }
  
  static addEventToGoogleCalendar(title: string, description: string, startDate: Date, endDate: Date) {
    const url = this.createGoogleCalendarEvent(title, description, startDate, endDate);
    
    if (!url) {
      return false;
    }
    
    // Open the URL in a new tab
    window.open(url, '_blank');
    return true;
  }
  
  static addMultipleEventsToCalendar(events: CalendarEvent[]) {
    if (events.length === 0) return false;
    
    // Create helper page URL
    const helperPageUrl = createHelperPageUrl(events);
    
    // Open the helper page in a new tab
    const helperWindow = window.open(helperPageUrl, '_blank');
    
    // Check if the window was successfully opened
    if (helperWindow === null) {
      console.error('Pop-up was blocked. Please allow pop-ups for this site.');
      return false;
    }
    
    return true;
  }
}
