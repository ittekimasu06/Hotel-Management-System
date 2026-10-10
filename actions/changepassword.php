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
            $pass = trim($_POST["txtPass"]);
            $pass1 = trim($_POST["txtPass1"]);
            $pass2 = trim($_POST["txtPass2"]);
            if($pass != "" && checkValidPassWord($pass1, $pass2)) {
                if($um->verifyPassword($user, $pass)) {
                    $user->setUser_password($pass1);
                    if($um->editUser($user, "PASS")) {
                        unset($_SESSION["user"]);
                        session_regenerate_id(true);
                        redirect("/hostay/views/login.php");
                    } else {
                        redirect("/hostay/views/profiles.php?err=upd");
                    }
                } else {
                    redirect("/hostay/views/profiles.php?err=pass");
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
