export function getMaxNumberLength(a: string | number, b: string | number): number {
  return (a > b ? a : b).toString().length;
}

export function convertToReversePaddedArray(num: { toString: () => string }, length: number): number[] {
  const padStart = (str: string, targetLength: number): string => str.length < targetLength ? padStart("0" + str, targetLength) : str;
  const stringToNumberArray = (str: string): number[] => [...str].map(Number);
  return stringToNumberArray(padStart(num.toString(), length)).reverse();
};