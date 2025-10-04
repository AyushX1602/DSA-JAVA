import { useSetAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { clearAuthStateAtom } from '@/lib/auth.atoms';

const LogoutButton = () => {
  const clear = useSetAtom(clearAuthStateAtom);
  return (
    <Button variant="secondary" onClick={() => clear()}>
      Logout
    </Button>
  );
};

export default LogoutButton;
