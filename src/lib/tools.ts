export function idCounter(): () => number {
  let id = 0;
  return function newId(): number {
    id += 1;
    return id;
  };
}

export const newId = idCounter();
