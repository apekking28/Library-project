/*
Diberikan contoh sebuah kalimat, silahkan cari kata terpanjang dari kalimat tersebut, jika ada kata dengan panjang yang sama silahkan ambil salah satu

contoh : 
const sentence = "Saya sangat senang mengerjakan soal algoritma"

longest(sentence) 
// mengerjakan: 11 character

*/

const maxWordlength = (str) => {
  let words = str.split(" ");
  let max = 0;

  for (const word of words) {
    if (word.length > max) {
      max = word.length;
    }
  }
  return max;
};

console.log(maxWordlength("Saya sangat senang mengerjakan soal algoritma")); // 11
