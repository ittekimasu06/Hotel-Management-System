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
            redirect("/hostay/admin/bills.php?err=value");
        } else {
            require_once("../app/models/BillModel.php");
            $bm = new BillModel();
            $bill = $bm->getBill($_GET["id"]);
            if($bill != null){
                $result = $bm->delBill($bill);
                if($result) {
                    redirect("/hostay/admin/bills.php?suc=del");
                } else {
                    redirect("/hostay/admin/bills.php?err=del");
                }
            } else {
                redirect("/hostay/admin/bills.php?err=noexist");
            }
        }
    }
}
?>