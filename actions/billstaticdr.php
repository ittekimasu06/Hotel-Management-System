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
            redirect("/hostay/admin/billstatics.php?err=value");
        } else {
            require_once("../app/models/BillstaticModel.php");
            $bsm = new BillstaticModel();
            $bs = $bsm->getBillstatic($_GET["id"]);
            if($bs != null){
                $result = $bsm->delBillstatic($bs);
                if($result) {
                    redirect("/hostay/admin/billstatics.php?suc=del");
                } else {
                    redirect("/hostay/admin/billstatics.php?err=del");
                }
            } else {
                redirect("/hostay/admin/billstatics.php?err=noexist");
            }
        }
    }
}
?>