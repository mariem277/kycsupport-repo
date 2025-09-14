import axios from 'axios';

const API_URL = '/api/admin/users';

export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data;
};

export const createUser = async (user: any) => {
  const response = await axios.post(API_URL, user);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  await axios.delete(`${API_URL}/${userId}`);
};
