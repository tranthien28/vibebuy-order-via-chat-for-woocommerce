<?php
/**
 * VibeBuy WooCommerce Integration
 * Handles Product-specific messaging and button injection.
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_WooCommerce {

	/**
	 * Initialize WooCommerce Hooks.
	 */
	public function init() {
		// Only run if WooCommerce is active
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		// Auto-inject buttons based on settings
		$this->setup_auto_inject();

		// Inject floating widget root
		add_action( 'wp_footer', array( $this, 'maybe_render_widget_root' ) );

		// WooCommerce specific data for the current product
		add_filter( 'vibebuy_localize_frontend_data', array( $this, 'add_product_context' ) );
	}

	/**
	 * Set up auto-injection for each active channel.
	 */
	private function setup_auto_inject() {
		$settings = get_option( 'vibebuy_lite_settings', array() );
		$active_channels = $settings['activeChannels'] ?? array();

		$hook_groups = array();

		foreach ( $active_channels as $channel_id ) {
			$channel = VibeBuy_Channel_Registry::get( $channel_id );
			if ( ! $channel ) {
				continue;
			}

			if ( $channel->is_pro() && ! vibebuy_is_pro() ) {
				continue;
			}

			$auto_inject = $settings[ $channel_id . '_wooAutoInject' ] ?? true;
			if ( ! $auto_inject || $auto_inject === 'false' ) {
				continue;
			}

			// PRO Rule: Price Range Check
			if ( is_product() ) {
				$min_price = floatval( $settings[ $channel_id . '_minPrice' ] ?? 0 );
				$max_price = floatval( $settings[ $channel_id . '_maxPrice' ] ?? 0 );
				
				// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
				global $product;
				$_product = $product;
				if ( ! is_object( $_product ) ) {
					$_product = wc_get_product( get_the_ID() );
				}
				
				if ( $_product ) {
					$price = floatval( $_product->get_price() );
					if ( $min_price > 0 && $price < $min_price ) continue;
					if ( $max_price > 0 && $price > $max_price ) continue;

					// PRO Rule: Stock Status
					$stock_condition = $settings[ $channel_id . '_stockStatus' ] ?? 'all';
					if ( 'instock' === $stock_condition && ! $_product->is_in_stock() ) continue;
					if ( 'outofstock' === $stock_condition && $_product->is_in_stock() ) continue;
				}
			}

			$hook = $settings[ $channel_id . '_wooInjectPosition' ] ?? 'woocommerce_after_add_to_cart_button';
			$hook_groups[ $hook ][] = $channel_id;

			// PRO Rule: Global Pages (Cart & Checkout)
			if ( $settings[ $channel_id . '_showOnCart' ] ?? false ) {
				$hook_groups['woocommerce_before_cart'][] = $channel_id;
			}
			if ( $settings[ $channel_id . '_showOnSuccess' ] ?? false ) {
				$hook_groups['woocommerce_thankyou'][] = $channel_id;
			}
		}

		foreach ( $hook_groups as $hook => $channels ) {
			$priority = ( strpos( $hook, 'before' ) !== false ) ? 5 : 30;
			
			add_action( $hook, function() use ( $channels, $settings ) {
				$first_channel = $channels[0];
				$display_mode  = $settings[ $first_channel . '_wooDisplayMode' ] ?? 'stack';
				
				$instance = new self();
				$instance->render_woo_group( $channels, $display_mode );
			}, $priority );
		}
	}

	/**
	 * Render a group of buttons for a specific WooCommerce hook.
	 */
	public function render_woo_group( $channels, $display_mode ) {
		if ( class_exists( 'VibeBuy_Frontend' ) ) {
			VibeBuy_Frontend::enqueue_frontend_assets();
		}

		echo sprintf(
			'<div class="vibebuy-inline-widget-group" data-woo="true" data-channels="%s" data-display="%s"></div>',
			esc_attr( implode( ',', $channels ) ),
			esc_attr( $display_mode )
		);
	}


	/**
	 * Render the widget root if on a product page or if settings allow.
	 */
	public function maybe_render_widget_root() {
		// If it's a product page, we definitely want the widget
		if ( is_product() ) {
			// Enqueue the frontend assets
			if ( class_exists( 'VibeBuy_Frontend' ) ) {
				VibeBuy_Frontend::enqueue_frontend_assets();
			}
		}
	}

	/**
	 * Add product information (name, price, SKU) to the localized JS data.
	 * 
	 * @param array $data The current localized data.
	 * @return array Modified data.
	 */
	public function add_product_context( $data ) {
		if ( ! is_product() ) {
			return $data;
		}

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
		global $product;
		$_product = $product;
		if ( ! is_object( $_product ) ) {
			$_product = wc_get_product( get_the_ID() );
		}

		if ( $_product ) {
			$data['product'] = array(
				'id'        => $_product->get_id(),
				'name'      => $_product->get_name(),
				'price'     => $_product->get_price(),
				'sku'       => $_product->get_sku(),
				'url'       => get_permalink( $_product->get_id() ),
				'image'     => get_the_post_thumbnail_url( $_product->get_id(), 'medium' ),
				'currency'  => get_woocommerce_currency_symbol(),
			);
		}

		return $data;
	}
}
