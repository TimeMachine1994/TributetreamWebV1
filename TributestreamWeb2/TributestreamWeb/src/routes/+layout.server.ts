import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ data }) => {
 
  return { user: data.user }; // Pass data to the layout
};