<?php
/**
 * VibeBuy Admin Notices
 * Handles review requests and other admin notifications.
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_Notices {

	/**
	 * Notice Configuration.
	 *
	 * @var array
	 */
	private $config;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->config = array(
			'plugin_name'         => 'VibeBuy Lite',
			'review_url'          => 'https://wordpress.org/support/plugin/vibebuy-order-connect-lite/reviews/#new-post',
			'option_name'         => 'vibebuy_review_dismissed',
			'timestamp_option'    => 'vibebuy_install_timestamp',
			'days_before_notice'  => 7, // Show notice after 7 days
		);
	}

	/**
	 * Initialize Hooks.
	 */
	public function init() {
		// Initialize install timestamp if not exists
		$install_date = get_option( $this->config['timestamp_option'] );
		if ( empty( $install_date ) ) {
			update_option( $this->config['timestamp_option'], time() );
		}

		add_action( 'admin_notices', array( $this, 'display_notice' ) );
		add_action( 'admin_footer', array( $this, 'enqueue_dismiss_script' ) );
		add_action( 'wp_ajax_vibebuy_dismiss_review', array( $this, 'dismiss_callback' ) );
	}

	/**
	 * Display the Admin Notice.
	 */
	public function display_notice() {
		// Check if already dismissed
		if ( get_option( $this->config['option_name'] ) ) {
			return;
		}

		// Check if enough time has passed
		$install_date = (int) get_option( $this->config['timestamp_option'] );
		$elapsed_days = ( time() - $install_date ) / ( 60 * 60 * 24 );

		if ( $elapsed_days < $this->config['days_before_notice'] ) {
			// return; // Uncomment to enforce the delay
		}

		?>
		<div class="notice notice-info is-dismissible" id="vibebuy-review-notice">
			<p style="font-size: 14px; margin-bottom: 6px;">
				<strong>💜 <?php echo esc_html( $this->config['plugin_name'] ); ?> - <?php esc_html_e( 'Rate our plugin', 'vibebuy-order-connect-lite' ); ?></strong>
			</p>
			<p style="margin-top: 0;">
				<?php esc_html_e( 'We work very hard on our plugin to help you improve your website, so you can sell more. Please support us by leaving feedback for our plugin.', 'vibebuy-order-connect-lite' ); ?> 
				<a href="<?php echo esc_url( $this->config['review_url'] ); ?>" target="_blank" style="font-weight: bold; text-decoration: underline;">
					<?php esc_html_e( 'Write a review', 'vibebuy-order-connect-lite' ); ?>
				</a>
			</p>
		</div>
		<?php
	}

	/**
	 * JS for dismissing the notice.
	 */
	public function enqueue_dismiss_script() {
		if ( get_option( $this->config['option_name'] ) ) {
			return;
		}
		?>
		<script>
			jQuery(document).ready(function($) {
				$(document).on('click', '#vibebuy-review-notice .notice-dismiss', function() {
					$.post(ajaxurl, {
						action: 'vibebuy_dismiss_review'
					});
				});
			});
		</script>
		<?php
	}

	/**
	 * AJAX Handler for dismissal.
	 */
	public function dismiss_callback() {
		update_option( $this->config['option_name'], '1' );
		wp_die();
	}
}
