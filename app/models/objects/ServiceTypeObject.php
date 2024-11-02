<?php


class ServiceTypeObject {
    protected $servicetype_id;
    protected $servicetype_name;
    protected $servicetype_notes;

    function getId() {
        return $this->id;
    }

    function setId($servicetype_id) {
        $this->id = $servicetype_id;

    }

    function getName() {
        return $this->name;
    }

    function setName($servicetype_name) {
        $this->name = $servicetype_name;
    }

    function getDescription() {
        return $this->description;
    }

    function setDescription($servicetype_notes) {
        $this->description = $servicetype_notes;
    }
}