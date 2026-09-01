/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pg', 'pdf-parse', 'pdfjs-dist'],
};

module.exports = nextConfig;
