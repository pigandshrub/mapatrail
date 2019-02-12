<?php

$config = array(
    "db" => array(
        "db1" => array(
            "dbname" => "mappy",
            "username" => "root",
            "password" => "somepassword",
            "host" => "localhost"
        )
    ),
    "urls" => array(
        "baseUrl" => "localhost:8888"
    ),
    "paths" => array(
        "resources" => realpath(dirname(__FILE__) . '/resources'),
        "articles" => realpath(dirname(__FILE__) . '/articles'),
        "images" => "/images",
        "css" => "/css",
        "js" => "/js"
        )
    );

/*
    Creating constants for heavily used paths
*/
defined("DB_PATH")
    or define("DB_PATH", realpath(dirname(__FILE__) . '/db'));
defined("LIB_PATH")
    or define("LIB_PATH", realpath(dirname(__FILE__) . '/lib'));
defined("INCLUDES_PATH")
    or define("INCLUDES_PATH", realpath(dirname(__FILE__) . '/includes'));

/*
    Error reporting.
*/
ini_set("error_reporting", "true");
error_reporting(E_ALL|E_STRCT);

date_default_timezone_set('Canada/Eastern');

