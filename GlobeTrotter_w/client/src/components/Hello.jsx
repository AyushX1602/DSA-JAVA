import { useFetchHello } from '@/hooks/react-query/use-hello-api';

const Hello = () => {
  const { data: hello, isLoading } = useFetchHello();

  if (isLoading) return <div>Loading...</div>;
  return <div>{hello}!</div>;
};

export default Hello;
