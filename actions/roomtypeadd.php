<?php
require_once(__DIR__."/../libraries/Security.php");
start_session();
if(!isset($_SESSION["user"])) {
    redirect("/hostay/admin/login.php");
} else {
    if(!isset($_SESSION["user"]["permission"]) || $_SESSION["user"]["permission"] < 1) {
        redirect("/hostay/admin/login.php?err=permis");
    } else {
        $name = $_POST["txtName"];
        if($name != "") {
            require_once("../app/models/RoomtypeModel.php");
            $bsm = new RoomtypeModel();
            $item = new RoomtypeObject();
            $notes = $_POST["txtNotes"];
            $item->setRoomtype_name($name);
            $item->setRoomtype_notes($notes);
            $result = $bsm->addRoomtype($item);
            if($result) {
                redirect("/hostay/admin/roomtypes.php?suc=add");
            } else {
                redirect("/hostay/admin/roomtypes.php?err=add");
            }
        } else {
            redirect("/hostay/admin/roomtypes.php?err=value");
        }
    }
}
?>