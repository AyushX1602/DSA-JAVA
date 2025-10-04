import axiosClient from '@/lib/axios-client';

export const communityApi = {
  getMessages: ({ page = 1, limit = 50 } = {}) =>
    axiosClient.get(`/community/messages?page=${page}&limit=${limit}`),

  getMessage: (id) => axiosClient.get(`/community/messages/${id}`),

  createMessage: (data) => axiosClient.post('/community/messages', data),

  deleteMessage: (id) => axiosClient.delete(`/community/messages/${id}`),
};
