import { RedisClient, type BunRequest } from 'bun'
import puppeteer, { Browser } from 'puppeteer-core';
import { randomBytes } from 'node:crypto';
import { createCA, createCert } from 'mkcert';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const host = 'web';

const ca = await createCA({
	organization: 'Paper',
	countryCode: 'CA',
	state: 'ON',
	locality: 'Toronto',
	validity: 365
});

await mkdir('/etc/opt/chrome/policies/managed/', { recursive: true });
await writeFile('/etc/opt/chrome/policies/managed/policy.json', JSON.stringify({
	'NetworkPredictionOptions': 2,
	'CACertificates': [
		ca.cert.replace('-----BEGIN CERTIFICATE-----', '')
			   .replace('-----END CERTIFICATE-----', '')
			   .replace(/\r\n/g, '')
	],
	'URLBlocklist': ['*'],
	'URLAllowlist': [`https://${host}`]
}));

const redis = new RedisClient('redis://redis:6379', { idleTimeout: 0, autoReconnect: true });

const visit = async (url: string) => {	
	await redis.set('browser_open', 'true');

	const secret = randomBytes(16).toString('hex');

	let browser: Browser | null = null;

	const userDataDir = await mkdtemp(join(tmpdir(), 'paper-'));
	try {
		browser = await puppeteer.launch({
			executablePath: '/usr/bin/google-chrome',
			args: [
				'--no-sandbox',
				'--disable-gpu',
				'--js-flags=--noexpose_wasm,--jitless',
				'--host-rules="MAP paper.local 127.0.0.1"'
			],
			headless: true,
			pipe: true,
			userDataDir
		});
		await browser.setCookie({
			name: 'secret',
			value: secret,
			domain: host,
			sameSite: 'Strict'
		});

		const page = await browser.newPage();
		await redis.set('secret', secret, 'EX', 60);
		await page.goto(url);
		await Bun.sleep(61000);
	} catch(e) {
		console.log(e);
	}

	try {
		if (browser) await browser.close();
	} catch(e) {};

	await rm(userDataDir, { recursive: true, force: true })

	await redis.del('secret');
	await redis.del('browser_open');
}

const headers = (type: string) => {
	return {
		headers: {
			'Content-Type': type,
			'Content-Security-Policy': [
				"default-src 'self' 'unsafe-inline'",
				"script-src 'none'"
			].join('; '),
			'X-Content-Type-Options': 'nosniff'
		}
	}
}

const routes = {
	'/': new Response(`
		<form action="/upload" method="POST" enctype="multipart/form-data">
			<input type="file" name="file">
			<input type="submit" value="upload">
		</form>
	`, headers('text/html')),

	'/upload': {
		POST: async (req: BunRequest): Promise<Response> => {
			let form: FormData;
			try {
				form = await req.formData();
			} catch(e) {
				return new Response('invalid upload!', headers('text/plain'));
			}
			const file = form.get('file');
			if (!file || !(file instanceof File) || !file.size || file.size > 2 ** 16) {
				return new Response('no file upload!', headers('text/plain'));
			}
			const id = await redis.incr('current-id');
			const data = JSON.stringify([file.type, (await file.bytes()).toBase64()]);
			await redis.set(`file|${id}`, data, 'EX', 10 * 60); // 10 minutes
			return Response.redirect(`/paper/${id}`);
		}
	},
	
	'/paper/:id': async (req: BunRequest<'/paper/:id'>): Promise<Response> => {
		const res = await redis.get(`file|${req.params.id}`);
		if (!res) {
			return new Response('not found!', headers('text/plain'));
		}
		const [type, data] = JSON.parse(res) as [string, string];
		return new Response(Buffer.from(data, 'base64'), headers(type));
	},

	'/secret': async (req: BunRequest): Promise<Response> => {
		const secret = req.cookies.get('secret') || '0123456789abcdef'.repeat(2);
		const payload = new URL(req.url, 'http://127.0.0.1').searchParams.get('payload') || '';

		return new Response(
			`<body secret="${secret}">${secret}\n${payload}</body>`,
			headers('text/html')
		);
	},

	'/flag': async (req: BunRequest): Promise<Response> => {
		const guess = new URL(req.url, 'http://127.0.0.1').searchParams.get('secret');
		const secret = await redis.getdel('secret');
		if (!secret) {
			return new Response('nice try', headers('text/plain'));
		}
		if (secret !== guess) {
			return new Response('wrong', headers('text/plain'));
		}
		return new Response(Bun.env.FLAG || 'picoctf{flag}', headers('text/plain'));
	},

	'/visit/:id': async(req: BunRequest<'/visit/:id'>): Promise<Response> => {
		if (await redis.get('browser_open')) {
			return new Response('browser still open!');
		}

		const res = await redis.get(`file|${req.params.id}`);
		if (!res) {
			return new Response('not found!', headers('text/plain'));
		}

		visit(`https://${host}/paper/${req.params.id}`)

		return new Response('visiting!', headers('text/plain'));
	}
}

const cert = await createCert({
	ca: { key: ca.key, cert: ca.cert},
	domains: [host],
	validity: 30
});

Bun.serve({
	port: 443,
	maxRequestBodySize: 2 ** 16,
	development: false,
	tls: {
		key: cert.key,
		cert: `${cert.cert}\n${ca.cert}`
	},
	routes,
});

console.log('Listening.');