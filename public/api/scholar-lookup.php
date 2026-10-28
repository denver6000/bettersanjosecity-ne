<?php
/**
 * Scholar lookup by Student ID, proxied to the scholarship system (SIS) at
 * https://sanjose-scholarship.betternuevaecija.org.
 *
 *   POST {student_id}                                    scholar details and every semester's
 *                                                        payout status and requirements
 *   POST ?action=update {student_id, ref, field,         sends a correction to the scholarship
 *        submitted_value, submitter_contact?}            office for review
 *
 * Keeps SIS_PORTAL_API_KEY off the browser and forwards the visitor's IP so the SIS can
 * limit each visitor (20 lookups and 5 updates a minute). Responses are personal, so
 * nothing is cached here or in the browser.
 *
 * Settings: same lookup as scholarship-stats.php (environment variable, then .env two
 * levels up). SIS_PORTAL_API_KEY is required; SIS_URL optionally overrides the production SIS.
 */

declare(strict_types=1);

const DEFAULT_SIS_URL = 'https://sanjose-scholarship.betternuevaecija.org';
const REQUEST_TIMEOUT = 10;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

$update = ($_GET['action'] ?? '') === 'update';
$fields = $update ? ['student_id', 'ref', 'field', 'submitted_value', 'submitter_contact'] : ['student_id'];

$input = json_decode((string) file_get_contents('php://input', false, null, 0, 4096), true);
if (!is_array($input)) {
    respond(['error' => 'Invalid request'], 400);
}
// Forward only the expected fields.
$body = array_intersect_key($input, array_flip($fields));

$key = setting('SIS_PORTAL_API_KEY');
if (!$key) {
    error_log('scholar-lookup: SIS_PORTAL_API_KEY is not set');
    respond(['error' => 'The scholar lookup is unavailable right now'], 503);
}

$url = rtrim(setting('SIS_URL') ?? DEFAULT_SIS_URL, '/') . ($update ? '/api/portal/scholar/updates' : '/api/portal/scholar');
$ctx = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => implode("\r\n", [
            "Authorization: Bearer {$key}",
            'Accept: application/json',
            'Content-Type: application/json',
            'X-Portal-Client-Ip: ' . ($_SERVER['REMOTE_ADDR'] ?? ''),
        ]) . "\r\n",
        'content' => json_encode($body),
        'timeout' => REQUEST_TIMEOUT,
        'ignore_errors' => true,
    ],
]);
$raw = @file_get_contents($url, false, $ctx);
$status = 0;
foreach ($http_response_header ?? [] as $h) {
    if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) {
        $status = (int) $m[1];
    }
}
$data = $raw === false ? null : json_decode($raw, true);

if (in_array($status, [200, 201], true) && is_array($data)) {
    respond($data, $status);
}
if ($status === 422 && is_array($data)) {
    respond(['error' => $data['message'] ?? 'Please check what you entered', 'errors' => $data['errors'] ?? []], 422);
}
if ($status === 429) {
    respond(['error' => 'Too many searches. Please wait a minute and try again.'], 429);
}
if ($status === 404) {
    respond(['error' => 'That record could not be found. Search your Student ID again.'], 404);
}
// A 401 (wrong key) or an outage is logged here, not shown to visitors.
error_log("scholar-lookup: scholarship system answered {$status}");
respond(['error' => 'The scholar lookup is unavailable right now. Please try again later.'], 503);
