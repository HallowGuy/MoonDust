// utils/navUtils.js
export const flattenNav = (items, acc = []) => {
  items.forEach((item) => {
    if (item.items) {
      flattenNav(item.items, acc)
    } else if (item.to) {
      acc.push({ name: item.name, to: item.to })
    }
  })
  return acc
}
