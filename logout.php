<?php
require_once(__DIR__."/libraries/Security.php");
start_session();
unset($_SESSION["user"]);
session_regenerate_id(true);
if(isset($_GET["redirect"])) {
    if($_GET["redirect"] == "admin") {
        redirect("/hostay/admin");
    }
} else {
    redirect("/hostay/views");
}
?>