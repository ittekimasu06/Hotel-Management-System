<?php
require_once(__DIR__."/../libraries/Security.php");
start_session();
csrf_verify();
if(!isset($_SESSION["user"])) {
    redirect("/hostay/admin/login.php");
} else {
    if(!isset($_SESSION["user"]["permission"]) || $_SESSION["user"]["permission"] < 1) {
        redirect("/hostay/admin/login.php?err=permis");
    } else {
        if(!isset($_GET["id"]) || $_GET["id"] <= 0 || !is_numeric($_GET["id"])) {
            redirect("/hostay/admin/users.php?err=value");
        } else {
            if($_SESSION["user"]["id"] != $_GET["id"]) {
                require_once("../app/models/UserModel.php");
                $um = new UserModel();
                $user = $um->getUserById($_GET["id"]);
                if($user != null){
                    if($_SESSION["user"]["permission"] >= $user->getUser_permission()) {
                        $result = $um->delUser($user);
                        if($result) {
                            redirect("/hostay/admin/users.php?suc=del");
                        } else {
                            redirect("/hostay/admin/users.php?err=del");
                        }
                    } else {
                        redirect("/hostay/admin/users.php?err=permis");
                    }
                } else {
                    redirect("/hostay/admin/users.php?err=noexist");
                }
            } else {
                redirect("/hostay/admin/users.php?err=notok");
            }
        }
    }
}
?>