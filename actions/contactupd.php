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
            redirect("/hostay/admin/contacts.php?err=value");
        } else {
            require_once("../app/models/ContactModel.php");
            $cm = new ContactModel();
            $contact = $cm->getContact($_GET["id"]);
            if($contact != null){
                $contact->setContact_seen(1);
                $result = $cm->editContact($contact);
                if($result) {
                    redirect("/hostay/admin/contacts.php?suc=upd");
                } else {
                    redirect("/hostay/admin/contacts.php?err=upd");
                }
            } else {
                redirect("/hostay/admin/contacts.php?err=noexist");
            }
        }
    }
}
?>