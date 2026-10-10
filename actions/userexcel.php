<?php

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

require_once(__DIR__."/../libraries/Security.php");
start_session();
if(!isset($_SESSION["user"])) {
    redirect("/hostay/admin/login.php");
} else {
    if(!isset($_SESSION["user"]["permission"]) || $_SESSION["user"]["permission"] < 1) {
        redirect("/hostay/admin/login.php?err=permis");
    } else {
        require_once("../app/models/UserModel.php");
        require_once("autoload.php");
        $um = new UserModel();
        $similar = new UserObject();
        $items = $um->getUsers($similar, 1, $um->countUser($similar));
        $excel = new Spreadsheet();
        $i = 1;
        $excel->getActiveSheet()->fromArray([
            "ID",
            "Tên đăng nhập",
            "Họ tên",
            "Email",
            "Số điện thoại",
            "Quyền",
            "Ngày tạo"], null, "A" . $i++);
        foreach ($items as $item) {
            $excel->getActiveSheet()->fromArray(excel_safe([
                $item->getUser_id(),
                $item->getUser_name(),
                $item->getUser_fullname(),
                $item->getUser_email(),
                $item->getUser_phone(),
                $item->getUser_permission(),
                $item->getUser_created_at()
            ]), null, "A" . $i++);
        }

        ob_end_clean();
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="users'.date("dmY").'.xlsx"');
        header('Cache-Control: max-age=0');
        $writer = new Xlsx($excel);
        $writer->save('php://output');
    }
}
?>