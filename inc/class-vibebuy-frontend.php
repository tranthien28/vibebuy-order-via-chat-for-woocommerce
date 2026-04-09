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
			VIBEBUY_VERSION,
			true
		);

		// Load static CSS directly from assets (no build required)
		$css_path = VIBEBUY_PLUGIN_DIR . 'assets/css/index.css';
		$css_ver  = file_exists( $css_path ) ? filemtime( $css_path ) : VIBEBUY_VERSION;

		wp_enqueue_style(
			'vibebuy-google-fonts',
			'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap',
			array(),
			VIBEBUY_VERSION
		);

		wp_enqueue_style(
			'vibebuy-widget-tailwind-css',
			VIBEBUY_PLUGIN_URL . 'assets/css/tailwind-utilities.css',
			array(),
			VIBEBUY_VERSION
		);

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
				$user_data['firstName']    = get_user_meta( $current_user->ID, 'billing_first_name', true );
				$user_data['lastName']     = get_user_meta( $current_user->ID, 'billing_last_name', true );
				$user_data['billingEmail'] = get_user_meta( $current_user->ID, 'billing_email', true );
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

		// Enforce Lite limits if Pro is NOT active
		if ( ! $is_pro ) {
			// 1. Disable Pro-only global toggles
			$settings['floatingSocial_enabled'] = false;
			$settings['loop_display_enabled']   = false;

			// 2. Force only 1 active channel
			if ( isset( $settings['activeChannels'] ) && is_array( $settings['activeChannels'] ) && count( $settings['activeChannels'] ) > 1 ) {
				$settings['activeChannels'] = array_slice( array_filter( $settings['activeChannels'] ), 0, 1 );
			}
		}

		$data = array(
			'apiUrl'             => esc_url_raw( rest_url( 'vibebuy/v1/' ) ),
			'nonce'              => wp_create_nonce( 'wp_rest' ),
			'assetsUrl'          => VIBEBUY_PLUGIN_URL . 'assets/',
			'settings'           => $settings,
			'currentUser'        => $user_data,
			'submittedInquiries' => VibeBuy_DB::get_user_submission_map( get_current_user_id() ),
			'channels'           => $this->get_channels_data( $is_pro ),
			'strings'            => array(
				'alreadyRequested'  => __( 'Already Requested', 'vibebuy-order-via-chat-for-woocommerce' ),
				'orderViaWhatsApp'  => __( 'Order via WhatsApp', 'vibebuy-order-via-chat-for-woocommerce' ),
				'orderVia'          => __( 'Order via', 'vibebuy-order-via-chat-for-woocommerce' ),
				'getQuote'          => __( 'Get a Quote', 'vibebuy-order-via-chat-for-woocommerce' ),
				'firstName'         => __( 'First Name', 'vibebuy-order-via-chat-for-woocommerce' ),
				'lastName'          => __( 'Last Name', 'vibebuy-order-via-chat-for-woocommerce' ),
				'email'             => __( 'Email Address', 'vibebuy-order-via-chat-for-woocommerce' ),
				'phone'             => __( 'Phone Number', 'vibebuy-order-via-chat-for-woocommerce' ),
				'note'              => __( 'Note', 'vibebuy-order-via-chat-for-woocommerce' ),
				'sendRequest'       => __( 'Connect & Order', 'vibebuy-order-via-chat-for-woocommerce' ),
				'successTitle'      => __( 'Success!', 'vibebuy-order-via-chat-for-woocommerce' ),
				'successDescription'=> __( 'Your request has been sent successfully.', 'vibebuy-order-via-chat-for-woocommerce' ),
				'enterYourName'     => __( 'Enter your name', 'vibebuy-order-via-chat-for-woocommerce' ),
				'yourEmail'         => __( 'your@email.com', 'vibebuy-order-via-chat-for-woocommerce' ),
				'hiInterested'      => __( 'Hi, I\'m interested in this product...', 'vibebuy-order-via-chat-for-woocommerce' ),
				'inquiringAbout'    => __( 'Inquiring about:', 'vibebuy-order-via-chat-for-woocommerce' ),
				'fillDetails'       => __( 'Please fill in your details to stay connected.', 'vibebuy-order-via-chat-for-woocommerce' ),
				'selectOptions'     => __( 'Select Options', 'vibebuy-order-via-chat-for-woocommerce' ),
				'outOfStock'        => __( 'Out of Stock', 'vibebuy-order-via-chat-for-woocommerce' ),
				'poweredBy'         => __( 'Powered by', 'vibebuy-order-via-chat-for-woocommerce' ),
				'quantity'          => __( 'Quantity', 'vibebuy-order-via-chat-for-woocommerce' ),
			),
		);

		// Localize templates
		$data['orderModalTemplate'] = VibeBuy_Templates::get_template_html( 'order-modal.php' );

		// Allow other integrations (like WooCommerce) to add context
		$data = apply_filters( 'vibebuy_localize_frontend_data', $data );

		wp_localize_script( 'vibebuy-widget-js', 'vibebuyWidgetData', $data );
	}

	/**
	 * Get formatted data for all registered channels.
	 */
	private function get_channels_data( $is_pro ) {
		$channels = VibeBuy_Channel_Registry::all();
		$data     = array();

		foreach ( $channels as $channel ) {
			// Safety: Skip pro channels if we are in Lite mode
			if ( ! $is_pro && $channel->is_pro() ) {
				continue;
			}

			$data[] = array(
				'id'     => $channel->get_id(),
				'name'   => $channel->get_name(),
				'is_pro' => $channel->is_pro(),
			);
		}

		return apply_filters( 'vibebuy_localize_channels_data', $data );
	}

	/**
	 * Render the DIV root where the floating React widget will mount.
	 */
	public function render_widget_root() {
		echo '<div id="vibebuy-widget-root"></div>';
	}
}

