<?php
/**
 * VibeBuy Admin Class
 * Handles Admin Menu, Dashboard Assets, and Review Notices.
 *
 * @package VibeBuy_Lite
 */

if (!defined('ABSPATH')) {
	exit;
}

class VibeBuy_Admin
{

	/**
	 * Initialize Admin Hooks.
	 */
	public function init()
	{
		add_action('admin_enqueue_scripts', array($this, 'enqueue_fonts'));
		add_action('admin_menu', array($this, 'add_admin_menu'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
	}

	/**
	 * Enqueue Google Fonts.
	 */
	public function enqueue_fonts()
	{
		wp_enqueue_style(
			'vibebuy-google-fonts',
			'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
			array(),
			VIBEBUY_VERSION
		);
	}



	/**
	 * Add the VibeBuy menu and submenus.
	 */
	public function add_admin_menu()
	{
		add_menu_page(
			'VibeBuy',
			'VibeBuy',
			'manage_options',
			'vibebuy',
			array($this, 'render_admin_page'),
			'dashicons-format-chat',
			56
		);

		add_submenu_page(
			'vibebuy',
			'Settings',
			'Settings',
			'manage_options',
			'vibebuy',
			array($this, 'render_admin_page')
		);
	}

	/**
	 * Enqueue scripts and styles for the admin dashboard.
	 */
	public function enqueue_admin_scripts($hook)
	{
		if (strpos($hook, 'vibebuy') === false) {
			return;
		}

		wp_enqueue_script(
			'vibebuy-admin-js',
			VIBEBUY_PLUGIN_URL . 'assets/js/admin.js',
			array('wp-element'),
			time(), // Use timestamp for dev; can be VIBEBUY_VERSION later
			true
		);

		// Static CSS: index.css (design tokens, base styles)
		$index_css_path = VIBEBUY_PLUGIN_DIR . 'assets/css/index.css';
		$index_css_ver = file_exists($index_css_path) ? filemtime($index_css_path) : VIBEBUY_VERSION;

		// Compiled Tailwind utilities
		$tw_css_path = VIBEBUY_PLUGIN_DIR . 'assets/css/tailwind-utilities.css';
		$tw_css_ver = file_exists($tw_css_path) ? filemtime($tw_css_path) : VIBEBUY_VERSION;

		wp_enqueue_style(
			'vibebuy-admin-tailwind-css',
			VIBEBUY_PLUGIN_URL . 'assets/css/tailwind-utilities.css',
			array(),
			$tw_css_ver
		);

		wp_enqueue_style(
			'vibebuy-admin-static-css',
			VIBEBUY_PLUGIN_URL . 'assets/css/index.css',
			array('vibebuy-admin-tailwind-css'),
			$index_css_ver
		);

		// Localize script for API and nonces.
		wp_localize_script('vibebuy-admin-js', 'vibebuyData', array(
			'apiUrl' => esc_url_raw(rest_url('vibebuy/v1/')),
			'nonce' => wp_create_nonce('wp_rest'),
			'homeUrl' => home_url('/'),
			'proLink' => esc_url(VIBEBUY_PRO_LINK),
			'locale' => determine_locale(),
			'lang' => defined('ICL_LANGUAGE_CODE') ? ICL_LANGUAGE_CODE : '',
			'isProInstalled' => vibebuy_is_pro_installed(),
			'isPro' => vibebuy_is_pro(),
			'logoUrl' => VIBEBUY_PLUGIN_URL . 'assets/images/vibebuy-logo.svg',
			'i18n' => $this->get_i18n_strings(),
		));

		if (function_exists('wp_set_script_translations')) {
			wp_set_script_translations('vibebuy-admin-js', 'vibebuy-order-connect-lite', VIBEBUY_PLUGIN_DIR . 'languages');
		}
	}

	/**
	 * Render the React Admin root container.
	 */
	public function render_admin_page()
	{
		echo '<div id="vibebuy-admin-root"></div>';
	}

	/**
	 * Internal helper for localized JS strings.
	 */
	private function get_i18n_strings()
	{
		return array(
			'yourChannels' => __('Your Channels', 'vibebuy-order-connect-lite'),
			'channelsSubtitle' => __('Configure each channel independently.', 'vibebuy-order-connect-lite'),
			'configure' => __('Configure', 'vibebuy-order-connect-lite'),
			'saveAll' => __('Save All Settings', 'vibebuy-order-connect-lite'),
			'saving' => __('Saving...', 'vibebuy-order-connect-lite'),
			'saved' => __('Settings saved!', 'vibebuy-order-connect-lite'),
			'saveFailed' => __('Save failed. Please try again.', 'vibebuy-order-connect-lite'),
			'widgetOn' => __('Widget ON', 'vibebuy-order-connect-lite'),
			'widgetOff' => __('Widget OFF', 'vibebuy-order-connect-lite'),
			'upgradeBtn' => __('Upgrade to Pro →', 'vibebuy-order-connect-lite'),
			'proFeature' => __('Available in Pro', 'vibebuy-order-connect-lite'),
			'unlockPro' => __('Unlock with VibeBuy Pro', 'vibebuy-order-connect-lite'),
			'proLite' => __('PRO', 'vibebuy-order-connect-lite'),
			'config' => __('Config', 'vibebuy-order-connect-lite'),
			'appearance' => __('Appearance', 'vibebuy-order-connect-lite'),
			'displayRules' => __('Display Rules', 'vibebuy-order-connect-lite'),
			'back' => __('← Back', 'vibebuy-order-connect-lite'),
			'next' => __('Next →', 'vibebuy-order-connect-lite'),
			'save' => __('Save', 'vibebuy-order-connect-lite'),
			'backToChannels' => __('← Back to Channels', 'vibebuy-order-connect-lite'),
			'branding' => __('Branding Settings', 'vibebuy-order-connect-lite'),
			'removeBranding' => __('Hide "Powered by VibeBuy" label', 'vibebuy-order-connect-lite'),
			'createOrder' => __('Create WooCommerce Order', 'vibebuy-order-connect-lite'),
		);
	}
}
