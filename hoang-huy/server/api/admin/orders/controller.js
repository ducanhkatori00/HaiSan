export const listOrders = store => async (_req,res) => res.json(await store.listOrders());
export const updateOrder = store => async (req,res) => res.json(await store.updateOrderStatus(req.params.id,req.body?.status,req.body?.adminNote));
