
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseDate, calculateDaysLeft } from '@/utils/dateUtils';
import { Assignment } from '@/lib/types';
import { toast } from 'sonner';
import { Info, Clipboard } from 'lucide-react';

interface AssignmentParserProps {
  onAssignmentsParsed: (assignments: Assignment[]) => void;
}

export function AssignmentParser({ onAssignmentsParsed }: AssignmentParserProps) {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showExample, setShowExample] = useState<boolean>(false);

  const parseAssignments = () => {
    if (!inputText.trim()) {
      toast.error('Please paste your assignment data');
      return;
    }

    setIsLoading(true);

    try {
      // Split the input text into lines
      const lines = inputText.trim().split('\n');
      
      // Process each line
      const assignments: Assignment[] = [];
      
      // Skip the header row if it exists
      const startIndex = lines[0].includes('Sl.No') || lines[0].includes('SI.No') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Split the line by tabs or multiple spaces
        const parts = line.split(/\t|  +/).filter(part => part.trim() !== '');
        
        console.log('Parsed line parts:', parts);
        
        // Check if this looks like a valid assignment row (starts with a number)
        if (parts.length >= 5 && /^\d+$/.test(parts[0].trim())) {
          // Extract the date from the 'Upcoming Dues' column
          let upcomingDues = parts[4];
          
          // Get only the date part if it contains more information like days left
          const dueDate = parseDate(upcomingDues);
          const daysLeft = calculateDaysLeft(dueDate);
          
          assignments.push({
            id: `assignment-${i}`,
            slNo: parseInt(parts[0], 10),
            classNbr: parts[1],
            courseCode: parts[2],
            courseTitle: parts[3],
            upcomingDues: upcomingDues,
            dueDate,
            daysLeft,
            courseType: parts.length > 5 ? parts[5] : '',
            facultyName: parts.length > 6 ? parts[6] : '',
            dashboard: parts.length > 7 ? parts[7] : '',
          });
        }
      }

      console.log('Parsed assignments:', assignments);
      
      if (assignments.length === 0) {
        toast.error('No valid assignments found. Please check the format.');
      } else {
        onAssignmentsParsed(assignments);
        toast.success(`Successfully parsed ${assignments.length} assignments`);
        setInputText('');
      }
    } catch (error) {
      console.error('Error parsing assignments:', error);
      toast.error('Error parsing assignments. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center">Paste Your Assignment Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-md text-blue-800 text-sm">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p>Copy data from your VIT Student Portal assignment table and paste it below.</p>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-blue-600" 
              onClick={() => setShowExample(!showExample)}
            >
              {showExample ? "Hide example" : "Show example format"}
            </Button>
          </div>
        </div>

        {showExample && (
          <div className="border rounded-md overflow-hidden">
            <img 
              src="/lovable-uploads/7805c2a5-b494-45b1-9e82-925e2dc781b4.png" 
              alt="Assignment table example" 
              className="w-full h-auto" 
            />
            <div className="p-2 bg-gray-50 text-xs text-muted-foreground">
              Example of VIT assignment table format
            </div>
          </div>
        )}

        <Textarea
          placeholder="Paste your assignment data here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[200px] font-mono text-sm focus-ring"
        />
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 text-muted-foreground"
            onClick={() => {
              navigator.clipboard.readText()
                .then(text => {
                  setInputText(text);
                  toast.success("Clipboard content pasted");
                })
                .catch(err => {
                  console.error('Failed to read clipboard', err);
                  toast.error("Couldn't access clipboard");
                });
            }}
          >
            <Clipboard className="h-4 w-4" />
            Paste from clipboard
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={parseAssignments} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 transition-all duration-300"
        >
          {isLoading ? 'Parsing...' : 'Parse Assignments'}
        </Button>
      </CardFooter>
    </Card>
  );
}
