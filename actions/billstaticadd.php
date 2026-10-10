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
            require_once("../app/models/BillstaticModel.php");
            $bsm = new BillstaticModel();
            $item = new BillstaticObject();
            $notes = $_POST["txtNotes"];
            $item->setBillstatic_name($name);
            $item->setBillstatic_notes($notes);
            $result = $bsm->addBillstatic($item);
            if($result) {
                redirect("/hostay/admin/billstatics.php?suc=add");
            } else {
                redirect("/hostay/admin/billstatics.php?err=add");
            }
        } else {
            redirect("/hostay/admin/billstatics.php?err=value");
        }
    }
}
?>