import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { helloApi } from '@/api/hello';

export const useFetchHello = () =>
  useQuery({
    queryKey: [QUERY_KEYS.HELLO],
    queryFn: helloApi.hello,
  });
