<?php 
require_once("ServiceTypeObject.php");
class ServiceObject extends ServiceTypeObject {
    private $service_id;//int
    private $service_name;//string
    private $service_price;//float
    private $service_detail;//string
    private $service_static;//int
    private $service_image;//string
    private $service_type_id;//int
}

function getService_id() {
    return $this->service_id;
}

function setService_id($service_id) {
    $this->service_id = $service_id;
}

function getService_name() {
    return $this->service_name;
}

function setService_name($service_name) {
    $this->service_name = $service_name;
}

function getService_price() {
    return $this->service_price;
}

function setService_price($service_price) {
    $this->service_price = $service_price;
}

function getService_detail() {
    return $this->service_detail;
}

function setService_detail($service_detail) {
    $this->service_detail = $service_detail;
}

function getService_static() {
    return $this->service_static;
}

function setService_static($service_static) {
    $this->service_static = $service_static;
}

function getService_image() {
    return $this->service_image;
}

function setService_image($service_image) {
    $this->service_image = $service_image;
}

function getService_type_id() {
    return $this->service_type_id;
}

function setService_type_id($service_type_id) {
    $this->service_type_id = $service_type_id;
}


?>