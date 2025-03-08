
// Google Calendar API batch processing utility
// Documentation: https://developers.google.com/calendar/api/guides/batch

// Base URL for Google Calendar API
const CALENDAR_API_BASE_URL = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_BATCH_ENDPOINT = 'https://www.googleapis.com/batch/calendar/v3';

// Helper to generate a unique boundary string for multipart requests
const generateBoundary = () => {
  return 'batch_' + Math.random().toString(36).substring(2);
};

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  colorId?: string; // Optional color ID (1-11) for the event
}

// Create a single Google Calendar event request (used within batch)
const createSingleEventRequest = (event: CalendarEvent, requestId: number) => {
  const calendarEvent = {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: event.startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: event.endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    colorId: event.colorId || '9', // Default to blue (9) if not specified
    reminders: {
      useDefault: true
    }
  };

  return {
    requestId: `${requestId}`,
    method: 'POST',
    url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    headers: {
      'Content-Type': 'application/json'
    },
    body: calendarEvent
  };
};

// Create a URL to add a single event (fallback method)
export const createSingleEventUrl = (event: CalendarEvent): string => {
  try {
    // Format dates for Google Calendar URL
    const startIso = event.startDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endIso = event.endDate.toISOString().replace(/-|:|\.\d+/g, '');

    // Encode the event parameters
    const eventParams = {
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      dates: `${startIso}/${endIso}`
    };

    // Construct the Google Calendar URL
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const queryString = Object.entries(eventParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${baseUrl}?${queryString}`;
  } catch (error) {
    console.error('Error creating Google Calendar event URL:', error);
    return '';
  }
};

// Generate the helper page for manual sequential addition
export const createHelperPage = (events: CalendarEvent[]): string => {
  if (events.length === 0) return '';

  const calendarUrls = events.map(event => createSingleEventUrl(event));
  
  // HTML and JavaScript for the helper page
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Adding Assignments to Google Calendar</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 700px; margin: 0 auto; line-height: 1.6; }
        .progress { margin: 20px 0; }
        .progress-bar { background: #f0f0f0; border-radius: 4px; height: 10px; overflow: hidden; }
        .progress-fill { background: #4285f4; height: 100%; width: 0; transition: width 0.3s; }
        .status { margin-top: 10px; font-size: 14px; }
        h1 { color: #4285f4; }
        .instructions { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .assignment { margin-bottom: 10px; padding: 8px; border-radius: 4px; }
        .assignment-pending { background: #f0f0f0; }
        .assignment-current { background: #e8f0fe; border-left: 3px solid #4285f4; }
        .assignment-complete { background: #e6f4ea; color: #137333; }
        .warning { background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
        .button { background: #4285f4; color: white; border: none; padding: 10px 18px; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .button:hover { background: #3367d6; }
        .btn-container { margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>Adding Assignments to Google Calendar</h1>
      
      <div class="warning">
        <strong>Important:</strong> Your browser may block popups. Please allow popups for this site to add all assignments.
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
        <div class="status" id="status">Ready to add ${events.length} assignments...</div>
      </div>
      
      <div class="btn-container">
        <button id="startButton" class="button">Start Adding Assignments</button>
      </div>
      
      <div id="assignmentList">
        <h3>Assignments to be added:</h3>
  `;
  
  // List the assignments
  events.forEach((event, index) => {
    const title = event.title.replace('Assignment Reminder: ', '');
    htmlContent += `
      <div class="assignment assignment-pending" id="assignment-${index}">
        ${index + 1}. ${title} (${event.startDate.toLocaleDateString()})
      </div>
    `;
  });
  
  // Add script to handle opening calendar tabs sequentially
  htmlContent += `
      </div>
      
      <script>
        const calendarUrls = ${JSON.stringify(calendarUrls)};
        const events = ${JSON.stringify(events, (key, value) => {
          // Convert dates to ISO strings
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        })};
        
        let currentIndex = -1;
        const totalEvents = events.length;
        
        function updateProgress() {
          const progressFill = document.getElementById('progressFill');
          const statusEl = document.getElementById('status');
          const percent = Math.round(((currentIndex + 1) / totalEvents) * 100);
          
          progressFill.style.width = percent + '%';
          
          if (currentIndex < 0) {
            statusEl.textContent = 'Ready to add ' + totalEvents + ' assignments...';
          } else if (currentIndex >= totalEvents) {
            statusEl.textContent = 'All assignments added to calendar!';
            statusEl.style.fontWeight = 'bold';
            statusEl.style.color = '#0f9d58';
          } else {
            statusEl.textContent = 'Adding ' + (currentIndex + 1) + ' of ' + totalEvents + ' assignments...';
          }
          
          // Reset all assignment classes
          document.querySelectorAll('.assignment').forEach(el => {
            el.className = 'assignment assignment-pending';
          });
          
          // Mark assignments as processed or current
          for (let i = 0; i < totalEvents; i++) {
            const assignmentEl = document.getElementById('assignment-' + i);
            if (i < currentIndex) {
              assignmentEl.className = 'assignment assignment-complete';
            } else if (i === currentIndex) {
              assignmentEl.className = 'assignment assignment-current';
            }
          }
        }
        
        function openNextCalendarEvent() {
          currentIndex++;
          
          if (currentIndex < totalEvents) {
            const url = calendarUrls[currentIndex];
            
            if (!url) {
              alert('Error creating calendar URL');
              return;
            }
            
            // Open Google Calendar in new tab
            const calWindow = window.open(url, '_blank');
            
            if (!calWindow) {
              alert('Popup blocked! Please allow popups for this site and try again.');
              document.getElementById('startButton').style.display = 'inline-block';
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
          this.style.display = 'none';
          openNextCalendarEvent();
        });
      </script>
    </body>
    </html>
  `;
  
  return htmlContent;
};

// Create a blob URL for the helper page
export const createHelperPageUrl = (events: CalendarEvent[]): string => {
  const htmlContent = createHelperPage(events);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
};
