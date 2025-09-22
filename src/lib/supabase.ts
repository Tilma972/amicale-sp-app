import type { Database } from '@/libs/supabase/types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Simple rate limiter wrapper around global fetch for requests to the Supabase host.
// This avoids hammering Supabase (useful during development/debug) by ensuring a
// minimum delay between outgoing requests to the Supabase origin.
const MIN_INTERVAL_MS = 200 // minimum ms between requests to Supabase (adjustable)
let _lastRequestAt = 0

const originalFetch = (globalThis as any).fetch

async function rateLimitedFetch(input: RequestInfo, init?: RequestInit) {
	try {
		const url = typeof input === 'string' ? input : (input as Request).url
		// Only rate-limit requests to the configured Supabase origin
		if (url && supabaseUrl && url.toString().includes(new URL(supabaseUrl).host)) {
			const now = Date.now()
			const delta = now - _lastRequestAt
			if (delta < MIN_INTERVAL_MS) {
				const wait = MIN_INTERVAL_MS - delta
				await new Promise((r) => setTimeout(r, wait))
			}
			_lastRequestAt = Date.now()
		}

		if (typeof originalFetch === 'function') {
			return originalFetch(input, init)
		}

		// Fallback to the global fetch if types differ
		return fetch(input as any, init as any)
	} catch (err) {
		// In case of any unexpected error in the wrapper, fall back to the native fetch
		return (originalFetch || fetch)(input as any, init as any)
	}
}

// Install the rate-limited fetch globally so the Supabase client uses it internally.
// This is intentionally applied in development to protect the Supabase project from
// accidental flooding while debugging. If you prefer to target only the Supabase
// client, we could instead pass a custom fetch to createClient if desired.
;(globalThis as any).fetch = rateLimitedFetch

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
	},
})
