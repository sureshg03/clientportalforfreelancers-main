// Quick script to populate dummy data from browser console
// Run this in the browser console after logging in:
//
// Option 1: Direct import
// import('./lib/dummyData.js').then(m => m.populateDummyData())
//
// Option 2: Using the utility
// (async () => {
//   const { populateDummyData } = await import('./lib/dummyData.js');
//   await populateDummyData();
// })()
//
// Option 3: Clear data first, then populate
// (async () => {
//   const { clearDummyData, populateDummyData } = await import('./lib/dummyData.js');
//   await clearDummyData();
//   await populateDummyData();
// })()

// For easy access in development, you can also use the Populate Data page at /populate-data

export {};