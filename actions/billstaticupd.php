<?php
require_once(__DIR__."/../libraries/Security.php");
start_session();
if(!isset($_SESSION["user"])) {
    redirect("/hostay/admin/login.php");
} else {
    if(!isset($_SESSION["user"]["permission"]) || $_SESSION["user"]["permission"] < 1) {
        redirect("/hostay/admin/login.php?err=permis");
    } else {
        if(!isset($_POST["idForPost"]) || $_POST["idForPost"] <= 0 || !is_numeric($_POST["idForPost"])) {
            redirect("/hostay/admin/billstatics.php?err=value");
        } else {
            require_once("../app/models/BillstaticModel.php");
            $bm = new BillstaticModel();
            $item = $bm->getBillstatic($_POST["idForPost"]);
            if($item != null){
                $name = $_POST["txtName"];
                if($name != "") {
                    $notes = $_POST["txtNotes"];
                    $item->setBillstatic_name($name);
                    $item->setBillstatic_notes($notes);
                    $result = $bm->editBillstatic($item);
                    if($result) {
                        redirect("/hostay/admin/billstatics.php?suc=upd");
                    } else {
                        redirect("/hostay/admin/billstatics.php?err=upd");
                    }
                } else {
                    redirect("/hostay/admin/billstatics.php?err=value");
                }
            } else {
                redirect("/hostay/admin/billstatics.php?err=noexist");
            }
        }
    }
}
?>