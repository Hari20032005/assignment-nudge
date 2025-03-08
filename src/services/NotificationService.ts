
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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
  
  static addMultipleEventsToCalendar(assignments: { title: string, description: string, startDate: Date, endDate: Date }[]) {
    if (assignments.length === 0) return false;
    
    // For the first assignment, create a direct calendar link
    const firstAssignment = assignments[0];
    const firstCalendarUrl = this.createGoogleCalendarEvent(
      firstAssignment.title,
      firstAssignment.description,
      firstAssignment.startDate,
      firstAssignment.endDate
    );
    
    if (!firstCalendarUrl) {
      return false;
    }
    
    // If there's only one assignment, just open it directly
    if (assignments.length === 1) {
      window.open(firstCalendarUrl, '_blank');
      return true;
    }
    
    // For multiple assignments, create a helper page to guide the user
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Adding Assignments to Google Calendar</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6; }
          .progress { margin: 20px 0; }
          .progress-bar { background: #f0f0f0; border-radius: 4px; height: 10px; overflow: hidden; }
          .progress-fill { background: #4285f4; height: 100%; width: 0; transition: width 0.3s; }
          .status { margin-top: 10px; font-size: 14px; }
          h1 { color: #4285f4; }
          .instructions { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .assignment { margin-bottom: 10px; }
          .warning { background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
          .button { background: #4285f4; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
          .button:hover { background: #3367d6; }
        </style>
      </head>
      <body>
        <h1>Adding Assignments to Google Calendar</h1>
        
        <div class="warning">
          <strong>Important:</strong> Your browser may have blocked popups. Please make sure to allow popups for this site.
        </div>
        
        <div class="instructions">
          <p><strong>Do not close this window</strong> until all assignments are added.</p>
          <p>Google Calendar tabs will open automatically in sequence. For each new tab:</p>
          <ol>
            <li>Click "Add" or "Save" in Google Calendar</li>
            <li>Close that tab to continue the process</li>
          </ol>
        </div>
        
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="status" id="status">Ready to add ${assignments.length} assignments...</div>
        </div>
        
        <button id="startButton" class="button">Start Adding Assignments</button>
        
        <div id="assignmentList">
          <h3>Assignments to be added:</h3>
    `;
    
    // List the assignments
    assignments.forEach((assignment, index) => {
      htmlContent += `
        <div class="assignment" id="assignment-${index}">
          ${index + 1}. ${assignment.title.replace('Assignment Reminder: ', '')} (${new Date(assignment.startDate).toLocaleDateString()})
        </div>
      `;
    });
    
    // Add script to handle opening calendar tabs sequentially
    htmlContent += `
        </div>
        
        <script>
          const assignments = ${JSON.stringify(assignments, (key, value) => {
            // Convert dates to ISO strings
            if (value instanceof Date) {
              return value.toISOString();
            }
            return value;
          })};
          
          let currentIndex = -1; // We'll start with the first assignment when user clicks the button
          const totalAssignments = assignments.length;
          let userClickedStart = false;
          
          function updateProgress() {
            const progressFill = document.getElementById('progressFill');
            const statusEl = document.getElementById('status');
            const percent = Math.round(((currentIndex + 1) / totalAssignments) * 100);
            
            progressFill.style.width = percent + '%';
            
            if (currentIndex < 0) {
              statusEl.textContent = 'Ready to add ' + totalAssignments + ' assignments...';
            } else if (currentIndex >= totalAssignments) {
              statusEl.textContent = 'All assignments added to calendar!';
              statusEl.style.fontWeight = 'bold';
              statusEl.style.color = '#0f9d58';
            } else {
              statusEl.textContent = 'Adding ' + (currentIndex + 1) + ' of ' + totalAssignments + ' assignments...';
            }
            
            // Mark assignment as being processed
            if (currentIndex >= 0 && currentIndex < totalAssignments) {
              document.querySelectorAll('.assignment').forEach(el => {
                el.style.fontWeight = 'normal';
                el.style.color = 'inherit';
              });
              
              const assignmentEl = document.getElementById('assignment-' + currentIndex);
              if (assignmentEl) {
                assignmentEl.style.fontWeight = 'bold';
                assignmentEl.style.color = '#4285f4';
              }
            }
          }
          
          function openNextCalendarEvent() {
            currentIndex++;
            
            if (currentIndex < totalAssignments) {
              const assignment = assignments[currentIndex];
              
              // Parse saved ISO date strings back to Date objects
              const startDate = new Date(assignment.startDate);
              const endDate = new Date(assignment.endDate);
              
              // Format dates for Google Calendar URL
              const startIso = startDate.toISOString().replace(/-|:|\\.\\d+/g, '');
              const endIso = endDate.toISOString().replace(/-|:|\\.\\d+/g, '');
              
              // Build Google Calendar URL
              const url = 'https://calendar.google.com/calendar/render' +
                '?action=TEMPLATE' +
                '&text=' + encodeURIComponent(assignment.title) +
                '&details=' + encodeURIComponent(assignment.description) +
                '&dates=' + startIso + '/' + endIso;
              
              // Open Google Calendar in new tab
              const calWindow = window.open(url, '_blank');
              
              if (!calWindow) {
                alert('Popup blocked! Please allow popups for this site and try again.');
                document.getElementById('startButton').style.display = 'block';
                currentIndex--; // Reset so we can try again
                updateProgress();
                return;
              }
              
              updateProgress();
              
              // Check every second if the calendar tab was closed, then open the next one
              const checkInterval = setInterval(() => {
                if (document.hasFocus()) {
                  clearInterval(checkInterval);
                  setTimeout(openNextCalendarEvent, 500); // Wait a bit before opening the next tab
                }
              }, 1000);
            } else {
              // All assignments have been processed
              updateProgress();
              document.getElementById('startButton').style.display = 'none';
            }
          }
          
          // Initialize progress display
          updateProgress();
          
          // Start the process when the user clicks the button
          document.getElementById('startButton').addEventListener('click', function() {
            userClickedStart = true;
            this.style.display = 'none';
            openNextCalendarEvent();
          });
        </script>
      </body>
      </html>
    `;
    
    // Create a blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open the helper page in a new tab
    const helperWindow = window.open(url, '_blank');
    
    // Check if the window was successfully opened
    if (helperWindow === null) {
      console.error('Pop-up was blocked. Please allow pop-ups for this site.');
      return false;
    }
    
    return true;
  }
}
