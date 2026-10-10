<?php
require_once("BasicModel.php");
require_once("objects/RoomObject.php");

class RoomModel extends BasicModel {

    function addRoom(RoomObject $item) : bool {
        $sql = "INSERT INTO tblroom(
            room_number_people,room_number_bed,room_quality,
            room_bed_type,room_price,room_detail,room_area,
            room_static,room_image,room_address,room_hotel_name,room_type_id
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
        if($stmt = $this->con->prepare($sql)) {
            $number_people = $item->getRoom_number_people();//int
            $number_bed = $item->getRoom_number_bed();//int
            $quality = $item->getRoom_quality();//float
            $bed_type = $item->getRoom_bed_type();//string
            $price = $item->getRoom_price();//float
            $detail = $item->getRoom_detail();//string
            $area = $item->getRoom_area();//float
            $static = $item->getRoom_static();//int
            $image = $item->getRoom_image();//string
            $address = $item->getRoom_address();//string
            $hotel_name = $item->getRoom_hotel_name();//string
            $type = $item->getRoom_type_id();//string

            $stmt->bind_param("iidsdsdisssi",
                                $number_people,
                                $number_bed,
                                $quality,
                                $bed_type,
                                $price,
                                $detail,
                                $area,
                                $static,
                                $image,
                                $address,
                                $hotel_name,
                                $type);
                                
            return $this->addV2($stmt);
        }
        return false;
    }

    function delRoom(RoomObject $item) : bool {
        $sql = "DELETE FROM tblroom WHERE room_id=?";
        if($stmt = $this->con->prepare($sql)) {
            $id = $item->getRoom_id();
            $stmt->bind_param("i", $id);
            return $this->delV2($stmt);
        }
        return false;
    }

    function editRoom(RoomObject $item) : bool {
        $sql = "UPDATE tblroom SET room_number_people=?,room_number_bed=?,
            room_quality=?,room_bed_type=?,room_price=?,room_detail=?,
            room_area=?,room_static=?,
            room_image=?,room_address=?,room_hotel_name=?,room_type_id=? WHERE room_id=?";
        if($stmt = $this->con->prepare($sql)) {
            $number_people = $item->getRoom_number_people();//int
            $number_bed = $item->getRoom_number_bed();//int
            $quality = $item->getRoom_quality();//float
            $bed_type = $item->getRoom_bed_type();//string
            $price = $item->getRoom_price();//float
            $detail = $item->getRoom_detail();//string
            $area = $item->getRoom_area();//float
            $static = $item->getRoom_static();//int
            $image = $item->getRoom_image();//string
            $address = $item->getRoom_address();//string
            $hotel_name = $item->getRoom_hotel_name();//string
            $type = $item->getRoom_type_id();//int
            $id = $item->getRoom_id();//int
            $stmt->bind_param("iidsdsdisssii",
                                $number_people,
                                $number_bed,
                                $quality,
                                $bed_type,
                                $price,
                                $detail,
                                $area,
                                $static,
                                $image,
                                $address,
                                $hotel_name,
                                $type,
                                $id);
            return $this->editV2($stmt);
        }
        return false;
    }

    function getRoom($id) {
        $item = null;
        $sql = "SELECT * FROM tblroom
         LEFT JOIN tblroomtype
         ON tblroom.room_type_id = tblroomtype.roomtype_id
         WHERE room_id=?";
        $result = $this->getV2($sql, "i", [(int) $id]);
        if($result && $result->num_rows > 0) {
            $item = $result->fetch_object('RoomObject');
        }
        return $item;
    }

    function getRooms(RoomObject $similar, $page, $total, $sort_type = "lastest") : array {
        $list = array();
        $page = (int) $page;
        $total = (int) $total;
        if($page <= 0) {
            $page = 1;
        }
        $at = ($page - 1) * $total;
        [$where, $types, $params] = $this->createConditions($similar);
        $sql = "SELECT * FROM tblroom LEFT JOIN tblroomtype
         ON tblroom.room_type_id = tblroomtype.roomtype_id ";
        $sql .= $where;
        switch($sort_type) {
            case "pricet":
                $sql .= "ORDER BY room_price ASC ";
                break;
            case "priceg":
                $sql .= "ORDER BY room_price DESC ";
                break;
            default:
                $sql .= "ORDER BY room_id DESC ";
                break;
        }
        $sql .= "LIMIT ?, ?;";
        $result = $this->getV2($sql, $types."ii", [...$params, $at, $total]);
        if($result && $result->num_rows > 0) {
            while($item = $result->fetch_object('RoomObject')) {
                array_push($list, $item);
            }
        }
        return $list;
    }

    function countRoom(RoomObject $similar) : int {
        [$where, $types, $params] = $this->createConditions($similar);
        $sql = "SELECT COUNT(*) AS total FROM tblroom ";
        $sql .= $where;
        $sql .= ";";
        $total = 0;
        if($result = $this->getV2($sql, $types, $params)){
            if($row = $result->fetch_array()) {
                $total = $row[0];
            }
        }
        return $total;
    }

    /**
     * @return array [mệnh đề WHERE, kiểu tham số, mảng tham số]
     */
    private function createConditions(RoomObject $similar) : array {
        $conds = [];
        $types = "";
        $params = [];
        if($similar->getRoom_hotel_name() != null) {
            $key = $this->likeParam($similar->getRoom_hotel_name());
            $conds[] = "((room_hotel_name LIKE ?)
                     OR (room_address LIKE ?)
                     OR (room_bed_type LIKE ?)) ";
            $types .= "sss";
            array_push($params, $key, $key, $key);
        }
        if($similar->getRoom_type_id() != null) {
            $conds[] = "(room_type_id = ?) ";
            $types .= "i";
            $params[] = (int) $similar->getRoom_type_id();
        }
        if($similar->getRoom_address() != null) {
            $conds[] = "(room_address LIKE ?) ";
            $types .= "s";
            $params[] = $this->likeParam($similar->getRoom_address());
        }
        if($similar->getRoom_price() != null) {
            $conds[] = "(room_price < ?) ";
            $types .= "d";
            $params[] = (float) $similar->getRoom_price();
        }
        $where = count($conds) > 0 ? "WHERE ".implode(" AND ", $conds) : "";
        return [$where, $types, $params];
    }

}
?>