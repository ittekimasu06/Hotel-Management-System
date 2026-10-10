<?php
require_once(__DIR__."/../libraries/Security.php");
start_session();
csrf_verify();
if(!isset($_SESSION["user"])) {
    redirect("/hostay/views/login.php");
} else {
    if(!isset($_GET["id"]) || $_GET["id"] <= 0 || !is_numeric($_GET["id"])) {
        redirect("/hostay/views/histories.php?err=value");
    } else {
        require_once("../app/models/BillModel.php");
        $bm = new BillModel();
        $bill = $bm->getBill($_GET["id"]);
        if($bill != null){
            $isStaff = $_SESSION["user"]["permission"] > 0;
            $isOwner = $_SESSION["user"]["id"] == $bill->getBill_customer_id();
            if($isStaff || ($isOwner && $bill->getBill_is_paid() == 0)) {
                $id = $bill->getBill_id();
                $bill->setBill_cancel(1);
                $result = $bm->editBill($bill);
                if($result) {
                    if(($_SESSION["pos"] ?? "") == "bill") {
                        redirect("/hostay/admin/bill.php?id=$id&suc=upd");
                    } else {
                        redirect("/hostay/views/histories.php?suc=upd");
                    }
                } else {
                    if(($_SESSION["pos"] ?? "") == "bill") {
                        redirect("/hostay/admin/bill.php?id=$id&err=upd");
                    } else {
                        redirect("/hostay/views/histories.php?err=upd");
                    }
                }
            } else {
                redirect("/hostay/views/?err=notok");
            }
        } else {
            redirect("/hostay/views/histories.php?err=noexist");
        }
    }
}
?>