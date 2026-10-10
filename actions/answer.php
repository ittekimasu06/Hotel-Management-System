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
            redirect("/hostay/admin/contacts.php?err=value");
        } else {
            require_once("../app/models/ContactModel.php");
            require_once("../libraries/Sendmail.php");
            $cm = new ContactModel();
            $item = $cm->getContact($_POST["idForPost"]);
            if($item != null){
                $message = nl2br(e($_POST["txtMessage"] ?? ""));
                $subject = "Hostay trả lời phản hồi của bạn ngày ".date("d/m/Y", strtotime($item->getContact_created_at()));
                $email = $item->getContact_email();
                if(SendMail($email, $subject, $message)) {
                    redirect("/hostay/admin/contacts.php?suc=send");
                } else {
                    redirect("/hostay/admin/contacts.php?err=send");
                }
            } else {
                redirect("/hostay/admin/contacts.php?err=noexist");
            }
        }
    }
}
?>