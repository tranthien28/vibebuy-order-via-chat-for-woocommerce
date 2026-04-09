<?php
/**
 * VibeBuy Channel Base Class
 *
 * Every channel (WhatsApp, Telegram, Zalo...) extends this class.
 * Pro plugin adds channels by creating classes that extend this and
 * then calling: VibeBuy_Channel_Registry::register(new MyProChannel());
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class VibeBuy_Channel_Base {

	/**
	 * Unique channel ID. Must match the JS channel id.
	 * Example: 'whatsapp', 'telegram', 'zalo'
	 * @return string
	 */
	abstract public function get_id(): string;

	/**
	 * Human-readable channel name.
	 * @return string
	 */
	abstract public function get_name(): string;

	/**
	 * Whether this channel requires Pro license.
	 * Lite channels return false.
	 * @return bool
	 */
	public function is_pro(): bool {
		return false;
	}

	/**
	 * List of settings keys this channel uses.
	 * Used by API to know which params to accept and sanitize.
	 * Format: ['key' => 'sanitize_callback']
	 * Example: ['whatsapp_number' => 'sanitize_text_field']
	 * @return array
	 */
	abstract public function get_settings_schema(): array;

	/**
	 * Validate settings before saving.
	 * Return null if valid, string error message if invalid.
	 * @param array $settings Full settings array for this channel
	 * @return string|null
	 */
	public function validate( array $settings ): ?string {
		return null;
	}

	/**
	 * Build the channel URL for the frontend widget.
	 * Example WhatsApp: https://wa.me/84987654321?text=...
	 * Example Telegram: https://t.me/bot_username
	 * @param array $settings Channel settings
	 * @param array|null $product WooCommerce product data (name, price, url)
	 * @return string URL
	 */
	abstract public function build_url( array $settings, ?array $product = null ): string;

	/**
	 * Get default message template for pre-filling chat.
	 * Subclasses can override for channel-specific formatting.
	 * @param array|null $product
	 * @return string
	 */
	protected function get_default_message( ?array $product ): string {
		if ( ! $product ) {
			return __( 'Hello, I want to inquire about your products.', 'vibebuy-order-via-chat-for-woocommerce' );
		}
		return sprintf(
			/* translators: 1: product name, 2: product price, 3: product url */
			__( 'Hello! I want to order: %1$s - Price: %2$s - Link: %3$s', 'vibebuy-order-via-chat-for-woocommerce' ),
			$product['name'] ?? '',
			$product['price'] ?? '',
			$product['url'] ?? ''
		);
	}

	/**
	 * Does this channel support server-side notifications?
	 * (e.g. Telegram Bot, WhatsApp API)
	 * Defaults to false for social shortcuts.
	 */
	public function supports_notifications(): bool {
		return false;
	}

	/**
	 * Get the base settings schema for EVERY channel.
	 */
	public function get_base_schema(): array {
		$id = $this->get_id();
		return [
			"{$id}_enabled"          => 'rest_sanitize_boolean',
			"{$id}_show_in_widget"   => 'rest_sanitize_boolean',
			"{$id}_message_template" => 'sanitize_textarea_field',
		];
	}

	/**
	 * Retrieve a specific setting value for this channel.
	 * Uses namespaced key: {channel_id}_{field}
	 * @param array $settings Full settings array
	 * @param string $field Field name (without channel prefix)
	 * @param mixed $default
	 * @return mixed
	 */
	protected function get_setting( array $settings, string $field, $default = '' ) {
		$key = $this->get_id() . '_' . $field;
		return $settings[ $key ] ?? $default;
	}
}

