<?php
require_once(__DIR__."/../libraries/Security.php");
start_session();
if(isset($_POST["idForPost"]) && is_numeric($_POST["idForPost"])) {
    $id = $_POST["idForPost"];
    if($id > 0 && isset($_SESSION["user"]["id"]) && $id == $_SESSION["user"]["id"]) {
        require_once("../app/models/UserModel.php");
        require_once("../libraries/Utilities.php");
        $um = new UserModel();
        $user = $um->getUserById($id);
        if($user != null) {
            $fullname = trim($_POST["txtFullname"]);
            $email = trim($_POST["txtEmail"]);
            if($fullname != ""
                && checkEmail($email)) {
                $phone = $_POST["txtPhone"];
                $user->setUser_fullname($fullname);
                $user->setUser_email($email);
                $user->setUser_phone($phone);
                $result = $um->editUser($user);
                if($result) {
                    $_SESSION["user"]["fullname"] = $user->getUser_fullname();
                    $_SESSION["user"]["email"] = $user->getUser_email();

                    redirect("/hostay/views/profiles.php?suc=upd");
                } else {
                    redirect("/hostay/views/profiles.php?err=upd");
                }
            } else {
            redirect("/hostay/views/profiles.php?err=value");
            }
        } else {
            redirect("/hostay/views/profiles.php?err=noexist");
        }
    } else {
        redirect("/hostay/views/profiles.php?err=notok");
    }
} else {
    redirect("/hostay/views/profiles.php?err=notok");
}
?>