import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Mediation() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new structured dispute resolution
    if (sessionId) {
      navigate(`/dispute-resolution/${sessionId}`);
    } else {
      navigate('/dispute-resolution');
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Redirecting to dispute resolution...</p>
    </div>
  );
}