<?php
require_once "../app/models/UserModel.php";

session_start();
if(isset($_POST["login"])) {
    $user_name = isset($_POST["txtUserName"]) ? trim($_POST["txtUserName"]) : null;
    $user_pass = isset($_POST["txtPass"]) ? trim($_POST["txtPass"]) : null;
    if($user_name != null && $user_name != "" && $user_pass != null && $user_pass != "") {
        $um = new UserModel();
        $user = $um->getUser($user_name, $user_pass);
        if($user != null) {
            $_SESSION["user"]["id"] = $user->getUser_id();
            $_SESSION["user"]["name"] = $user->getUser_name();
            $_SESSION["user"]["email"] = $user->getUser_email();
            $_SESSION["user"]["fullname"] = $user->getUser_fullname();
            $_SESSION["user"]["permission"] = $user->getUser_permission();
            header("location:/hostay/admin/");
        } else {
            unset($_POST);
            header("location:/hostay/admin/login.php/?err=invalid");
        }
    } else {
        header("location:/hostay/admin/login.php/?err=value");
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập</title>
    <link rel="shortcut icon" href="/hostay/public/favicon.png" type="image/x-icon">
    <link rel="stylesheet" href="/hostay/assets/vendor/bootstrap/css/bootstrap.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

        * {
            font-family: "Nunito", sans-serif;
            font-optical-sizing: auto;
        }

        body {
            padding: 0;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #71b7e6, #9b59b6);
        }

        .container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            padding: 20px;
            width: 100%;
            max-width: 500px;
            /* Giới hạn chiều rộng tối đa */
            margin: 0 auto;
            /* Căn giữa form */
        }

        .fs-3 {
            color: #333333;
            margin-bottom: 10px;
            text-align: center;
            /* Căn giữa tiêu đề */
        }

        .form-label {
            color: #555555;
            padding-left: 0px !important;
        }

        .form-control {
            border-radius: 5px;
            box-shadow: none;
            border: 1px solid #cccccc;
            margin-bottom: 15px;
            /* Khoảng cách giữa các trường */
        }

        .form-control:focus {
            border-color: #66afe9;
            box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
        }

        .btn {
            background-color: #007bff;
            border: none;
            border-radius: 5px;
            transition: background-color 0.3s;
            width: 100%;
            /* Nút bấm chiếm toàn bộ chiều rộng */
            padding: 10px;
            margin-top: 10px;
        }

        .btn:hover {
            background-color: #0056b3;
        }

        .toast-header {
            background-color: #ffdddd;
            border-bottom: none;
        }

        .toast-body {
            background-color: #ffe6e6;
        }

        .toast .btn-close {
            background: none;
            border: none;
        }
    </style>
</head>
<body>
    <div class="toast position-absolute top-5 start-50 translate-middle-x"
        role="alert"
        aria-live="assertive"
        aria-atomic="true">
        <div class="toast-header">
            <div class="rounded-circle me-2 p-2 bg-danger"></div>
            <strong class="me-auto text-danger">Error</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body text-danger">
        <?php
        if(isset($_GET["err"])) {
            switch($_GET["err"]) {
                case "invalid":
                    echo "Tài khoản hoặc mật khẩu không đúng!";
                    break;
                case "value":
                    echo "Vui lòng điền đầy đủ thông tin!";
                    break;
                case "permis":
                    echo "Bạn không đủ thẩm quyền để truy cập trang này! 
                    Vui lòng đăng nhập bằng tài khoản có quyền cao hơn!";
                    break;
                default:
                    break;
            }
        }
        ?>
        </div>
    </div>

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-sm-12 py-3">
                <form action="" method="post" class="needs-validation" novalidate>
                    <div class="row text-center mx-2 fs-3 fw-bold">
                        <p>ADMIN LOGIN</p>
                    </div>
                    <div class="row mt-3 mx-2">
                        <label for="validationCustom01" class="form-label">Tên đăng nhập</label>
                        <input type="text"
                            class="form-control"
                            id="validationCustom01"
                            name="txtUserName"
                            placeholder="Username"
                            required>
                        <div class="invalid-feedback">
                            Tên đăng nhập không được để trống!
                        </div>
                    </div>
                    <div class="row mt-3 mx-2">
                        <label for="validationCustom02" class="form-label">Mật khẩu</label>
                        <input type="password"
                            class="form-control"
                            id="validationCustom02"
                            name="txtPass"
                            placeholder="Password"
                            required>
                        <div class="invalid-feedback">
                            Hãy nhập mật khẩu!
                        </div>
                    </div>
                    <div class="row mt-3 mx-2">
                        <div class="col-md-12 d-flex justify-content-center">
                            <button type="submit" class="btn btn-primary px-4" name="login">Đăng nhập</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <script src="/hostay/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script>
        (() => {
            'use strict'

            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            const forms = document.querySelectorAll('.needs-validation')

            // Loop over them and prevent submission
            Array.from(forms).forEach(form => {
                form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
                }, false)
            })
            })()

            const toastElList = document.querySelector('.toast');
            const toast = new bootstrap.Toast(toastElList);
        <?php
        if(isset($_GET["err"])) {
            echo "toast.show();";
        }
        ?>
    </script>
</body>
</html>