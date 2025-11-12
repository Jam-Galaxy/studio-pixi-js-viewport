import { TimeSignature } from "@/Engine2D/interfaces/required/IGridProvider";

/**
 *
 * @param fractionalPart
 * @returns wholeSubdivisionPart: base subdivision of bar, mostSubdivisionString: string with subdivisions of wholeSubdivisionPart
 */
function getSubdivisions(fractionalPart: number, power: number, timeSignature: TimeSignature) {
  let quotient = fractionalPart;
  let mostSubdivisionString = "";
  for (let i = 1; i <= -power; i++) {
    let reminder1 = quotient % 2; // 2 is radix
    quotient = Math.floor(quotient / 2);
    reminder1 += 1;
    mostSubdivisionString = `.${reminder1}` + mostSubdivisionString;
  }
  const wholeSubdivisionPart = quotient % timeSignature.upper;
  return { wholeSubdivisionPart, mostSubdivisionString };
}

function formatString(isSubdivided: boolean, sign: number, wholePart: number, wholeSubdivisionPart?: number, mostSubdivisionString?: string): string {
  let formatedString: string;
  const signString = sign === -1 ? "-" : "";
  wholePart += 1;
  if (wholeSubdivisionPart !== undefined) {
    wholeSubdivisionPart += 1;
  }
  if (isSubdivided) {
    formatedString = `${signString}${wholePart}.${wholeSubdivisionPart}${mostSubdivisionString}`;
  } else {
    formatedString = `${signString}${wholePart}`;
  }
  return formatedString;
}

/**
 *
 * @param bar //in bars (0 is 0, 1 is 1 bar and so on).  counts from zero
 * @returns formattedBar examples:
 * (for 2/4 and more power) 1(bar).1(quarter).1(eighth) 1.1.2 1.2.1 1.2.2 2.1.1;
 * (for 3/4 and less power) 1.1 1.2 1.3 2.1 2.2 2.3 3.1 3.2 3.3
 * 1 2 3;
 * 1 3 5 7 9;
 * 1 5 9   
 */
export function formatBar(bar: number, timeSignature: TimeSignature, isSubdivided: boolean, power: number) {
  const sign = Math.sign(bar);
  bar = Math.abs(bar);
  let formatedString;

  if (isSubdivided) {
    const mostFractional = bar * timeSignature.upper * 2 ** -power;
    const mostFractionalRounded = Math.round(mostFractional);

    let wholePart = Math.floor(mostFractionalRounded / (timeSignature.upper * 2 ** -power));

    let fractionalPart = mostFractionalRounded - wholePart * timeSignature.upper * 2 ** -power;
    if (sign === -1) {
      if (fractionalPart) {
        fractionalPart = timeSignature.upper * 2 ** -power - fractionalPart;
      } else {
        wholePart -= 1;
      }
    }

    const { wholeSubdivisionPart, mostSubdivisionString } = getSubdivisions(fractionalPart, power, timeSignature);
    formatedString = formatString(isSubdivided, sign, wholePart, wholeSubdivisionPart, mostSubdivisionString);
  } else {
    if (sign === -1) {
      bar -= 1;
    }
    formatedString = formatString(isSubdivided, sign, bar);
  }
  return { formattedBar: formatedString };
}