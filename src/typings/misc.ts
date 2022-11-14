export type Constructor<T> = new (...args: any[]) => T;

export type Constructors<T extends any[]> = [
  ...{
    [i in keyof T]: Constructor<T[i]>;
  }
];

export type Async<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;
