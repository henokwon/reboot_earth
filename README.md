# Earth Engine map application

[![CI](https://github.com/henokwon/reboot_earth/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/henokwon/reboot_earth/actions/workflows/ci.yml)

## Continuous integration

CI uses Node.js 22 and the npm lockfile to run credential-isolation tests, lint,
TypeScript checks and a Next.js production build on pull requests and pushes to
`master`. It requires no Earth Engine credentials.

Run the same checks locally:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run test:security
npm run lint
npx --no-install tsc --noEmit
npm run build
```

Tests mock Earth Engine; a passing build does not verify live provider access.
For runtime credentials and exposed-key revocation, see [SECURITY.md](SECURITY.md).

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
