<?php
/**
 * Created by PhpStorm.
 * User: cleme
 * Date: 28.01.2018
 * Time: 18:51
 */
namespace Mediatrix;

require __DIR__ . '/../vendor/autoload.php';

Preset::create($_POST['data'],$_POST['jwt']);