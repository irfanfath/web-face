// /* eslint-disable react/prop-types */

// type WasmFeatureDetect = {
//     bigInt: () => Promise<boolean>;
//     bulkMemory: () => Promise<boolean>;
//     exceptions: () => Promise<boolean>;
//     multiValue: () => Promise<boolean>;
//     mutableGlobals: () => Promise<boolean>;
//     referenceTypes: () => Promise<boolean>;
//     saturatedFloatToInt: () => Promise<boolean>;
//     signExtensions: () => Promise<boolean>;
//     simd: () => Promise<boolean>;
//     tailCall: () => Promise<boolean>;
//     threads: () => Promise<boolean>;
//   };
  
//   const WasmFeatureDetectComponent: WasmFeatureDetect = {
//     bigInt: async () => {
//       try {
//         return (
//           (await WebAssembly.instantiate(
//             new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 126, 1, 126, 3, 2, 1, 0, 7, 5, 1, 1, 98, 0, 0, 10, 6, 1, 4, 0, 32, 0, 11])
//           )).instance.exports.b(BigInt(0)) === BigInt(0)
//         );
//       } catch (e) {
//         return false;
//       }
//     },
//     bulkMemory: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     exceptions: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     multiValue: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     mutableGlobals: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     referenceTypes: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     saturatedFloatToInt: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     signExtensions: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     simd: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     tailCall: async () => WebAssembly.validate(new Uint8Array([/* ... your array here */])),
//     threads: async () => {
//       try {
//         return (
//           "undefined" != typeof MessageChannel &&
//           new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),
//           WebAssembly.validate(new Uint8Array([/* ... your array here */]))
//         );
//       } catch (e) {
//         return false;
//       }
//     },
//   };
  
//   export default WasmFeatureDetectComponent;
  