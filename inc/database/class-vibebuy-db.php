<?php
/**
 * VibeBuy Database Handler
 * Manages the custom connections table.
 *
 * @package VibeBuy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VibeBuy_DB {

	/**
	 * Get the table name.
	 */
	public static function get_table_name() {
		global $wpdb;
		return $wpdb->prefix . 'vibebuy_leads';
	}

	/**
	 * Create the custom table using dbDelta.
	 */
	public static function create_table() {
		global $wpdb;
		$table_name      = esc_sql( self::get_table_name() );
		$charset_collate = $wpdb->get_charset_collate();

		$sql = 'CREATE TABLE ' . $table_name . ' (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			user_id bigint(20) DEFAULT 0,
			channel_id varchar(50) NOT NULL,
			product_id bigint(20) DEFAULT 0,
			customer_name varchar(255) NOT NULL,
			customer_email varchar(255) DEFAULT \'\',
			customer_phone varchar(25) DEFAULT \'\',
			product_qty int(11) DEFAULT 1,
			customer_message text DEFAULT \'\',
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY channel_id (channel_id)
		) ' . $charset_collate . ';';

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( 'vibebuy_db_version', VIBEBUY_VERSION );
	}

	/**
	 * Save a new connection inquiry.
	 */
	public static function save_connection( $data ) {
		global $wpdb;
		$table_name = esc_sql( self::get_table_name() );

		$insert_data = array(
			'user_id'          => $data['user_id'] ?? 0,
			'channel_id'       => $data['channel_id'] ?? '',
			'product_id'       => $data['product_id'] ?? 0,
			'customer_name'    => sanitize_text_field( $data['customer_name'] ?? '' ),
			'customer_email'   => sanitize_email( $data['customer_email'] ?? '' ),
			'customer_phone'   => sanitize_text_field( $data['customer_phone'] ?? '' ),
			'product_qty'      => intval( $data['product_qty'] ?? 1 ),
			'customer_message' => sanitize_textarea_field( $data['customer_message'] ?? '' ),
			'created_at'       => current_time( 'mysql' ),
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->insert(
			$table_name,
			$insert_data,
			array( '%d', '%s', '%d', '%s', '%s', '%s', '%d', '%s', '%s' )
		);

		// If failed, table might be missing or corrupted (common on localhost)
		if ( false === $result ) {
			self::create_table(); // Try to self-heal
			// Retry once
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$result = $wpdb->insert( $table_name, $insert_data, array( '%d', '%s', '%d', '%s', '%s', '%s', '%d', '%s', '%s' ) );
		}

		if ( $result !== false && ! vibebuy_is_pro() ) {
			// Keep only the most recent 10 connections for lite version.
			$table_name_clean = esc_sql( self::get_table_name() );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared
			$wpdb->query( $wpdb->prepare( 'DELETE FROM ' . $table_name_clean . ' WHERE id NOT IN ( SELECT id FROM ( SELECT id FROM ' . $table_name_clean . ' ORDER BY created_at DESC LIMIT %d ) AS tmp )', 10 ) );
			wp_cache_delete( 'total_connections_count', 'vibebuy' );
		}

		return $result;
	}

	/**
	 * Check if a user has already submitted a connection (for Auto-off).
	 */
	public static function has_submitted( $user_id ) {
		if ( ! $user_id ) {
			return false;
		}
		global $wpdb;
		$table_name = esc_sql( self::get_table_name() );
		$cache_key  = 'has_submitted_' . $user_id;
		$count      = wp_cache_get( $cache_key, 'vibebuy' );

		if ( false === $count ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared
			$count = $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . $table_name . ' WHERE user_id = %d', $user_id ) );
			wp_cache_set( $cache_key, $count, 'vibebuy', 3600 );
		}

		return $count > 0;
	}

	/**
	 * Get paged connections with search support.
	 */
	public static function get_connections( $args = array() ) {
		global $wpdb;
		$table_name = esc_sql( self::get_table_name() );

		$paged    = isset( $args['paged'] ) ? max( 1, intval( $args['paged'] ) ) : 1;
		$per_page = isset( $args['per_page'] ) ? max( 1, intval( $args['per_page'] ) ) : 10;
		$search   = isset( $args['search'] ) ? sanitize_text_field( $args['search'] ) : '';
		$offset   = ( $paged - 1 ) * $per_page;

		$cache_key   = 'connections_' . md5( serialize( $args ) );
		$cached_data = wp_cache_get( $cache_key, 'vibebuy' );

		if ( false !== $cached_data ) {
			return $cached_data;
		}

		if ( ! empty( $search ) ) {
			$search_term = '%' . $wpdb->esc_like( $search ) . '%';
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$results = $wpdb->get_results(
				$wpdb->prepare(
					'SELECT * FROM ' . $table_name . ' WHERE (customer_name LIKE %s OR customer_email LIKE %s OR customer_message LIKE %s) ORDER BY created_at DESC LIMIT %d OFFSET %d', // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
					$search_term,
					$search_term,
					$search_term,
					intval( $per_page ),
					intval( $offset )
				),
				ARRAY_A
			);

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$total = $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM ' . $table_name . ' WHERE (customer_name LIKE %s OR customer_email LIKE %s OR customer_message LIKE %s)', // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
					$search_term,
					$search_term,
					$search_term
				)
			);
		} else {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$results = $wpdb->get_results(
				$wpdb->prepare(
					'SELECT * FROM ' . $table_name . ' WHERE 1=1 ORDER BY created_at DESC LIMIT %d OFFSET %d', // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
					intval( $per_page ),
					intval( $offset )
				),
				ARRAY_A
			);

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared
			$total = $wpdb->get_var( 'SELECT COUNT(*) FROM ' . $table_name );
		}

		$data = array(
			'items' => $results,
			'total' => intval( $total ),
			'pages' => ceil( intval( $total ) / $per_page ),
		);

		wp_cache_set( $cache_key, $data, 'vibebuy', 300 );

		return $data;
	}

	/**
	 * Get a map of already submitted inquiries for a specific user.
	 *
	 * @param int $user_id
	 * @return array Array of "channel_id|product_id" strings.
	 */
	public static function get_user_submission_map( $user_id ) {
		if ( ! $user_id ) {
			return array();
		}

		global $wpdb;
		$table_name = esc_sql( self::get_table_name() );
		$cache_key  = 'user_submission_map_' . $user_id;
		$results    = wp_cache_get( $cache_key, 'vibebuy' );

		if ( false === $results ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$results = $wpdb->get_results(
				// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
				$wpdb->prepare( 'SELECT DISTINCT channel_id, product_id FROM ' . $table_name . ' WHERE user_id = %d', $user_id ),
				ARRAY_A
			);
			wp_cache_set( $cache_key, $results, 'vibebuy', 3600 );
		}

		$map = array();
		foreach ( $results as $row ) {
			$map[] = "{$row['channel_id']}|{$row['product_id']}";
		}

		return $map;
	}

	/**
	 * Get the total number of connections.
	 */
	public static function get_total_connections_count() {
		global $wpdb;
		$table_name = esc_sql( self::get_table_name() );
		$count      = wp_cache_get( 'total_connections_count', 'vibebuy' );

		if ( false === $count ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared
			$count = intval( $wpdb->get_var( 'SELECT COUNT(*) FROM ' . $table_name ) );
			wp_cache_set( 'total_connections_count', $count, 'vibebuy', 3600 );
		}

		return $count;
	}
}
