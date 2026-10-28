import { sendTelegram } from './notify.js';

const ok = await sendTelegram('NetWatch টেস্ট মেসেজ');
console.log(ok ? 'পাঠানো হয়েছে' : 'পাঠানো যায়নি');