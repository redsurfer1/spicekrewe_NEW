# Stripe Elements in Capacitor — CORS configuration

## Issue

Capacitor apps run in a native webview with an origin such as `capacitor://localhost` (iOS) or `http://localhost` (Android). Stripe Elements loads iframes from `stripe.com`. Your SpiceKrewe API host must allow requests from these Capacitor origins when the app calls your backend from the webview.

## Required API CORS configuration

Add to deployment environment (example — adjust per hosting):

`MOBILE_CORS_ORIGINS=capacitor://localhost,http://localhost,https://www.spicekrewe.com`

In Laravel CORS middleware or `cors.php` config (if applicable):

`'allowed_origins' => array_filter(array_map('trim', explode(',', env('MOBILE_CORS_ORIGINS', ''))))`

For Next.js / edge middleware, mirror the same allowlist for `OPTIONS` and `Access-Control-Allow-Origin` as your architecture requires.

## Required `capacitor.config` entries

If the project uses `server.url` / `allowNavigation`, ensure Stripe domains are reachable from the webview:

```ts
server: {
  allowNavigation: [
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    '*.stripe.com',
  ],
}
```

(Exact keys depend on Capacitor version — verify against current Capacitor docs.)

## Testing

- **Development:** point `server.url` (if used) at a reachable dev API host (`http://192.168.x.x:3000` etc.).
- **Production:** point at `https://www.spicekrewe.com` (or final host) and confirm Stripe Elements loads and `create-intent` + `confirmPayment` succeed end-to-end.

---

*Operational note — not legal advice.*
