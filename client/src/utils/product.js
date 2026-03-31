export const getCategoryName = (product) =>
  product?.categoryRef?.name || product?.category || '';
