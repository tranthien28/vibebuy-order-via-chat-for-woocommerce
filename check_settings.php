<?php
if ( ! defined( 'ABSPATH' ) ) exit;

require_once dirname(dirname(dirname(__DIR__))) . '/wp-load.php';
echo json_encode(get_option('vibebuy_lite_settings'));
