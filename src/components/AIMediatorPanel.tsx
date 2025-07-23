
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AIMediatorPanelProps {
  sessionStatus: string;
  aiSummary: string;
  messageCount: number;
}

export default function AIMediatorPanel({ 
  sessionStatus, 
  aiSummary, 
  messageCount 
}: AIMediatorPanelProps) {
  const getProgressSteps = () => {
    const steps = [
      { label: "Parties joined session", completed: true },
      { label: "Gathering perspectives", completed: messageCount > 0 },
      { label: "Identify common ground", completed: messageCount > 5 },
      { label: "Propose settlement", completed: sessionStatus === 'completed' },
    ];
    return steps;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            AI Mediator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">{aiSummary}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Session Progress</h4>
            <div className="space-y-2">
              {getProgressSteps().map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={step.completed ? '' : 'opacity-50'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {sessionStatus === 'completed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 bg-green-50 rounded-lg border border-green-200 text-center"
            >
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-800">Settlement Reached!</p>
              <Button className="mt-3 w-full" variant="default">
                Review Agreement
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            Request AI Summary
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            Suggest Break
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            End Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
