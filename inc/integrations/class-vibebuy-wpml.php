<?php
/**
 * VibeBuy WPML Integration
 * Handles Multilingual settings and string translation.
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_WPML {

	/**
	 * Initialize WPML Hooks.
	 */
	public function init() {
		// Only run if WPML is active
		if ( ! defined( 'ICL_SITEPRESS_VERSION' ) ) {
			return;
		}

		// Register Strings for translation.
		add_action( 'init', array( $this, 'register_strings' ) );

		// Hook into Rest API to handle language context.
		add_filter( 'rest_pre_serve_request', array( $this, 'rest_api_language_switch' ), 10, 4 );
	}

	/**
	 * Register strings used in VibeBuy settings for WPML.
	 */
	public function register_strings() {
		if ( ! function_exists( 'icl_register_string' ) ) {
			return;
		}

		// Examples of items to translate
		$strings = array(
			'Chat URL'           => __( 'Chat URL', 'vibebuy-order-connect-lite' ),
			'Order via Messaging' => __( 'Order via Messaging', 'vibebuy-order-connect-lite' ),
		);

		foreach ( $strings as $name => $val ) {
			icl_register_string( 'VibeBuy', $name, $val );
		}
	}

	/**
	 * Switch language in REST API based on 'lang' parameter.
	 */
	public function rest_api_language_switch( $served, $result, $request, $server ) {
		$lang = $request->get_param( 'lang' );
		if ( $lang && function_exists( 'do_action' ) ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			do_action( 'wpml_switch_language', $lang );
		}
		return $served;
	}

}
