<?php
/**
 * VibeBuy REST API - Refactored for Channel Registry
 *
 * Settings schema is now fully dynamic: each channel registers its own keys.
 * Adding a new channel = no changes needed here.
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_API {

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route( 'vibebuy/v1', '/settings', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_settings' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'save_settings' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		// --- Connections Endpoints ---
		register_rest_route( 'vibebuy/v1', '/connections', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_connections' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'save_connection' ),
				'permission_callback' => '__return_true', // Public submission
			),
		) );

		register_rest_route( 'vibebuy/v1', '/connection-detail', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_connection_detail' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		register_rest_route( 'vibebuy/v1', '/check-status', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'check_submission_status' ),
				'permission_callback' => '__return_true', // Public check
			),
		) );

		register_rest_route( 'vibebuy/v1', '/activate-license', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'activate_license' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		register_rest_route( 'vibebuy/v1', '/test-notification', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'test_notification' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

	public function check_permission() {
		return current_user_can( 'manage_options' );
	}

	public function get_settings() {
		$defaults = array(
			'activeChannels'          => array( 'whatsapp' ),
			'enabled'                 => true,
			'global_message_template' => '',
			'orderModal_enabled'      => true,
			'orderModal_autoFill'     => true,
			'orderModal_autoOff'      => true,
		);
		$settings                     = get_option( 'vibebuy_lite_settings', array() );
		$settings['totalConnections'] = VibeBuy_DB::get_total_connections_count();

		$settings['activeChannels'] = array_values( $settings['activeChannels'] ?? [] );
		$settings['is_pro']         = vibebuy_is_pro();
		$settings['license_key']    = get_option( 'vibebuy_license_key', '' );

		return rest_ensure_response( wp_parse_args( $settings, array_merge( $defaults, array(
			'totalConnections' => 0,
		) ) ) );
	}

	public function save_settings( WP_REST_Request $request ) {
		$params   = $request->get_json_params();
		$settings = get_option( 'vibebuy_lite_settings', array() );

		// --- Global settings ---
		if ( isset( $params['activeChannels'] ) && is_array( $params['activeChannels'] ) ) {
			$settings['activeChannels'] = array_values( array_map( 'sanitize_text_field', $params['activeChannels'] ) );
		}
		if ( isset( $params['enabled'] ) ) {
			$settings['enabled'] = rest_sanitize_boolean( $params['enabled'] );
		}

		// --- Explicit Global Keys ---
		if ( isset( $params['global_message_template'] ) ) {
			$settings['global_message_template'] = sanitize_textarea_field( $params['global_message_template'] );
		}
		if ( isset( $params['orderModal_enabled'] ) ) {
			$settings['orderModal_enabled'] = rest_sanitize_boolean( $params['orderModal_enabled'] );
		}
		if ( isset( $params['orderModal_autoFill'] ) ) {
			$settings['orderModal_autoFill'] = rest_sanitize_boolean( $params['orderModal_autoFill'] );
		}
		if ( isset( $params['orderModal_autoOff'] ) ) {
			$settings['orderModal_autoOff'] = rest_sanitize_boolean( $params['orderModal_autoOff'] );
		}

		// --- Channel-specific settings (dynamic via registry) ---
		// Get all known keys + sanitizers from registered channels
		$schema = VibeBuy_Channel_Registry::get_all_settings_schema();
		
		// PRO: Add global pro settings to schema
		$schema = apply_filters( 'vibebuy_pro_settings_schema', $schema );

		foreach ( $schema as $key => $sanitizer ) {
			if ( $key === 'activeChannels' || $key === 'enabled' ) {
				continue; // Already handled above
			}
			if ( array_key_exists( $key, $params ) ) {
				if ( is_callable( $sanitizer ) ) {
					$settings[ $key ] = call_user_func( $sanitizer, $params[ $key ] );
				} else {
					$settings[ $key ] = sanitize_text_field( $params[ $key ] );
				}
			}
		}

		update_option( 'vibebuy_lite_settings', $settings );

		return rest_ensure_response( array(
			'success' => true,
			'message' => __( 'Settings saved successfully.', 'vibebuy-order-connect-lite' ),
			'data'    => $settings,
		) );
	}

	/**
	 * Get paged connections (Admin only).
	 */
	public function get_connections( WP_REST_Request $request ) {
		$paged    = $request->get_param( 'paged' ) ? intval( $request->get_param( 'paged' ) ) : 1;
		$per_page = $request->get_param( 'per_page' ) ? intval( $request->get_param( 'per_page' ) ) : 10;
		$search   = $request->get_param( 'search' ) ? sanitize_text_field( $request->get_param( 'search' ) ) : '';

		$results = VibeBuy_DB::get_connections( array(
			'paged'    => $paged,
			'per_page' => $per_page,
			'search'   => $search,
		) );

		if ( ! empty( $results['items'] ) ) {
			foreach ( $results['items'] as &$item ) {
				// User metadata
				$id_user        = intval( $item['user_id'] );
				$item['is_user'] = ( $id_user > 0 );
				if ( $id_user > 0 ) {
					$user_info = get_userdata( $id_user );
					$item['user_url'] = get_edit_user_link( $id_user );
					$item['user_name'] = $user_info ? $user_info->display_name : 'Unknown';
				}

				// Product metadata
				$product_id = intval( $item['product_id'] );
				$item['product_title'] = 'N/A';
				$item['product_url']   = '#';
				if ( $product_id > 0 ) {
					$product = wc_get_product( $product_id );
					if ( $product ) {
						$item['product_title'] = $product->get_title();
						$item['product_url']   = $product->get_permalink();
					}
				}

				// Format date (including time)
				$item['formatted_date'] = get_date_from_gmt( $item['created_at'], 'Y-m-d H:i:s' );
			}
		}

		return rest_ensure_response( $results );
	}

	/**
	 * Get full connection details including product inventory (Admin only).
	 */
	public function get_connection_detail( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		if ( ! $id ) {
			return new WP_Error( 'missing_id', __( 'ID is required.', 'vibebuy-order-connect-lite' ), array( 'status' => 400 ) );
		}

		global $wpdb;
		$table_name = esc_sql( VibeBuy_DB::get_table_name() );
		$cache_key  = 'connection_detail_' . $id;
		$item       = wp_cache_get( $cache_key, 'vibebuy' );

		if ( false === $item ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared
			$item = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . $table_name . ' WHERE id = %d', $id ), ARRAY_A );
			if ( $item ) {
				wp_cache_set( $cache_key, $item, 'vibebuy', 3600 );
			}
		}

		if ( ! $item ) {
			return new WP_Error( 'not_found', __( 'Connection not found.', 'vibebuy-order-connect-lite' ), array( 'status' => 404 ) );
		}

		// Hydrate details
		$product_id = intval( $item['product_id'] );
		$item['product_details'] = null;
		if ( $product_id > 0 ) {
			$product = wc_get_product( $product_id );
			if ( $product ) {
				$item['product_details'] = array(
					'id'        => $product->get_id(),
					'name'      => $product->get_title(),
					'price'     => html_entity_decode( wp_strip_all_tags( wc_price( $product->get_price() ) ) ),
					'sku'       => $product->get_sku() ?: 'N/A',
					'slug'      => $product->get_slug(),
					'inventory' => $product->managing_stock() ? $product->get_stock_quantity() : ( $product->is_in_stock() ? 'In Stock' : 'Out of Stock' ),
					'url'       => $product->get_permalink(),
				);
			}
		}

		$user_id = intval( $item['user_id'] );
		$item['user_meta'] = null;
		if ( $user_id > 0 ) {
			$user = get_userdata( $user_id );
			$item['user_meta'] = array(
				'id'   => $user_id,
				'name' => $user ? $user->display_name : 'Unknown',
				'url'  => get_edit_user_link( $user_id ),
				'role' => $user ? implode( ', ', $user->roles ) : 'N/A',
			);
		}

		$item['formatted_date'] = get_date_from_gmt( $item['created_at'], 'Y-m-d H:i:s' );
		$item['customer_phone'] = $item['customer_phone'] ?? '';
		$item['product_qty']    = intval( $item['product_qty'] ?? 1 );

		return rest_ensure_response( $item );
	}

	/**
	 * Save a new connection inquiry (Public).
	 */
	public function save_connection( WP_REST_Request $request ) {
		$params = $request->get_json_params();

		// Basic validation
		if ( empty( $params['customer_name'] ) ) {
			return new WP_Error( 'missing_fields', __( 'Name is required.', 'vibebuy-order-connect-lite' ), array( 'status' => 400 ) );
		}

		$data = array(
			'user_id'          => get_current_user_id(),
			'channel_id'       => $params['channel_id'] ?? 'global', // 'global' represents the new single-button flow
			'product_id'       => $params['product_id'] ?? 0,
			'customer_name'    => $params['customer_name'],
			'customer_email'   => $params['customer_email'] ?? '',
			'customer_phone'   => $params['customer_phone'] ?? '',
			'product_qty'      => $params['product_qty'] ?? 1,
			'customer_message' => $params['customer_message'] ?? '',
		);

		// Render template message before notifying
		$rendered_message = $this->render_template_message( $data );

		$result = VibeBuy_DB::save_connection( $data );

		if ( ! $result ) {
			return new WP_Error( 'save_failed', __( 'Failed to save inquiry.', 'vibebuy-order-connect-lite' ), array( 'status' => 500 ) );
		}

		// Trigger notifications server-side for ALL active channels
		$settings = get_option( 'vibebuy_lite_settings', array() );
		$active_channels = $settings['activeChannels'] ?? array();
		
		foreach ( $active_channels as $ch_id ) {
			$this->notify_channels( $ch_id, $rendered_message );
		}

		return rest_ensure_response( array( 'success' => true ) );
	}

	/**
	 * Render the message template with actual data.
	 * 
	 * @param array $data
	 * @return string Rendered message.
	 */
	private function render_template_message( $data ) {
		$settings = get_option( 'vibebuy_lite_settings', array() );
		$template = $settings['global_message_template'] ?? "Admin! 🛒 New Product Inquiry!\nCustomer: {{full_name}}\nPhone: {{phone}}\nProduct: {{product_name}}\nID: {{product_id}}\nSKU: {{product_sku}}\nQuantity: {{product_qty}}\nPrice: {{product_price}}\nLink: {{product_url}}\n---\nVibeBuy connect\n---";

		$product_name  = 'N/A';
		$product_sku   = 'N/A';
		$product_price = 'N/A';
		$sale_price    = 'N/A';
		$product_url   = $data['product_url'] ?? site_url();
		$product_id    = $data['product_id'] ?? 0;

		if ( ! empty( $product_id ) ) {
			$product = wc_get_product( $product_id );
			if ( $product ) {
				$product_name  = $product->get_name(); // Handles variations automatically (e.g. "Blouse - Blue")
				$product_sku   = $product->get_sku() ?: 'N/A';
				$product_price = html_entity_decode( wp_strip_all_tags( wc_price( $product->get_regular_price() ) ) );
				$sale_price    = $product->is_on_sale() ? html_entity_decode( wp_strip_all_tags( wc_price( $product->get_sale_price() ) ) ) : 'N/A';
				$product_url   = $product->get_permalink();
			}
		}

		$replacements = array(
			'{{full_name}}'         => $data['customer_name'],
			'{{customer_name}}'     => $data['customer_name'],
			'{{customer_email}}'    => $data['customer_email'],
			'{{phone}}'             => $data['customer_phone'] ?? '',
			'{{customer_phone}}'    => $data['customer_phone'] ?? '',
			'{{message}}'           => $data['customer_message'],
			'{{customer_message}}'  => $data['customer_message'],
			'{{billing_company}}'   => $data['customer_message'],
			'{{product_name}}'      => $product_name,
			'{{product_id}}'        => $product_id,
			'{{product_sku}}'       => '{{product_sku}}',
			'{{product_variation}}' => '{{product_variation}}',
			'{{product_qty}}'       => $data['product_qty'] ?? 1,
			'{{product_price}}'     => $product_price,
			'{{product_sale_price}}' => $sale_price,
			'{{product_url}}'       => $product_url,
			'{{site_url}}'          => site_url(),
			'<site_title>'          => get_bloginfo( 'name' ),
			'{{site_name}}'         => get_bloginfo( 'name' ),
			'{{order_id}}'          => 'Inquiry',
			'{{order_total}}'       => $product_price,
		);

		return str_replace( array_keys( $replacements ), array_values( $replacements ), $template );
	}

	/**
	 * Notify the specific channel about the new inquiry.
	 * 
	 * @param string $channel_id
	 * @param string $message
	 */
	private function notify_channels( $channel_id, $message ) {
		$channel = VibeBuy_Channel_Registry::get( $channel_id );
		if ( ! $channel ) {
			return;
		}

		$settings = get_option( 'vibebuy_lite_settings', array() );
		$channel->send_message( $settings, $message );
	}

	/**
	 * Check if the current user has already submitted an inquiry.
	 */
	public function check_submission_status() {
		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return rest_ensure_response( array( 'submitted' => false ) );
		}

		$has_submitted = VibeBuy_DB::has_submitted( $user_id );
		return rest_ensure_response( array( 'submitted' => $has_submitted ) );
	}

	/**
	 * Activate License Key via Lemon Squeezy.
	 */
	public function activate_license( WP_REST_Request $request ) {
		$license_key = $request->get_param( 'license_key' );

		if ( empty( $license_key ) ) {
			return new WP_Error( 'missing_key', __( 'License key is required.', 'vibebuy-order-connect-lite' ), array( 'status' => 400 ) );
		}

		$result = VibeBuy_License::check_license( $license_key );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Test notification for a specific channel
	 */
	public function test_notification( WP_REST_Request $request ) {
		$params = $request->get_json_params();
		$channel_id = isset( $params['channel_id'] ) ? sanitize_text_field( $params['channel_id'] ) : '';
		
		if ( empty( $channel_id ) ) {
			return new WP_Error( 'missing_channel', 'Channel ID is required', array( 'status' => 400 ) );
		}

		$channel = VibeBuy_Channel_Registry::get( $channel_id );
		if ( ! $channel ) {
			return new WP_Error( 'invalid_channel', 'Invalid channel identifier', array( 'status' => 400 ) );
		}

		// Ensure we have a send_message method
		if ( ! method_exists( $channel, 'send_message' ) ) {
			return new WP_Error( 'no_api_support', 'This channel does not support server-side notifications in Lite version.', array( 'status' => 400 ) );
		}

		$settings = get_option( 'vibebuy_lite_settings', array() );
		$test_data = array(
			'customer_name'    => 'VibeBuy Test User',
			'customer_phone'   => '+1 555-0123',
			'customer_message' => 'This is a professional test notification from VibeBuy.',
			'product_name'     => 'Eco-Friendly Yoga Mat',
			'product_url'      => home_url(),
			'product_price'    => '100.00',
			'product_qty'      => 1
		);

		$message = $this->render_template_message( $test_data );
		$result = $channel->send_message( $settings, $message );

		if ( is_wp_error( $result ) ) {
			return rest_ensure_response( array(
				'success' => false,
				'message' => $result->get_error_message()
			) );
		}

		return rest_ensure_response( array(
			'success' => true,
			'message' => 'Test message sent successfully!'
		) );
	}
}
