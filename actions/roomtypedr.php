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
            redirect("/hostay/admin/roomtypes.php?err=value");
        } else {
            require_once("../app/models/RoomtypeModel.php");
            $bsm = new RoomtypeModel();
            $bs = $bsm->getRoomtype($_GET["id"]);
            if($bs != null){
                $result = $bsm->delRoomtype($bs);
                if($result) {
                    redirect("/hostay/admin/roomtypes.php?suc=del");
                } else {
                    redirect("/hostay/admin/roomtypes.php?err=del");
                }
            } else {
                redirect("/hostay/admin/roomtypes.php?err=noexist");
            }
        }
    }
}
?>