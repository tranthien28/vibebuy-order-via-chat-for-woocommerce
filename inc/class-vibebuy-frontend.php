<?php
/**
 * VibeBuy Lite - Frontend Implementation
 * Refactored to use Channel Registry.
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_Frontend {

	/**
	 * Initialize Frontend hooks.
	 */
	public function init() {
		add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue_assets' ) );
		add_action( 'wp_footer', array( $this, 'render_widget_root' ) );
	}

	/**
	 * Decide if we should load the floating widget on the page.
	 */
	public function maybe_enqueue_assets() {
		$settings = get_option( 'vibebuy_lite_settings', array() );
		
		if ( isset( $settings['enabled'] ) && ( $settings['enabled'] === false || $settings['enabled'] === 'false' ) ) {
			return;
		}

		if ( empty( $settings['activeChannels'] ) ) {
			return;
		}

		// PRO Rules Check
		$should_show = true;

		// 1. Business Hours (Implemented in Lite but respects Pro flag)
		if ( ! $this->is_within_business_hours( $settings ) ) {
			$should_show = false;
		}

		// 2. Allow Pro plugin to add more conditions (Device, Stock, Geo, etc.)
		$should_show = apply_filters( 'vibebuy_should_show_widget', $should_show, $settings );

		if ( ! $should_show ) {
			return;
		}

		self::enqueue_frontend_assets();
	}

	/**
	 * Check if current time is within business hours (Pro).
	 */
	private function is_within_business_hours( $settings ) {
		// Lite always returns true
		if ( ! vibebuy_is_pro() ) {
			return true;
		}

		$enabled = $settings['businessHours_enabled'] ?? false;
		if ( ! $enabled ) {
			return true;
		}

		$current_day = strtolower( current_time( 'D' ) ); // mon, tue...
		$hours       = $settings['businessHours_schedule'] ?? array();
		
		if ( ! isset( $hours[ $current_day ] ) || ! $hours[ $current_day ]['active'] ) {
			return false;
		}

		$current_time = current_time( 'H:i' );
		$start        = $hours[ $current_day ]['start'] ?? '00:00';
		$end          = $hours[ $current_day ]['end'] ?? '23:59';

		return ( $current_time >= $start && $current_time <= $end );
	}

	/**
	 * Static method to allow other modules (Shortcodes, WooCommerce) to trigger asset loading.
	 */
	public static function enqueue_frontend_assets() {
		if ( wp_script_is( 'vibebuy-widget-js', 'enqueued' ) ) {
			return;
		}

		wp_enqueue_script(
			'vibebuy-widget-js',
			VIBEBUY_PLUGIN_URL . 'assets/js/widget.js',
			array(),
			time(), // Use timestamp for dev; can be VIBEBUY_VERSION later
			true
		);

		// Load static CSS directly from assets (no build required)
		$css_path = VIBEBUY_PLUGIN_DIR . 'assets/css/index.css';
		$css_ver  = file_exists( $css_path ) ? filemtime( $css_path ) : VIBEBUY_VERSION;

		wp_enqueue_style(
			'vibebuy-widget-tailwind-css',
			VIBEBUY_PLUGIN_URL . 'assets/css/tailwind-utilities.css',
			array(),
			VIBEBUY_VERSION
		);

		// Load static CSS directly from assets (no build required)
		$css_path = VIBEBUY_PLUGIN_DIR . 'assets/css/index.css';
		$css_ver  = file_exists( $css_path ) ? filemtime( $css_path ) : VIBEBUY_VERSION;

		wp_enqueue_style(
			'vibebuy-widget-static-css',
			VIBEBUY_PLUGIN_URL . 'assets/css/index.css',
			array( 'vibebuy-widget-tailwind-css' ),
			$css_ver
		);

		// Get current user data for pre-filling
		$current_user = wp_get_current_user();
		$user_data    = array(
			'isLoggedIn' => $current_user->exists(),
			'firstName'  => '',
			'lastName'   => '',
			'email'      => '',
		);

		if ( $current_user->exists() ) {
			$user_data['email'] = $current_user->user_email;
			
			// Try WooCommerce billing first
			if ( class_exists( 'WooCommerce' ) ) {
				$user_data['firstName'] = get_user_meta( $current_user->ID, 'billing_first_name', true );
				$user_data['lastName']  = get_user_meta( $current_user->ID, 'billing_last_name', true );
			}

			// Fallback to WP profile names
			if ( empty( $user_data['firstName'] ) ) {
				$user_data['firstName'] = $current_user->first_name;
			}
			if ( empty( $user_data['lastName'] ) ) {
				$user_data['lastName'] = $current_user->last_name;
			}
			// One more fallback to display name if still empty
			if ( empty( $user_data['firstName'] ) ) {
				$user_data['firstName'] = $current_user->display_name;
			}
		}

		// Localize data for the widget (settings, product context, etc.)
		$settings           = get_option( 'vibebuy_lite_settings', array() );
		$is_pro             = vibebuy_is_pro();
		$settings['is_pro'] = $is_pro;

		// Enforce Lite limit: Only 1 active channel allowed
		if ( ! $is_pro && isset( $settings['activeChannels'] ) && is_array( $settings['activeChannels'] ) && count( $settings['activeChannels'] ) > 1 ) {
			$settings['activeChannels'] = array_slice( array_filter( $settings['activeChannels'] ), 0, 1 );
		}

		$data = array(
			'apiUrl'             => esc_url_raw( rest_url( 'vibebuy/v1/' ) ),
			'nonce'              => wp_create_nonce( 'wp_rest' ),
			'settings'           => $settings,
			'currentUser'        => $user_data,
			'submittedInquiries' => VibeBuy_DB::get_user_submission_map( get_current_user_id() ),
			'strings'            => array(
				'alreadyRequested'  => __( 'Already Requested', 'vibebuy-order-connect-lite' ),
				'orderViaWhatsApp'  => __( 'Order via WhatsApp', 'vibebuy-order-connect-lite' ),
				'orderVia'          => __( 'Order via', 'vibebuy-order-connect-lite' ),
				'getQuote'          => __( 'Get a Quote', 'vibebuy-order-connect-lite' ),
				'fullName'          => __( 'Full Name', 'vibebuy-order-connect-lite' ),
				'emailAddress'      => __( 'Email Address', 'vibebuy-order-connect-lite' ),
				'messageOptional'   => __( 'Message (Optional)', 'vibebuy-order-connect-lite' ),
				'send'              => __( 'Send', 'vibebuy-order-connect-lite' ),
				'requestSent'       => __( 'Request Sent!', 'vibebuy-order-connect-lite' ),
				'redirectingToChat' => __( 'Redirecting you to chat...', 'vibebuy-order-connect-lite' ),
				'enterYourName'     => __( 'Enter your name', 'vibebuy-order-connect-lite' ),
				'yourEmail'         => __( 'your@email.com', 'vibebuy-order-connect-lite' ),
				'hiInterested'      => __( 'Hi, I\'m interested in this product...', 'vibebuy-order-connect-lite' ),
				'inquiringAbout'    => __( 'Inquiring about:', 'vibebuy-order-connect-lite' ),
				'fillDetails'       => __( 'Please fill in your details to stay connected.', 'vibebuy-order-connect-lite' ),
			),
		);

		// Localize templates
		$data['orderModalTemplate'] = VibeBuy_Templates::get_template_html( 'order-modal.php' );

		// Allow other integrations (like WooCommerce) to add context
		$data = apply_filters( 'vibebuy_localize_frontend_data', $data );

		wp_localize_script( 'vibebuy-widget-js', 'vibebuyWidgetData', $data );
	}

	/**
	 * Render the DIV root where the floating React widget will mount.
	 */
	public function render_widget_root() {
		echo '<div id="vibebuy-widget-root"></div>';
	}
}
