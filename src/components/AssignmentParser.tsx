
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseDate, calculateDaysLeft } from '@/utils/dateUtils';
import { Assignment } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

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
      // Split the input text into lines
      const lines = inputText.trim().split('\n');
      
      // Process each line
      const assignments: Assignment[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Split the line by tabs or multiple spaces
        const parts = line.split(/\t|  +/);
        
        // Check if this looks like a valid assignment row (has at least 6 parts)
        if (parts.length >= 6 && /^\d+$/.test(parts[0])) {
          const dueDate = parseDate(parts[4]);
          const daysLeft = calculateDaysLeft(dueDate);
          
          assignments.push({
            id: `assignment-${i}`,
            slNo: parseInt(parts[0], 10),
            classNbr: parts[1],
            courseCode: parts[2],
            courseTitle: parts[3],
            upcomingDues: parts[4],
            dueDate,
            daysLeft,
            courseType: parts[5],
            facultyName: parts.length > 6 ? parts[6] : '',
            dashboard: parts.length > 7 ? parts[7] : '',
          });
        }
      }

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
      <CardContent>
        <Textarea
          placeholder="Paste your assignment data here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[200px] font-mono text-sm focus-ring"
        />
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
