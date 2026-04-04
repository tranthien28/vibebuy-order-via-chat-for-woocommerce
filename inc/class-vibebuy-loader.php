<?php
/**
 * VibeBuy Loader Class
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_Loader {

	/**
	 * Main Loader Init.
	 */
	public function init() {
		// 1. Load Core Components
		require_once VIBEBUY_PLUGIN_DIR . 'inc/class-vibebuy-admin.php';
		require_once VIBEBUY_PLUGIN_DIR . 'inc/class-vibebuy-api.php';
		require_once VIBEBUY_PLUGIN_DIR . 'inc/class-vibebuy-frontend.php';
		require_once VIBEBUY_PLUGIN_DIR . 'inc/class-vibebuy-shortcode.php';
		require_once VIBEBUY_PLUGIN_DIR . 'inc/class-vibebuy-notices.php';
		require_once VIBEBUY_PLUGIN_DIR . 'inc/class-vibebuy-templates.php';


		// 2. Load Integrations
		require_once VIBEBUY_PLUGIN_DIR . 'inc/integrations/class-vibebuy-woocommerce.php';
		require_once VIBEBUY_PLUGIN_DIR . 'inc/integrations/class-vibebuy-wpml.php';
		require_once VIBEBUY_PLUGIN_DIR . 'inc/integrations/class-vibebuy-cache.php';

		// 3. Initialize Components
		( new VibeBuy_Admin() )->init();
		( new VibeBuy_Frontend() )->init();
		( new VibeBuy_Shortcode() )->init();
		( new VibeBuy_Notices() )->init();
		( new VibeBuy_WooCommerce() )->init();

		( new VibeBuy_WPML() )->init();
		( new VibeBuy_Cache() )->init();
		
		// API is initialized via its own class hooks if any, or static init
		// Usually REST API routes are registered on 'rest_api_init'
		$api = new VibeBuy_API();
		add_action( 'rest_api_init', array( $api, 'register_routes' ) );

		// Filter for module scripts (required for Vite)
		add_filter( 'script_loader_tag', array( $this, 'add_module_to_script' ), 10, 3 );
	}

	/**
	 * Add type="module" to Vite scripts.
	 */
	public function add_module_to_script( $tag, $handle, $src ) {
		if ( in_array( $handle, array( 'vibebuy-admin-js', 'vibebuy-widget-js' ), true ) ) {
			return str_replace( '<script ', '<script type="module" ', $tag );
		}
		return $tag;
	}
}

