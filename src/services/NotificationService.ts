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
      
      return calendarUrl;
    } catch (error) {
      console.error('Error creating Google Calendar event URL:', error);
      return null;
    }
  }
  
  static addMultipleEventsToCalendar(assignments: { title: string, description: string, startDate: Date, endDate: Date }[]) {
    if (assignments.length === 0) return false;
    
    try {
      // Create ICS file content
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//VIT Assignment Reminder//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];
      
      // Add each assignment as a separate event
      assignments.forEach(assignment => {
        const start = assignment.startDate instanceof Date ? assignment.startDate : new Date(assignment.startDate);
        const end = assignment.endDate instanceof Date ? assignment.endDate : new Date(assignment.endDate);
        
        const startStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endStr = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        // Sanitize description (remove commas, semicolons, etc. that might break the ICS format)
        const sanitizedDesc = assignment.description
          .replace(/\\n/g, '\\n')
          .replace(/,/g, '\\,')
          .replace(/;/g, '\\;');
        
        const event = [
          'BEGIN:VEVENT',
          `UID:${Math.random().toString(36).substring(2)}@vit-assignments`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTSTART:${startStr}`,
          `DTEND:${endStr}`,
          `SUMMARY:${assignment.title}`,
          `DESCRIPTION:${sanitizedDesc}`,
          'END:VEVENT'
        ];
        
        icsContent = [...icsContent, ...event];
      });
      
      // Close the calendar
      icsContent.push('END:VCALENDAR');
      
      // Create a blob and download link
      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vit_assignments.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error creating calendar events:', error);
      return false;
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
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #4285f4; }
            .assignment { margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .assignment h2 { margin-top: 0; font-size: 18px; }
            .btn { display: inline-block; background: #4285f4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
            .instructions { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .add-all { margin: 20px 0; text-align: center; }
            .add-all .btn { background: #0f9d58; font-size: 16px; padding: 12px 24px; }
            .progress { margin-top: 20px; }
            .progress-bar { background: #f0f0f0; border-radius: 4px; height: 10px; overflow: hidden; }
            .progress-fill { background: #4285f4; height: 100%; width: 0; transition: width 0.3s; }
            .status { text-align: center; margin-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>VIT Assignment Calendar</h1>
          <div class="instructions">
            <p><strong>Instructions:</strong> Click on "Add to Calendar" for each assignment to add them to your Google Calendar. 
            The first assignment will open automatically. After adding it, come back to this page to add the remaining assignments.</p>
          </div>
          
          <div class="progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="status" id="status">Ready to add assignments</div>
          </div>
      `;
      
      // Generate a section for each assignment
      assignments.forEach((assignment, index) => {
        try {
          // Ensure we're working with Date objects
          const startDate = assignment.startDate instanceof Date ? assignment.startDate : new Date(assignment.startDate);
          const endDate = assignment.endDate instanceof Date ? assignment.endDate : new Date(assignment.endDate);
          
          const calendarUrl = this.createGoogleCalendarEvent(
            assignment.title,
            assignment.description,
            startDate,
            endDate
          );
          
          if (calendarUrl) {
            htmlContent += `
              <div class="assignment" id="assignment-${index}">
                <h2>${assignment.title}</h2>
                <p>${assignment.description.replace(/\n/g, '<br>')}</p>
                <p><strong>Date:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
                <a href="${calendarUrl}" target="_blank" class="btn" id="link-${index}" onclick="updateProgress(${index}, ${assignments.length})">Add to Calendar</a>
              </div>
            `;
          }
        } catch (err) {
          console.error('Error creating calendar entry:', err);
        }
      });
      
      // Add JavaScript to track progress and open the first link
      htmlContent += `
          <script>
            // Open the first calendar link automatically
            window.onload = function() {
              const links = document.querySelectorAll('.btn');
              if (links.length > 0) {
                links[0].click();
              }
            };
            
            // Function to update progress bar
            function updateProgress(index, total) {
              const progressFill = document.getElementById('progressFill');
              const statusEl = document.getElementById('status');
              const percent = Math.round(((index + 1) / total) * 100);
              
              progressFill.style.width = percent + '%';
              statusEl.textContent = 'Added ' + (index + 1) + ' of ' + total + ' assignments';
              
              // Mark this assignment as added
              const assignmentEl = document.getElementById('assignment-' + index);
              if (assignmentEl) {
                assignmentEl.style.backgroundColor = '#f0f8ff';
                assignmentEl.style.borderColor = '#a7d8ff';
              }
              
              // Highlight the next assignment
              if (index + 1 < total) {
                const nextAssignment = document.getElementById('assignment-' + (index + 1));
                if (nextAssignment) {
                  nextAssignment.style.backgroundColor = '#fffaf0';
                  nextAssignment.style.borderColor = '#ffe7a0';
                  
                  // Scroll to the next assignment
                  setTimeout(() => {
                    nextAssignment.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 500);
                }
              } else {
                statusEl.textContent = 'All assignments added to calendar!';
                statusEl.style.color = '#0f9d58';
                statusEl.style.fontWeight = 'bold';
              }
            }
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
