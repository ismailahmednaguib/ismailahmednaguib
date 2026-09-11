// lib/bcryptjs.d.ts : تعريف أنواع bcryptjs — يمنع خطأ TS7016 بدون تثبيت حزم إضافية
declare module "bcryptjs" {
  export function hash(data: string, saltOrRounds: number | string): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  const bcrypt: { hash: typeof hash; compare: typeof compare; genSalt: typeof genSalt };
  export default bcrypt;
}
