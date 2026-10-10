<?php
require_once($_SERVER["DOCUMENT_ROOT"]."/hostay/app/lib/connection.php");

class BasicModel {
    
    protected $con;

    function __construct() {
        $this->con = getConnection();
        //Tắt chế độ commit tự động
        $this->con->autocommit(false);
    }

    private function exe(string $sql) : bool {
        $result = $this->con->query($sql);
        if($result && $this->con->affected_rows > 0) {
            if($this->con->commit()) {
                return true;
            }
        }else {
            $this->con->rollback();
        }
        return false;
    }

    /**
     * execute update database with sql
     *  - Author: Nguyễn Quang Huy
     *  - cre_at: 28/10/2023
     *  - upd_at: 28/10/20203
     */
    protected function add(string $sql) : bool {
        return $this->exe($sql);
    }

    /**
     * execute update database with sql
     *  - Author: Nguyễn Quang Huy
     *  - cre_at: 28/10/2023
     *  - upd_at: 28/10/20203
     */
    protected function del(string $sql) : bool {
        return $this->exe($sql);
    }

    /**
     * execute update database with sql
     *  - Author: Nguyễn Quang Huy
     *  - cre_at: 28/10/2023
     *  - upd_at: 28/10/20203
     */
    protected function edit(string $sql) : bool {
        return $this->exe($sql);
    }

    private function exeV2(mysqli_stmt $stmt) : bool {
        try {
            if($stmt->execute()) {
                if($stmt->affected_rows > 0) {
                    if($this->con->commit()) {
                        return true;
                    }
                } else {
                    try{
                        $this->con->rollback();
                    } catch(Exception $e1) {
                        error_log($e1->getMessage());
                    }
                }
            }
        } catch(Exception $e) {
            error_log($e->getMessage());
            try{
                $this->con->rollback();
            } catch(Exception $e1) {
                error_log($e1->getMessage());
            }
        } finally {
            $stmt->close();
        }
        return false;
    }

    /**
     * execute update database with Prepared Satement
     *  - Author: Nguyễn Quang Huy
     *  - cre_at: 28/10/2023
     *  - upd_at: 28/10/20203
     */
    protected function addV2(mysqli_stmt $stmt) : bool {
        return $this->exeV2($stmt);
    }

    /**
     * execute update database with Prepared Sattement
     *  - Author: Nguyễn Quang Huy
     *  - cre_at: 28/10/2023
     *  - upd_at: 28/10/20203
     */
    protected function delV2(mysqli_stmt $stmt) : bool {
        return $this->exeV2($stmt);
    }

    /**
     * execute update database with Prepared Sattement
     *  - Author: Nguyễn Quang Huy
     *  - cre_at: 28/10/2023
     *  - upd_at: 28/10/20203
     */
    protected function editV2(mysqli_stmt $stmt) : bool {
        return $this->exeV2($stmt);
    }

    /**
     * get database with sql select
     *  - Author: Nguyễn Quang Huy
     *  - cre_at: 28/10/2023
     *  - upd_at: 28/10/20203
     */
    protected function get(string $sql) : mysqli_result | bool {
        if($result = $this->con->query($sql)) {
            return $result;
        }
        unset($sql);
        return false;
    }

    /**
     * get database with Prepared Statement
     * @param string $types  kiểu tham số của bind_param, vd: "is"
     * @param array $params  giá trị tham số
     */
    protected function getV2(string $sql, string $types = "", array $params = []) : mysqli_result | bool {
        try {
            $stmt = $this->con->prepare($sql);
            if(!$stmt) {
                return false;
            }
            if($types !== "") {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            $stmt->close();
            return $result;
        } catch(Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    /**
     * Tạo tham số cho LIKE '%key%', thoát các ký tự đặc biệt % và _
     */
    protected function likeParam(string $key) : string {
        return "%".addcslashes($key, "%_\\")."%";
    }

    function __destruct() {
        $this->con->autocommit(true);
        $this->con->close();
    }

}
?>
