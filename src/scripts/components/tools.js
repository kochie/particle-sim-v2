export function idCounter() {
  let id = 0;
  return function newId() {
    id += 1;
    return id;
  };
}

export const newId = idCounter();
