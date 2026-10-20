export const health = store => async (_req,res) => {
  await store.readProducts();
  res.json({status:'ok',database:'supabase'});
};
