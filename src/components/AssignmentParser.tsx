
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseDate, calculateDaysLeft } from '@/utils/dateUtils';
import { Assignment } from '@/lib/types';
import { toast } from 'sonner';
import { Info, Clipboard, Sparkles } from 'lucide-react';

interface AssignmentParserProps {
  onAssignmentsParsed: (assignments: Assignment[]) => void;
}

export function AssignmentParser({ onAssignmentsParsed }: AssignmentParserProps) {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const parseAssignments = () => {
    if (!inputText.trim()) {
      toast.error('Please paste your assignment data');
      return;
    }

    setIsLoading(true);

    try {
      const lines = inputText.trim().split('\n');
      
      const assignments: Assignment[] = [];
      
      const startIndex = lines[0].includes('Sl.No') || lines[0].includes('SI.No') ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;
        
        const parts = line.split(/\t|  +/).filter(part => part.trim() !== '');
        
        console.log('Parsed line parts:', parts);
        
        if (parts.length >= 5 && /^\d+$/.test(parts[0].trim())) {
          let upcomingDues = parts[4];
          
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
            isCompleted: false
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
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/10 bg-gradient-to-b from-white to-primary/5 transition-all duration-300 animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-xl">Paste Your Assignment Data</CardTitle>
        <p className="text-center text-muted-foreground text-sm">Import your VIT assignments quickly and easily</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm border border-blue-100">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p><strong>Make sure you're using the ViBoot extension</strong> to access your VIT Student Portal. Copy data from your assignment table and paste it below.</p>
          </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Paste your assignment data here from ViBoot extension..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px] font-mono text-sm focus-ring resize-none border-primary/20"
          />
          <div className="absolute bottom-2 right-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
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
              title="Paste from clipboard"
            >
              <Clipboard className="h-4 w-4" />
              <span className="sr-only">Paste from clipboard</span>
            </Button>
          </div>
        </div>
        
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Assignment Format Example</span>
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden bg-gray-50">
          <img 
            src="/lovable-uploads/f3b838da-4f6a-4cdf-b319-35f056134a97.png" 
            alt="Assignment table example" 
            className="w-full h-auto"
          />
          <div className="p-2 bg-gray-50 text-xs text-muted-foreground">
            Example of VIT assignment table format from ViBoot extension
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center pb-6">
        <Button 
          onClick={parseAssignments} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 transition-all duration-300 px-8 gap-2"
          size="lg"
        >
          {isLoading ? 'Parsing...' : 'Parse Assignments'}
          <Sparkles className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
