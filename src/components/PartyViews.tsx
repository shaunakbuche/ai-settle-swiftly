
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PartyViewsProps {
  partyAName: string;
  partyBName: string;
  currentUserRole: string;
  sessionStatus: string;
}

export default function PartyViews({ 
  partyAName, 
  partyBName, 
  currentUserRole,
  sessionStatus 
}: PartyViewsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Party A View */}
      <Card className={`${currentUserRole === 'party_a' ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            {partyAName}
            {currentUserRole === 'party_a' && (
              <Badge variant="outline" className="text-xs">You</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {currentUserRole === 'party_a' 
              ? "Share your perspective and concerns about the dispute."
              : sessionStatus === 'waiting' 
              ? "Waiting for them to join..."
              : "Participating in mediation"
            }
          </p>
        </CardContent>
      </Card>

      {/* Party B View */}
      <Card className={`${currentUserRole === 'party_b' ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            {partyBName}
            {currentUserRole === 'party_b' && (
              <Badge variant="outline" className="text-xs">You</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {currentUserRole === 'party_b' 
              ? "Share your perspective and concerns about the dispute."
              : sessionStatus === 'waiting' 
              ? "Waiting for them to join..."
              : "Participating in mediation"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
