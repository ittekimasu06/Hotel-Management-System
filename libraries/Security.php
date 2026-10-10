<?php
/**
 * Các hàm bảo mật dùng chung: session, CSRF, escape HTML, redirect.
 */

/**
 * Khởi tạo session với cookie an toàn.
 * Tự động kiểm tra CSRF token cho mọi request POST.
 */
function start_session() : void {
    if(session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params([
            "lifetime" => 0,
            "path" => "/",
            "secure" => !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off",
            "httponly" => true,
            "samesite" => "Lax",
        ]);
        ini_set("session.use_strict_mode", "1");
        session_start();
    }
    if(($_SERVER["REQUEST_METHOD"] ?? "GET") === "POST") {
        csrf_verify();
    }
}

/**
 * Escape chuỗi trước khi in ra HTML.
 */
function e($value) : string {
    return htmlspecialchars((string) ($value ?? ""), ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

/**
 * Chống chèn công thức khi xuất Excel (ô bắt đầu bằng = + - @ sẽ bị coi là văn bản).
 */
function excel_safe(array $row) : array {
    return array_map(function($value) {
        if(is_string($value) && $value !== "" && in_array($value[0], ["=", "+", "-", "@", "\t", "\r"], true)) {
            return "'".$value;
        }
        return $value;
    }, array_values($row));
}

/**
 * Chuyển hướng và dừng thực thi script.
 */
function redirect(string $url) : void {
    header("location:$url");
    exit;
}

function csrf_token() : string {
    if(session_status() !== PHP_SESSION_ACTIVE) {
        start_session();
    }
    if(empty($_SESSION["csrf_token"])) {
        $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
    }
    return $_SESSION["csrf_token"];
}

/**
 * Input ẩn chứa CSRF token, đặt trong mọi form POST.
 */
function csrf_field() : string {
    return '<input type="hidden" name="_token" value="'.csrf_token().'">';
}

/**
 * Kiểm tra CSRF token từ POST hoặc query string (dùng cho các link thực hiện hành động).
 * Dừng request với mã 403 nếu token không hợp lệ.
 */
function csrf_verify() : void {
    $token = $_POST["_token"] ?? $_GET["_token"] ?? "";
    if(!is_string($token)
        || empty($_SESSION["csrf_token"])
        || !hash_equals($_SESSION["csrf_token"], $token)) {
        http_response_code(403);
        exit("Yêu cầu không hợp lệ hoặc phiên làm việc đã hết hạn. Vui lòng tải lại trang và thử lại.");
    }
}

/**
 * Lưu thông tin đăng nhập vào session, đổi session id để chống session fixation.
 */
function login_user(UserObject $user) : void {
    session_regenerate_id(true);
    $_SESSION["user"]["id"] = $user->getUser_id();
    $_SESSION["user"]["name"] = $user->getUser_name();
    $_SESSION["user"]["email"] = $user->getUser_email();
    $_SESSION["user"]["fullname"] = $user->getUser_fullname();
    $_SESSION["user"]["permission"] = $user->getUser_permission();
}

/**
 * Dừng request nếu người dùng chưa đăng nhập vào trang quản trị hoặc không đủ quyền.
 */
function require_admin() : void {
    if(!isset($_SESSION["user"])) {
        redirect("/hostay/admin/login.php");
    }
    if(!isset($_SESSION["user"]["permission"]) || $_SESSION["user"]["permission"] < 1) {
        redirect("/hostay/admin/login.php?err=permis");
    }
}
?>
