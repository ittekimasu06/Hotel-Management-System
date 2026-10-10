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
            redirect("/hostay/admin/rooms.php?err=value");
        } else {
            require_once("../app/models/RoomModel.php");
            require_once("../libraries/DeleteFile.php");
            $rm = new RoomModel();
            $room = $rm->getRoom($_GET["id"]);
            if($room != null){
                $result = $rm->delRoom($room);
                if($result) {
                    DeleteFile($room->getRoom_image());
                    redirect("/hostay/admin/rooms.php?suc=del");
                } else {
                    redirect("/hostay/admin/rooms.php?err=del");
                }
            } else {
                redirect("/hostay/admin/rooms.php?err=noexist");
            }
        }
    }
}
?>