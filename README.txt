=== VibeBuy Lite - Frictionless Quick Buy for WooCommerce ===
Contributors: tranthien28
Tags: quick-buy, pre-order, whatsapp, telegram, woocommerce-checkout, chat-to-buy
Requires at least: 5.8
Tested up to: 6.5
Stable tag: 1.0.3
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Kill checkout friction and skyrocket your conversions with the fastest "Instant Buy" engine for WooCommerce.

== Description ==

VibeBuy Lite is not just another chat plugin; it's a **conversion powerhouse** designed to remove every single hurdle between your customer and their purchase.

Are your customers interested in your products but hesitant to finish a complex checkout? Do they want to order but still have questions? 

**Simplify the journey.** VibeBuy Lite allows your customers to leave their information instantly—whether it's a pre-order request, a custom modification, or a product inquiry—so you can receive it in real-time and provide personalized advice. No more multi-step forms, no more cart friction. Just a direct line between your customer's interest and your store's success.

While other plugins look like 2010, VibeBuy sets a new standard with a stunning, **React-powered SPA Dashboard**. Configure your entire store’s messaging strategy in a breathtaking, app-like interface that provides a premium configuration experience for store owners.

= Why VibeBuy Lite? =
* **Frictionless Quick-Buy:** One click takes the customer from product page to an order-ready message.
* **Pre-order Ready:** Perfectly suited for limited-drop products or pre-orders where speed is everything.
* **Diversify Your Orders:** Don't rely solely on complex gateways. Take orders via the platforms your customers use every day.
* **Premium Admin Experience:** A specialized React configuration engine that feels like a standalone SaaS product.
* **Smart Template Engine:** Automatically injects product details (Price, Name, Variations) into the message for zero-effort ordering.

== Installation ==

1. Upload the `vibebuy-order-connect-lite` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Access the **VibeBuy Lite** menu to launch the React Dashboard.
4. Set up your messaging handles and customize your "Quick Buy" widget in seconds.

== Frequently Asked Questions ==

= How does VibeBuy improve my conversion rate? =
By removing the mandatory multi-step checkout, you prevent "Cart Abandonment." Customers can confirm an order with a single tap, which is proven to increase conversion for mobile and social traffic.

= Can I use this for Pre-orders? =
Absolutely. VibeBuy is ideal for pre-orders where you want to secure the customer's interest immediately without forcing them through a complex payment setup right away. 

**To set up a Pre-order flow:**
1. Create a custom "Pre-order" status in your WooCommerce settings (or via a status manager plugin).
2. Enable the "Custom Order Status" feature in the VibeBuy React Dashboard.
3. Select your pre-configured "Pre-order" status from the dropdown. 
Now, all orders coming through VibeBuy will be automatically tagged as Pre-orders for easy fulfillment tracking.

= Can I use VibeBuy for product inquiries instead of direct ordering? =
Yes! If you prefer to consult with customers before they commit to an order, simply disable the **"Create Order"** functionality in the settings. This transforms the flow into a specialized **Product Inquiry** system. Customers can then fill in their details and questions, which are sent directly to your chat app. This allows you to provide personalized advice and close the sale through direct conversation without the user needing to navigate complex checkout steps.

= Does it support WooCommerce Variations? =
Yes. If a customer selects a specific size or color, VibeBuy Lite captures those selections and includes them in the instant order message.

= Is the frontend widget fast? =
Yes. The VibeBuy widget is built with lightweight Vanilla JS and loaded asynchronously. It has a near-zero footprint on your PageSpeed and Core Web Vitals scores.

== Screenshots ==

1. **The Modern Dashboard:** A look at the React-powered admin experience.
2. **One-Tap Ordering:** How customers trigger the messaging order flow.
3. **Channel Setup:** Lightning-fast configuration for WhatsApp, Telegram, and Discord.

== Changelog ==

= 1.0.3 =
* Fix: Address security and i18n issues reported in plugin scan.
* Fix: Update database queries to use wpdb->prepare().
* Feature: Centralized Pro Upgrade path via Lemon Squeezy.
* Tweak: Optimized "Quick Buy" messaging for better conversion.

= 1.0.1 =
* Initial Lite release for WordPress.org.
