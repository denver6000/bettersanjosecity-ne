<?php
/**
 * Live weather station proxy for KloudTrack (https://api.kloudtechsea.com/api/v1).
 *
 * The site is a static export, so this is the only server-side piece: it keeps
 * KCLOUD_API_KEY off the browser and caches KloudTrack's response for CACHE_TTL
 * seconds. The account allows 20 requests a minute shared by everything using the
 * key, so however many visitors there are, this sends at most one request per TTL.
 * When KloudTrack fails, the last good response is served marked `stale`.
 *
 * Key lookup, first match wins:
 *   1. KCLOUD_API_KEY environment variable
 *   2. .env two levels up from this file: the project root in development
 *      (public/api/), the home directory above public_html on Hostinger (outside
 *      the web root, so it is never downloadable).
 */

declare(strict_types=1);

const KLOUDTRACK_URL = 'https://api.kloudtechsea.com/api/v1/telemetry/dashboard';
const CACHE_TTL = 60;
const REQUEST_TIMEOUT = 15;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function api_key(): ?string
{
    $env = getenv('KCLOUD_API_KEY');
    if (is_string($env) && $env !== '') {
        return $env;
    }
    $file = dirname(__DIR__, 2) . '/.env';
    if (!is_readable($file)) {
        return null;
    }
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (preg_match('/^\s*KCLOUD_API_KEY\s*=\s*(.*)\s*$/', $line, $m)) {
            return trim($m[1], " \t\"'") ?: null;
        }
    }
    return null;
}

function num($v): ?float
{
    return is_int($v) || is_float($v) ? (float) $v : null;
}

/** KloudTrack dashboard entry -> the public shape the site uses. Null without a location. */
function to_station(array $entry): ?array
{
    $s = $entry['station'] ?? null;
    $loc = $s['location'] ?? null; // [lon, lat]
    if (!is_array($loc) || count($loc) < 2 || !is_numeric($loc[0]) || !is_numeric($loc[1])) {
        return null;
    }
    $t = $entry['telemetry'] ?? null;
    return [
        'id' => (string) ($s['id'] ?? ''),
        'name' => (string) ($s['stationName'] ?? $s['id'] ?? 'Weather station'),
        'type' => (string) ($s['stationType'] ?? ''),
        'lat' => (float) $loc[1],
        'lon' => (float) $loc[0],
        'address' => (string) ($s['address'] ?? ''),
        'city' => (string) ($s['city'] ?? ''),
        'province' => (string) ($s['state'] ?? ''),
        'country' => (string) ($s['country'] ?? ''),
        'elevation_m' => num($s['elevation'] ?? null),
        'operator' => (string) ($s['organization']['organizationName'] ?? ''),
        'active_since' => isset($s['activatedAt']) ? (string) $s['activatedAt'] : null,
        'active' => ($s['isActive'] ?? true) !== false,
        'reading' => is_array($t) ? [
            'id' => isset($t['id']) ? (string) $t['id'] : null,
            'recorded_at' => (string) ($t['recordedAt'] ?? ''),
            'temperature_c' => num($t['temperature'] ?? null),
            'humidity_pct' => num($t['humidity'] ?? null),
            'heat_index_c' => num($t['heatIndex'] ?? null),
            'pressure_hpa' => num($t['pressure'] ?? null),
            'wind_speed_ms' => num($t['wind']['speed'] ?? $t['windSpeed'] ?? null),
            'wind_direction_deg' => num($t['wind']['direction'] ?? $t['windDirection'] ?? null),
            'precipitation_mm' => num($t['precipitation'] ?? null),
            'hourly_precipitation_mm' => num($t['hourlyPrecip'] ?? null),
            'uv_index' => num($t['uvIndex'] ?? null),
            'light_lux' => num($t['lightIntensity'] ?? null),
            'distance' => num($t['distance'] ?? null),
        ] : null,
    ];
}

/** Returns [stations, error]. */
function fetch_stations(string $key): array
{
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "x-kloudtrack-key: {$key}\r\nAccept: application/json\r\n",
            'timeout' => REQUEST_TIMEOUT,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents(KLOUDTRACK_URL, false, $ctx);
    if ($raw === false) {
        return [null, 'KloudTrack could not be reached'];
    }
    $status = 0;
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) {
            $status = (int) $m[1];
        }
    }
    $body = json_decode($raw, true);
    if ($status !== 200 || !is_array($body) || ($body['success'] ?? true) === false) {
        $msg = is_array($body) && isset($body['message']) ? (string) $body['message'] : 'unexpected response';
        return [null, "KloudTrack {$status}: {$msg}"];
    }
    $stations = array_values(array_filter(array_map('to_station', (array) ($body['data'] ?? []))));
    return [$stations, null];
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    // Browsers and the service worker may reuse it briefly; the server cache does the rest.
    header('Cache-Control: public, max-age=30');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$cacheFile = sys_get_temp_dir() . '/bettersanjose-kloudtrack-' . md5(__FILE__) . '.json';
$cached = is_readable($cacheFile) ? json_decode((string) file_get_contents($cacheFile), true) : null;

if (is_array($cached) && time() - (int) ($cached['fetched_ts'] ?? 0) < CACHE_TTL) {
    respond(['stations' => $cached['stations'], 'fetched_at' => $cached['fetched_at'], 'stale' => false]);
}

// One refresh at a time: concurrent requests wait for the lock, then reuse its result.
$lock = fopen($cacheFile . '.lock', 'c');
if ($lock) {
    flock($lock, LOCK_EX);
    $fresh = is_readable($cacheFile) ? json_decode((string) file_get_contents($cacheFile), true) : null;
    if (is_array($fresh) && time() - (int) ($fresh['fetched_ts'] ?? 0) < CACHE_TTL) {
        flock($lock, LOCK_UN);
        respond(['stations' => $fresh['stations'], 'fetched_at' => $fresh['fetched_at'], 'stale' => false]);
    }
}

$key = api_key();
[$stations, $error] = $key ? fetch_stations($key) : [null, 'Weather station is not configured'];

if ($stations !== null) {
    $entry = ['stations' => $stations, 'fetched_at' => gmdate('c'), 'fetched_ts' => time()];
    @file_put_contents($cacheFile, json_encode($entry), LOCK_EX);
    if ($lock) {
        flock($lock, LOCK_UN);
    }
    respond(['stations' => $stations, 'fetched_at' => $entry['fetched_at'], 'stale' => false]);
}

if ($lock) {
    flock($lock, LOCK_UN);
}
if (is_array($cached)) {
    respond(['stations' => $cached['stations'], 'fetched_at' => $cached['fetched_at'], 'stale' => true, 'error' => $error]);
}
respond(['stations' => [], 'fetched_at' => null, 'stale' => true, 'error' => $error], 503);
