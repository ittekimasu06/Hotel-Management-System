<?php
require_once("objects/UserObject.php");
require_once("BasicModel.php");

class UserModel extends BasicModel {

    function addUser(UserObject $item) : bool {
        if(!$this->isExists($item)) {
            $sql = "INSERT INTO tbluser(
                    user_name,user_password,user_fullname,
                    user_email,user_phone,user_permission,user_created_at
                    ) VALUES(?,?,?,?,?,?,?)";
            $stmt = $this->con->prepare($sql);
            if($stmt) {
                $user_name = $item->getUser_name();
                $user_password = password_hash($item->getUser_password(), PASSWORD_DEFAULT);
                $user_email = $item->getUser_email();
                $user_fullname = $item->getUser_fullname();
                $user_phone = $item->getUser_phone();
                $user_permission = $item->getUser_permission();
                $user_ca = $item->getUser_created_at();

                $stmt->bind_param(
                    "sssssis",
                    $user_name,
                    $user_password,
                    $user_fullname,
                    $user_email,
                    $user_phone,
                    $user_permission,
                    $user_ca);

                return $this->addV2($stmt);
            }
        }
        return false;
    }

    function isExists(UserObject $item) : bool {
        $sql = "SELECT user_id FROM tbluser WHERE user_name=?";
        $result = $this->getV2($sql, "s", [$item->getUser_name()]);
        if($result && $result->num_rows > 0) {
            return true;
        }
        return false;
    }

    function delUser(UserObject $item) : bool {
        $sql = "DELETE FROM tbluser WHERE user_id=?";
        if($stmt = $this->con->prepare($sql)) {
            $id = $item->getUser_id();
            $stmt->bind_param("i",$id);
            return $this->delV2($stmt);
        }
        return false;
    }


    function editUser(UserObject $item, $type = "UPD") : bool {
        $sql = "UPDATE tbluser SET ";
        switch($type) {
            case "UPD":
                $sql .= "user_email=?,user_phone=?,user_fullname=?,
                        user_permission=? ";
                break;
            case "PASS":
                $sql .= "user_password=? ";
                break;
            default:
                return false;
        }

        $sql .= "WHERE user_id=?;";
        if($stmt = $this->con->prepare($sql)) {
            $id = $item->getUser_id();
            switch($type) {
                case "UPD":
                    $user_email = $item->getUser_email();
                    $user_fullname = $item->getUser_fullname();
                    $user_phone = $item->getUser_phone();
                    $user_permission = $item->getUser_permission();
                    $stmt->bind_param(
                        "sssii",
                        $user_email,
                        $user_phone,
                        $user_fullname,
                        $user_permission,
                        $id);
                    break;
                case "PASS":
                    $user_password = password_hash($item->getUser_password(), PASSWORD_DEFAULT);
                    $stmt->bind_param("si",$user_password,$id);
                    break;

            }
            return $this->editV2($stmt);
        }
        return false;
    }

    /**
     * Kiểm tra mật khẩu. Hỗ trợ cả hash MD5 cũ (32 ký tự hex) để không làm hỏng tài khoản đã có.
     */
    function verifyPassword(UserObject $user, string $password) : bool {
        $hash = (string) $user->getUser_password();
        if(preg_match('/^[a-f0-9]{32}$/i', $hash)) {
            return hash_equals(strtolower($hash), md5($password));
        }
        return password_verify($password, $hash);
    }

    function getUser(string $username, string $password) : UserObject | null {
        $sql = "SELECT * FROM tbluser WHERE user_name=?";
        $result = $this->getV2($sql, "s", [$username]);
        if($result && $result->num_rows > 0) {
            $user = $result->fetch_object('UserObject');
            if($this->verifyPassword($user, $password)) {
                // Nâng cấp hash cũ (MD5) sang password_hash
                if(preg_match('/^[a-f0-9]{32}$/i', (string) $user->getUser_password())
                    || password_needs_rehash($user->getUser_password(), PASSWORD_DEFAULT)) {
                    $this->rehashPassword($user, $password);
                }
                return $user;
            }
        }
        return null;
    }

    private function rehashPassword(UserObject $user, string $password) : void {
        // Chỉ nâng cấp khi cột mật khẩu đủ dài, tránh bị cắt cụt hash
        $col = $this->get("SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tbluser' AND COLUMN_NAME = 'user_password'");
        if($col && ($row = $col->fetch_array()) && (int) $row[0] >= 255) {
            $copy = new UserObject();
            $copy->setUser_id($user->getUser_id());
            $copy->setUser_password($password);
            $this->editUser($copy, "PASS");
        }
    }


    function getUserById($id) : UserObject | null {
        $user = null;
        $sql = "SELECT * FROM tbluser WHERE user_id=?";
        $result = $this->getV2($sql, "i", [(int) $id]);
        if($result && $result->num_rows > 0) {
            $user = $result->fetch_object('UserObject');
        }
        return $user;
    }


    function getUsers(UserObject $similar, $page, $total) : array {
        $list = array();
        $page = (int) $page;
        $total = (int) $total;
        if($page <= 0) {
            $page = 1;
        }
        $at = ($page - 1) * $total;
        [$where, $types, $params] = $this->createConditions($similar);
        $sql = "SELECT * FROM tbluser $where LIMIT ?, ?;";
        $result = $this->getV2($sql, $types."ii", [...$params, $at, $total]);
        if($result && $result->num_rows > 0) {
            while($user = $result->fetch_object('UserObject')) {
                array_push($list, $user);
            }
        }
        return $list;
    }

    /**
     * Đếm số lượng user
     */
    function countUser(UserObject $similar) : int {
        [$where, $types, $params] = $this->createConditions($similar);
        $sql = "SELECT COUNT(*) AS total FROM tbluser $where;";
        $total = 0;
        if($result = $this->getV2($sql, $types, $params)){
            if($row = $result->fetch_array()) {
                $total = $row[0];
            }
        }
        return $total;
    }

    private function createConditions(UserObject $similar) : array {
        if(!empty($similar->getUser_name())) {
            $search = $this->likeParam($similar->getUser_name());
            return ["WHERE ((user_name LIKE ?) || (user_fullname LIKE ?)) ", "ss", [$search, $search]];
        }
        return ["", "", []];
    }

    /**
     * @param int $time
     * @param string $option  'DAY' / 'MONTH' / 'YEAR'
     */
    function countByTime($time, $option = "DAY") {
        $sql = "SELECT COUNT(*) AS total FROM tbluser ";
        switch($option) {
            case "DAY":
                $sql .= "WHERE DAY(user_created_at) = ?";
                break;
            case "MONTH":
                $sql .= "WHERE MONTH(user_created_at) = ?";
                break;
            case "YEAR":
                $sql .= "WHERE YEAR(user_created_at) = ?";
                break;
            default:
                return 0;
        }
        $total = 0;
        if($result = $this->getV2($sql, "i", [(int) $time])){
            if($row = $result->fetch_array()) {
                $total = $row[0];
            }
        }
        return $total;
    }

}
?>
