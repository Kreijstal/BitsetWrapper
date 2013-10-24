var bitsetWrapper = function () {

  function GetJavaScriptWordSize() {
    var bits = 1; //Get's the engine word size, this limits the length of the integers.
    var prev = 0;
    var sumM1 = 1;
    var sum = 2;
    while (sumM1 < sum) {
      bits++;
      prev = sum;
      sumM1 = sumM1 + sum;
      sum = sumM1 + 1;
    }
    return bits - 1;
  }

  function byteConcantenation(BASE) { //It has unnamed arguments!
    //BASE is not numerical base, is byte base.
    //This concantenates bits (values) and attempts to get a value from it. For example 255 and 255 would give 65535 if base 8 of course.
    //It will cast mod 2^BASE-1 to argument values
    for (var i = arguments.length - 1, value = 0, r = 0; 0 < i; i--, r++) {
      value += leftShiftNumber(arguments[i] % (Math.pow(2, BASE)), r * 8);
      //console.log('I am called',arguments[i]%(Math.pow(2,BASE)),r*8);
    }
    return value;
  }



  function splitNumberIntoBytes(number, offset, BASE) {
    BASE = BASE || 8;
    offset |= 0;
    number |= 0;
if(number===0)return [0];
    var numberArray = [],
      i = Math.floor(Math.log(number) * Math.LOG2E) + 1;
    offset += (BASE - i) > 0 ? BASE - i : 0;
    i += offset;
    for (var s = 8 - (i) % 8; i > 0; i -= 8) {
      //console.log(Math.floor(Math.log(number)*Math.LOG2E)+1+offset)
      //console.log(rightShiftNumber(number,i-8<0?0:i-8),rightShiftNumber(number,i-8<0?0:i-8)&(i>=8?generateOnesByLength(8):generateOnesByLength(i)),i,i>=8?generateOnesByLength(8):generateOnesByLength(i))
      numberArray.push(rightShiftNumber(number, (i - 8 < 0 ? 0 : i - 8)) & (i >= 8 ? generateOnesByLength(8) : generateOnesByLength(i)));
    }
    numberArray[numberArray.length - 1] <<= s % 8;
    return numberArray;
  }


  function generateOnesByLength(n) { //Attempts to generate a binary number full of ones given a length..
    //This function is really dumb perhaps there's a faster way or something..?
    var x = 0;
    for (var i = 0; i < n; i++) {
      x <<= 1;
      x |= 1; //I don't know if this is performant faster than Math.pow but seriously I don't think I'll need Math.pow, do I?
    }
    return x;
  }

  function leftShiftNumber(number, shiftIndex, PRENUMBER) { //a FAKE << operator because << doesn't support BIG values or values higuer than 2^30
    //PRENUMBER is a secret argument which can take 0 or 1 if 0 it fills the bits with zeros, with 1 it fills the bits with ones
    //shiftIndex shouldn't be higuer than The JavaScript Enigne word size
    //Did you guys know that bit shifting is actually just simply a multiplication by two? 11*10=110 //This is true in binary, tertiary, hexal, decimal, hexadecimal, etc.. 
    return number * Math.pow(2, shiftIndex) + (PRENUMBER ? Math.pow(2, shiftIndex) : 0); //Wasn't it clear enough?
  }

  function rightShiftNumber(number, shiftIndex) { //The exact opposite of above.
    return Math.floor(number / Math.pow(2, shiftIndex));
  }



  function generateReverseOnesByLength(n) { //Won't throw errors, beware.
    return generateOnesByLength(n) << 8 - n;
  }

  function ByteSplice(byte, index, length) { //You should infer what this does.
    //Numbers are immutable so it won't modify parent.. not that it matters.
    //This won't throw errors, so you should be careful with the input.
    if (0 > index) { //I wish I didn't had to do this.
      index = 8 + index; //But I must support everyone will to don't think by themselves. Wait.. this is a private function...
    }
    if (length !== 0) { //I h8 JS
      length = length || 8 - index;
    }
    byte &= generateOnesByLength(8 - index); //Killin first bytes
    return byte >> (8 - index) - length;
  }

  function convertBinaryArrayTo8bitArray(arr, epicOffset) { //It will attempt to convert an Array
    var newarr = [],
      remainingArray = arr.splice(0),
      currArray = [],
      currNumber = 0;
    remainingArray = (new Array(epicOffset | 0)).concat(remainingArray);
    while (remainingArray.length) {
      currArray = remainingArray.splice(0, 8);
      currNumber = 0;
      for (var i = 0; i < 8; i++) {
        var x = (currArray[i] % 2) | 0; //Undefined, Null or any other thing will be 0
        currNumber |= x << (7 - i);
      }
      newarr.push(currNumber);
    }
    return newarr;
  }


  function $_Uint1Array(typedarr, gffLength) { //friends with Uint8Array, not an actual array though, length shouldn't be modified, a complete mess, but hey... it's easier.. In a way


    //This actually attempts to support bytes with non-8 bits.
    var buff, ui8, l, TheJavaScriptEnignewordsize = GetJavaScriptWordSize();



    //START
    if (typedarr.length && typedarr.constructor !== ArrayBuffer) { //Please don't enter any DOM objects you plebs
      this.length = typedarr.length;
      ui8 = new Uint8Array(convertBinaryArrayTo8bitArray(typedarr));
    } else if (!isNaN(typedarr)) {
      ui8 = new Uint8Array(Math.ceil(typedarr / 8));
      this.length = typedarr;
    } else {
      ui8 = new Uint8Array((typedarr.constructor === ArrayBuffer) ? typedarr : null); //This will throw error if any of you put objects that you shouldn't, that should teach you.
      this.length = ui8.length;
    }
    this.length = gffLength || this.length; //Hmhm that seems reasonable.
    this.getByteArray = function () {
      return ui8;
    }
    this.subarray = function (a, b) { //b is absolute.
      //This function doesn't modify the this object, it creates a new one.
      b = Math.ceil(b || this.length);
      var c = Math.floor(a / 8),
        d = Math.ceil(b / 8),
        $length = (Math.ceil((b - a) / 8)), //Yeah, now it's relative.
        u = new Uint8Array($length),
        usedArr = ui8.subarray(c, d);
      for (var i = 0, l = u.length; i < l; i++) {
        u[i] = ByteSplice(usedArr[i], a % 8) << a % 8;
        //console.log(u[i],"FIRST",b%8);
        if (!isNaN(usedArr[i + 1])) u[i] |= ByteSplice(usedArr[i + 1], 0, a % 8);
        //console.log(u[i],"SECOND");
      }
      //console.log((b-a)%8);
      //Buggy Prone!
      //Should be tested a lot!
      if (b % 8 && (b - a) % 8) {
        u[i - 1] = ByteSplice(u[i - 1], 0, (b - a) % 8) << (8 - (b - a) % 8);
      } //Lel
      //console.log(u,i,usedArr);
      return new $_Uint1Array(u.buffer, b - a);
    }

    //this funtion is also untested
    this.subNumberValue = function (a, b, c) { //b is relative
      c |= 0; //if c is undefined it defaults to 0.
      //So what is c? c is the value the offsets should be, or the value that is outside this.length
      //gets the value from a with the bit length b, will not work correctly if b is larger than The JavaScript Enigne word size
      var f = this.subarray(a, a + b),
        n = [8];
      for (var i = 0, x = f.getByteArray(), l = x.length; i < l; i++) {
        n.push(x[i]);
      }
      //console.log(byteConcantenation.apply(this,n),Math.pow(2,(8-(b%8))%8),n)
      if (a + b > this.length) {
        (a + b) - this.length;
      }
      return Math.floor(byteConcantenation.apply(this, n) / Math.pow(2, (8 - (b % 8)) % 8)); //MAGIC
    }

    this.valueOf = function (i) { //replacement of arr[i], it will be harder but, meh worth it.
      i |= 0;
      if (i < 0 || i >= this.length) {
        return undefined;
      }
      return ByteSplice(ui8[Math.floor(i / 8)], i % 8, 1); //That was easier than I expected it
    }


    this.set = function (sset, lindex) {
      lindex |= 0;
      if (sset.length + lindex > this.length) {
        throw new RangeError("Index is out of range. Why don't you try concantenating them..?")
      }
      var ar = convertBinaryArrayTo8bitArray(sset, lindex % 8);
      console.log(ar, lindex, ui8[Math.floor(lindex / 8)], generateReverseOnesByLength(lindex % 8))
      ar[0] = ui8[Math.floor(lindex / 8)] & generateReverseOnesByLength(lindex % 8) | ar[0];
      ui8.set(ar, Math.floor(lindex / 8));
    }

    //finally
    this.byteSet = function (sset, lindex, BYTEBASE) { //OH GAWD//BYTEBASE IS 8!!! But.. what if.. what if the BYTEBASE WASN'T 8 AT ALL??
      lindex |= 0;
      BYTEBASE |= 0;
      BYTEBASE = BYTEBASE || 8; //BYTEBASE CAN'T BE ZERO!
      var TheResultingArray = [],
        index = lindex % 8,
        currentBytes = [];

      for (var i = 0, l = sset.length; i < l; i++) {
        //console.log(TheResultingArray,index,currentBytes)
        currentBytes = splitNumberIntoBytes(sset[i], index, BYTEBASE);
//console.log("splitNumberIntoBytes(sset[i], index, BYTEBASE)",splitNumberIntoBytes(sset[i], index, BYTEBASE));
        index = (index + BYTEBASE) % 8;
        if (TheResultingArray.length&&index) {
          TheResultingArray[TheResultingArray.length - 1] |= currentBytes.shift();
        }
        TheResultingArray = TheResultingArray.concat(currentBytes);
      }
      //console.log(TheResultingArray)
      ui8.set(TheResultingArray, lindex);
      return this;
    }


    this.getSplitValueBy = function (leNumber, index) { //THE FUN BEGINS NOW
      //I first thought of using this.subarray but then I realized that leNumber can be bigger than 8.
      leNumber |= 0;
      index |= 0;
      if (leNumber > TheJavaScriptEnignewordsize) {
        throw new RangeError("The byte length really, really shouldn't be higuer than The Browser Word Size (Or anything close to it)"); //Unless you have a big number library or something, but who the hell needs bytes longer than The JavaScript Enigne word size bits, do you really really want to have a byte with a max value of 2^(The JavaScript Enigne word size)-1??
      } else if (leNumber < 1) { //I was tempted to put leNumber<2 but then I reasoned with myself.
        throw new Error("You entered a value less than.. 1");
      } else {
        var RealLength = this.length - index,
          newBytesLength = Math.ceil(RealLength / leNumber),
          arrr = [];
        for (var i = 0; i < newBytesLength; i++) {
          arrr.push(this.subNumberValue((leNumber * i) + index, leNumber));
        }
        return arrr;
      }
    }
  }

  return $_Uint1Array;
}();
