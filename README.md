BitsetWrapper
=============

A bit array wrapper over Uint8Array, edits bits, but is stored as a byte array.
The idea is that you use it as a bit array, you can also use it as a byte array of "any" type (until it reaaches max word size which for me is 53 bits)
So yeah you could convert bytes back and forth bases, Also since it's based in Uint8Array, It's typed, therefore it won't change length as easily.
You will have to concantenate it, it also has "useful" comments of why some thnigs exists, It's nice.

