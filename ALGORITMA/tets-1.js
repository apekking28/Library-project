/*
Terdapat string "NEGIE1", silahkan reverse alphabet nya dengan angka tetap diakhir kata Hasil = "EIGEN1"
 */

const reverseStr = (str) => {
  let word = str
    .substring(0, str.length - 1)
    .split("")
    .reverse()
    .join("");
  let number = str.substring(str.length - 1, str.length);
  return word + number;
};

console.log(reverseStr("NEGIE1")); // EIGEN1
