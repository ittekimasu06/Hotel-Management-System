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
        require_once("../app/models/ContactModel.php");
        require_once("autoload.php");
        $cm = new ContactModel();
        $similar = new ContactObject();
        $items = $cm->getContacts($similar, 1, $cm->countContact($similar));
        $excel = new Spreadsheet();
        $i = 1;
        $excel->getActiveSheet()->fromArray([
            "ID",
            "Họ tên",
            "Email",
            "Tiêu đề",
            "Nội dung",
            "Đã xem",
            "Ngày tạo"], null, "A" . $i++);
        foreach ($items as $item) {
            $excel->getActiveSheet()->fromArray(excel_safe((array)$item), null, "A" . $i++);
        }

        ob_end_clean();
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="contacts'.date("dmY").'.xlsx"');
        header('Cache-Control: max-age=0');
        $writer = new Xlsx($excel);
        $writer->save('php://output');
    }
}
?>