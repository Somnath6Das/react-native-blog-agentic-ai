import api from "./api"; // adjust path as needed
import { Blog } from "./get_public_blogs";

export const getBlogById = async (blogId: number): Promise<Blog> => {
  const response = await api.get<Blog>(`/public/single/${blogId}`);
  return response.data;
};
