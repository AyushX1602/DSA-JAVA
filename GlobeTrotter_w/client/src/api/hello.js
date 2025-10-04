import axiosClient from '@/lib/axios-client';

const hello = () => axiosClient.get('hello');

export const helloApi = { hello };
