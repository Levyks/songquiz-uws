export function arrayOfLength<T = number>(
  length: number,
  callback: (index: number) => T = (i) => i as unknown as T
): T[] {
  return Array.from({ length }, (_, i) => callback(i));
}

export function randomElementWithIndex<T>(array: T[]): [T, number] {
  const index = Math.floor(Math.random() * array.length);
  return [array[index], index];
}

export function randomElement<T>(array: T[]): T {
  return randomElementWithIndex(array)[0];
}

export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
