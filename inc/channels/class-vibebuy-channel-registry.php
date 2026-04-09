<?php
/**
 * VibeBuy Channel Registry
 *
 * Singleton that holds all registered channels.
 * Lite registers WhatsApp + Telegram.
 * Pro plugin calls VibeBuy_Channel_Registry::register() to add more.
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_Channel_Registry {

	/** @var VibeBuy_Channel_Base[] */
	private static array $channels = [];

	private function __construct() {}

	/**
	 * Register a channel. Called by Lite and Pro plugins.
	 * Pro plugin example:
	 *   add_action('vibebuy_register_channels', function() {
	 *       VibeBuy_Channel_Registry::register(new VibeBuy_Channel_Zalo());
	 *   });
	 * @param VibeBuy_Channel_Base $channel
	 */
	public static function register( VibeBuy_Channel_Base $channel ): void {
		self::$channels[ $channel->get_id() ] = $channel;
	}

	/**
	 * Get all registered channels.
	 * @return VibeBuy_Channel_Base[]
	 */
	public static function all(): array {
		return self::$channels;
	}

	/**
	 * Get a specific channel by ID.
	 * @param string $id
	 * @return VibeBuy_Channel_Base|null
	 */
	public static function get( string $id ): ?VibeBuy_Channel_Base {
		return self::$channels[ $id ] ?? null;
	}

	/**
	 * Get aggregated settings schema from all registered channels.
	 * Used by API to know which params to accept.
	 * @return array ['setting_key' => 'sanitize_callback']
	 */
	public static function get_all_settings_schema(): array {
		$schema = [
			// Global Branding & Visuals
			'backgroundColor'    => 'sanitize_text_field',
			'textColor'          => 'sanitize_text_field',
			'buttonText'         => 'sanitize_text_field',
			'buttonLayout'       => 'sanitize_text_field', // 'stacked', 'inline'
			'borderRadius'       => 'absint', 
			'fontSize'           => 'absint',
			
			// Global Positioning & Visibility
			'buttonPosition'     => 'sanitize_text_field', // 'before_cart', 'after_cart'
			'showOnMobile'       => 'rest_sanitize_boolean',
			'showOnDesktop'      => 'rest_sanitize_boolean',
			'orderModal_enabled' => 'rest_sanitize_boolean',
			
			// Visibility & Targeting (PRO in Lite Dashboard)
			'visibility_home'      => 'rest_sanitize_boolean',
			'visibility_shop'      => 'rest_sanitize_boolean',
			'visibility_products'  => 'rest_sanitize_boolean',
			'exclude_ids'          => 'sanitize_text_field',
			'include_ids'          => 'sanitize_text_field',
			'exclude_categories'   => 'sanitize_text_field',
			'include_categories'   => 'sanitize_text_field',
			'exclude_tags'         => 'sanitize_text_field',
			'include_tags'         => 'sanitize_text_field',

			'activeChannels'       => 'sanitize_text_field', // array handled separately
			'enabled'              => 'rest_sanitize_boolean',
		];

		foreach ( self::$channels as $channel ) {
			$schema = array_merge( 
				$schema, 
				$channel->get_base_schema(), // Adds {id}_enabled and {id}_show_in_widget
				$channel->get_settings_schema() 
			);
		}

		return $schema;
	}

	/**
	 * Get capabilities for all channels.
	 * (Whether they support notifications or are pro)
	 */
	public static function get_capabilities(): array {
		$caps = array();
		foreach ( self::$channels as $channel ) {
			$caps[ $channel->get_id() ] = array(
				'is_pro'                 => $channel->is_pro(),
				'supports_notifications' => $channel->supports_notifications(),
			);
		}
		return $caps;
	}

	/**
	 * Initialize: fire action so Pro plugins can register their channels.
	 * Call this after all Lite channels are registered.
	 */
	public static function init(): void {
		do_action( 'vibebuy_register_channels' );
	}
}
