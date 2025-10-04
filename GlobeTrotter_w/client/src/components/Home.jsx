import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen text-center p-4 pt-55">
      <h1 className="text-6xl md:text-7xl font-bold mb-4">GlobeTrotter</h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-6">
        Your ultimate travel planning companion.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link to="/explore">Explore</Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
