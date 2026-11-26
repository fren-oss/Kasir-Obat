// Script untuk cek environment variable
console.log('=== Environment Variable Check ===');
console.log('VITE_SCRIPT_URL:', import.meta.env.VITE_SCRIPT_URL);
console.log('All env:', import.meta.env);
console.log('Has value:', !!import.meta.env.VITE_SCRIPT_URL);
console.log('=====================================');
