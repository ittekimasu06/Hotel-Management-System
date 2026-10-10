<?php
require_once("objects/BillstaticObject.php");
require_once("BasicModel.php");

class BillstaticModel extends BasicModel {
    
    function addBillstatic(BillstaticObject $item) : bool {
        $sql = "INSERT INTO tblbillstatic(billstatic_name, billstatic_notes) VALUES(?,?)";
        if($stmt = $this->con->prepare($sql)) {

            $name = $item->getBillstatic_name();
            $notes = $item->getBillstatic_notes();
            
            
            $stmt->bind_param("ss",$name, $notes);
            return $this->addV2($stmt);
        }
        return false;
    }

    function delBillstatic(BillstaticObject $item) : bool {
        $sql = "DELETE FROM tblbillstatic WHERE billstatic_id=?";
        if($stmt = $this->con->prepare($sql)) {
            $id = $item->getBillstatic_id();
            $stmt->bind_param("i", $id);
            return $this->delV2($stmt);
        }
        return false;
    }

    function editBillstatic(BillstaticObject $item) : bool {
        $sql = "UPDATE tblbillstatic SET billstatic_name=?,billstatic_notes=? WHERE billstatic_id=?";
        if($stmt = $this->con->prepare($sql)) {
            $name = $item->getBillstatic_name();
            $notes = $item->getBillstatic_notes();
            $id = $item->getBillstatic_id();
            $stmt->bind_param("ssi",$name, $notes,$id);
            return $this->editV2($stmt);
        }
        return false;
    }

    function getBillstatic($id) {
        $item = null;
        $sql = "SELECT * FROM tblbillstatic ";
        $sql .= "WHERE billstatic_id=?";
        $result = $this->getV2($sql, "i", [(int) $id]);
        if($result && $result->num_rows > 0) {
            $item = $result->fetch_object("BillstaticObject");
        }
        return $item;
    }

    function getBillstatics(BillstaticObject $similar, $page, $total) : array {
        $list = array();
        $page = (int) $page;
        $total = (int) $total;
        if($page <= 0) {
            $page = 1;
        }
        $at = ($page - 1) * $total;
        $sql = "SELECT * FROM tblbillstatic ";
        $sql .= "ORDER BY billstatic_id ASC ";
        $sql .= "LIMIT ?, ?;";
        $result = $this->getV2($sql, "ii", [$at, $total]);
        if($result && $result->num_rows > 0) {
            while($item = $result->fetch_object('BillstaticObject')) {
                array_push($list, $item);
            }
        }
        return $list;
    }

    function countBillstatic(BillstaticObject $similar) : int {
        $sql = "SELECT COUNT(*) AS total FROM tblbillstatic ";
        $sql .= ";";
        $total = 0;
        if($result = $this->get($sql)){
            if($row = $result->fetch_array()) {
                $total = $row[0];
            }
        }
        return $total;
    }


}
?>