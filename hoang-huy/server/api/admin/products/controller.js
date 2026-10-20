export const listProducts = store => async (_req,res) => res.json(await store.readProducts());
export const updateProduct = store => async (req,res) => res.json(await store.updateProduct(req.params.id,req.body));
