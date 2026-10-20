export const listProducts = store => async (_req,res) => res.json(await store.readProducts());
