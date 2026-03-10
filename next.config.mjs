// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js가 Prisma를 Edge나 브라우저용으로 잘못 번들링하지 않고,
  // Node.js 환경에서 원본 그대로 실행하도록 강제하는 설정입니다.
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
