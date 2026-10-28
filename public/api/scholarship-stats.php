<?php
/**
 * City Scholarship Program figures, proxied from the scholarship system (SIS) at
 * https://sanjose-scholarship.betternuevaecija.org.
 *
 * The SIS endpoint needs a shared key, so this keeps SIS_PORTAL_API_KEY off the browser
 * and caches each school year's response for CACHE_TTL seconds. The SIS only returns
 * aggregate counts, never per-student data. When the SIS fails, the last good response
 * is served marked `stale`.
 *
 * Settings, first match wins (same lookup as weather-station.php):
 *   1. Environment variable
 *   2. .env two levels up from this file: the project root in development
 *      (public/api/), the home directory above public_html on Hostinger (outside
 *      the web root, so it is never downloadable).
 *
 *   SIS_PORTAL_API_KEY  required, the SIS's PORTAL_API_KEY
 *   SIS_URL             optional, defaults to the production SIS (set it for local testing)
 */

declare(strict_types=1);

const DEFAULT_SIS_URL = 'https://sanjose-scholarship.betternuevaecija.org';
const STATS_PATH = '/api/portal/scholarship-stats';
const CACHE_TTL = 600;
const REQUEST_TIMEOUT = 10;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    // Browsers and the service worker may reuse it briefly; the server cache does the rest.
    header('Cache-Control: public, max-age=300');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['error' => 'Method not allowed'], 405);
}

function setting(string $name): ?string
{
    $env = getenv($name);
    if (is_string($env) && $env !== '') {
        return $env;
    }
    $file = dirname(__DIR__, 2) . '/.env';
    if (!is_readable($file)) {
        return null;
    }
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (preg_match('/^\s*' . preg_quote($name, '/') . '\s*=\s*(.*)\s*$/', $line, $m)) {
            return trim($m[1], " \t\"'") ?: null;
        }
    }
    return null;
}

/** Returns [stats, status, error]. */
function fetch_stats(string $key, string $year): array
{
    $url = rtrim(setting('SIS_URL') ?? DEFAULT_SIS_URL, '/') . STATS_PATH;
    if ($year !== '') {
        $url .= '?' . http_build_query(['school_year' => $year]);
    }
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer {$key}\r\nAccept: application/json\r\n",
            'timeout' => REQUEST_TIMEOUT,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) {
        return [null, 0, 'Scholarship system could not be reached'];
    }
    $status = 0;
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) {
            $status = (int) $m[1];
        }
    }
    $body = json_decode($raw, true);
    if ($status !== 200 || !is_array($body) || !isset($body['semesters'], $body['school_years'])) {
        return [null, $status, "Scholarship system {$status}"];
    }
    return [$body, 200, null];
}

$year = (string) ($_GET['school_year'] ?? '');
if ($year !== '' && !preg_match('/^\d{4}-\d{4}$/', $year)) {
    respond(['error' => 'Invalid school year'], 422);
}

$cacheFile = sys_get_temp_dir() . '/bettersanjose-scholarship-' . md5(__FILE__ . $year) . '.json';
$read = fn () => is_readable($cacheFile) ? json_decode((string) file_get_contents($cacheFile), true) : null;
$fresh = fn ($c) => is_array($c) && time() - (int) ($c['fetched_ts'] ?? 0) < CACHE_TTL;

$cached = $read();
if ($fresh($cached)) {
    respond($cached['stats'] + ['stale' => false]);
}

// One refresh at a time: concurrent requests wait for the lock, then reuse its result.
$lock = fopen($cacheFile . '.lock', 'c');
if ($lock) {
    flock($lock, LOCK_EX);
    $cached = $read();
    if ($fresh($cached)) {
        flock($lock, LOCK_UN);
        respond($cached['stats'] + ['stale' => false]);
    }
}

$key = setting('SIS_PORTAL_API_KEY');
[$stats, $status, $error] = $key ? fetch_stats($key, $year) : [null, 0, 'Scholarship figures are not configured'];

if ($stats !== null) {
    @file_put_contents($cacheFile, json_encode(['stats' => $stats, 'fetched_ts' => time()]), LOCK_EX);
}
if ($lock) {
    flock($lock, LOCK_UN);
}
if ($stats !== null) {
    respond($stats + ['stale' => false]);
}
// The SIS only answers 422 for a school year it does not publish; that is not an outage.
if ($status === 422) {
    respond(['error' => 'School year not available'], 422);
}
if (is_array($cached)) {
    respond($cached['stats'] + ['stale' => true]);
}
// A 401 (wrong key) is logged here, not shown to visitors.
error_log("scholarship-stats: {$error}");
respond(['error' => 'Scholarship figures are unavailable right now'], 503);
